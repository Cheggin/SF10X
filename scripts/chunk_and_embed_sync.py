#!/usr/bin/env python3
"""
Chunk and Embed 2025 Meeting Transcripts (Synchronous Version)

This script:
1. Loads 2025 meetings from Supabase
2. Chunks transcripts using semantic chunking
3. Generates embeddings using model2vec
4. Stores chunks and embeddings in Supabase
"""

import os
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import time

# Enable MPS fallback for torch on Mac
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

from loguru import logger
from sqlalchemy import create_engine, select, MetaData
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
from chonkie import SemanticChunker
from model2vec import StaticModel

# Import database models
import sys
sys.path.append(str(Path(__file__).parent.parent))
from database.models import Meeting, MeetingChunk

# Load environment variables
load_dotenv(Path(__file__).parent.parent / "local.env")

# Set up paths
project_root = Path(__file__).parent.parent
transcripts_dir = project_root / "transcripts"


class SyncChunkingPipeline:
    def __init__(self):
        """Initialize chunking pipeline with model2vec embeddings"""
        # Create synchronous database engine
        DATABASE_URL = os.getenv("SUPABASE_DB_URL")
        # Convert asyncpg URL to psycopg2 URL for sync
        sync_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        
        self.engine = create_engine(
            sync_url,
            echo=False,
            pool_pre_ping=True,
            connect_args={
                "sslmode": "require"
            }
        )
        
        self.Session = sessionmaker(bind=self.engine)
        
        # Initialize model2vec embedding model
        logger.info("Loading model2vec embeddings...")
        self.embeddings = StaticModel.from_pretrained('minishlab/potion-base-8M')
        
        # Initialize semantic chunker with model2vec
        logger.info("Initializing semantic chunker...")
        self.chunker = SemanticChunker(
            embedding_model='minishlab/potion-base-8M',
            chunk_size=1000,  # Target chunk size in tokens
            threshold=0.5,  # Threshold for semantic similarity
            min_chunk_size=200,  # Minimum chunk size
            min_sentences=1  # Minimum sentences per chunk
        )
        
        logger.info("Initialized chunking pipeline with model2vec embeddings (256 dimensions)")

    def get_2025_meetings(self, session: Session) -> List[Meeting]:
        """Get all meetings from 2025 onwards"""
        query = select(Meeting).where(
            Meeting.date >= datetime(2025, 1, 1)
        ).order_by(Meeting.date)
        
        result = session.execute(query)
        meetings = result.scalars().all()
        
        logger.info(f"Found {len(meetings)} meetings from 2025")
        return meetings

    def load_transcript(self, meeting_id: str) -> Optional[str]:
        """Load transcript from local file"""
        transcript_path = transcripts_dir / f"{meeting_id}.txt"
        
        if not transcript_path.exists():
            logger.warning(f"Transcript not found: {transcript_path}")
            return None
        
        try:
            with open(transcript_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            logger.debug(f"Loaded transcript for {meeting_id}: {len(content)} characters")
            return content
            
        except Exception as e:
            logger.error(f"Error loading transcript {meeting_id}: {e}")
            return None

    def chunk_transcript(self, transcript: str, meeting_id: str) -> List[Dict]:
        """Chunk transcript using semantic chunking"""
        try:
            # Use chonkie to create semantic chunks
            chunks = self.chunker.chunk(transcript)
            
            logger.info(f"Created {len(chunks)} chunks for meeting {meeting_id}")
            
            # Format chunks for storage
            formatted_chunks = []
            for i, chunk in enumerate(chunks):
                # Extract basic metadata that's JSON serializable
                token_count = getattr(chunk, 'token_count', len(chunk.text.split()))
                
                formatted_chunks.append({
                    'chunk_index': i,
                    'chunk_text': chunk.text,
                    'metadata': {
                        'token_count': int(token_count),
                        'chunk_length': len(chunk.text)
                    }
                })
            
            return formatted_chunks
            
        except Exception as e:
            logger.error(f"Error chunking transcript for {meeting_id}: {e}")
            return []

    def generate_embeddings(self, chunks: List[Dict]) -> List[List[float]]:
        """Generate embeddings for chunks using model2vec"""
        try:
            # Extract text from chunks
            texts = [chunk['chunk_text'] for chunk in chunks]
            
            logger.debug(f"Generating embeddings for {len(texts)} chunks")
            
            # Generate embeddings using model2vec (synchronous)
            embeddings = self.embeddings.encode(texts)
            
            # Convert numpy arrays to lists for JSON serialization
            embeddings_list = [emb.tolist() for emb in embeddings]
            
            logger.info(f"Generated {len(embeddings_list)} embeddings (256 dimensions each)")
            return embeddings_list
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return []

    def store_chunks(self, session: Session, meeting: Meeting, 
                     chunks: List[Dict], embeddings: List[List[float]]):
        """Store chunks and embeddings in database"""
        try:
            # Delete existing chunks for this meeting
            existing = session.execute(
                select(MeetingChunk).where(MeetingChunk.meeting_id == meeting.meeting_id)
            )
            for chunk in existing.scalars():
                session.delete(chunk)
            
            # Create new chunks
            for chunk_data, embedding in zip(chunks, embeddings):
                chunk = MeetingChunk(
                    meeting_id=meeting.meeting_id,
                    chunk_index=chunk_data['chunk_index'],
                    chunk_text=chunk_data['chunk_text'],
                    embedding=embedding,
                    meta_data=chunk_data.get('metadata', {})
                )
                session.add(chunk)
            
            session.commit()
            logger.info(f"Stored {len(chunks)} chunks for meeting {meeting.meeting_id}")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error storing chunks for {meeting.meeting_id}: {e}")
            raise

    def process_meeting(self, session: Session, meeting: Meeting) -> bool:
        """Process a single meeting: chunk and embed"""
        try:
            logger.info(f"Processing meeting {meeting.meeting_id}: {meeting.title}")
            
            # Load transcript
            transcript = self.load_transcript(meeting.meeting_id)
            if not transcript:
                return False
            
            # Chunk transcript
            chunks = self.chunk_transcript(transcript, meeting.meeting_id)
            if not chunks:
                return False
            
            # Generate embeddings
            embeddings = self.generate_embeddings(chunks)
            if not embeddings or len(embeddings) != len(chunks):
                logger.error(f"Embedding count mismatch for {meeting.meeting_id}")
                return False
            
            # Store in database
            self.store_chunks(session, meeting, chunks, embeddings)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing meeting {meeting.meeting_id}: {e}")
            return False

    def run(self):
        """Main execution function"""
        try:
            with self.Session() as session:
                # Get 2025 meetings
                meetings = self.get_2025_meetings(session)
                
                # Process each meeting
                success_count = 0
                failed_count = 0
                
                for i, meeting in enumerate(meetings, 1):
                    logger.info(f"Processing meeting {i}/{len(meetings)}")
                    
                    success = self.process_meeting(session, meeting)
                    if success:
                        success_count += 1
                    else:
                        failed_count += 1
                    
                    # Small delay to be respectful
                    if i < len(meetings):
                        time.sleep(0.1)
                
                logger.info(f"Chunking and embedding complete: {success_count} succeeded, {failed_count} failed")
                
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            raise


def main():
    """Main entry point"""
    logger.info("Starting synchronous chunking and embedding pipeline for 2025 meetings...")
    
    pipeline = SyncChunkingPipeline()
    pipeline.run()
    
    return 0


if __name__ == "__main__":
    exit(main())