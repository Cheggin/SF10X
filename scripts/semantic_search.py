#!/usr/bin/env python3
"""
Semantic Search for Meeting Chunks

This script searches through meeting chunks using vector similarity
to find the most relevant content for a given query.
"""

import os
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np

# Enable MPS fallback for torch on Mac
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

from loguru import logger
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from model2vec import StaticModel

# Import database models
import sys
sys.path.append(str(Path(__file__).parent.parent))

# Load environment variables
load_dotenv(Path(__file__).parent.parent / "local.env")


class SemanticSearcher:
    def __init__(self):
        """Initialize semantic searcher"""
        # Create synchronous database engine
        DATABASE_URL = os.getenv("SUPABASE_DB_URL")
        sync_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        
        self.engine = create_engine(
            sync_url,
            echo=False,
            pool_pre_ping=True,
            connect_args={"sslmode": "require"}
        )
        
        self.Session = sessionmaker(bind=self.engine)
        
        # Initialize model2vec embedding model
        logger.info("Loading model2vec embeddings...")
        self.embeddings = StaticModel.from_pretrained('minishlab/potion-base-8M')
        
        logger.info("Semantic searcher initialized")

    def embed_query(self, query: str) -> List[float]:
        """Generate embedding for search query"""
        embedding = self.embeddings.encode([query])[0]
        return embedding.tolist()

    def search_chunks(self, query: str, limit: int = 10) -> List[Dict]:
        """Search for most relevant chunks using cosine similarity"""
        # Generate query embedding
        query_embedding = self.embed_query(query)
        
        # Convert to PostgreSQL array format
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        # SQL query with cosine similarity using pgvector
        sql = text(f"""
        SELECT 
            mc.meeting_id,
            mc.chunk_index,
            mc.chunk_text,
            mc.metadata,
            m.title,
            m.date,
            1 - (mc.embedding <=> '{embedding_str}'::vector) AS similarity_score
        FROM meeting_chunks mc
        JOIN meetings m ON mc.meeting_id = m.meeting_id
        WHERE m.date >= '2025-01-01'
        ORDER BY mc.embedding <=> '{embedding_str}'::vector
        LIMIT {limit}
        """)
        
        with self.Session() as session:
            result = session.execute(sql)
            
            chunks = []
            for row in result:
                chunks.append({
                    'meeting_id': row.meeting_id,
                    'chunk_index': row.chunk_index,
                    'chunk_text': row.chunk_text,
                    'metadata': row.metadata,
                    'meeting_title': row.title,
                    'meeting_date': row.date,
                    'similarity_score': float(row.similarity_score)
                })
            
            return chunks

    def search_meetings_summary(self, query: str, limit: int = 5) -> List[Dict]:
        """Get meeting-level relevance by aggregating chunk scores"""
        # Generate query embedding
        query_embedding = self.embed_query(query)
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        # SQL query to get top meetings by average similarity
        sql = text(f"""
        SELECT 
            m.meeting_id,
            m.title,
            m.date,
            COUNT(mc.id) as chunk_count,
            AVG(1 - (mc.embedding <=> '{embedding_str}'::vector)) AS avg_similarity,
            MAX(1 - (mc.embedding <=> '{embedding_str}'::vector)) AS max_similarity
        FROM meetings m
        JOIN meeting_chunks mc ON m.meeting_id = mc.meeting_id
        WHERE m.date >= '2025-01-01'
        GROUP BY m.meeting_id, m.title, m.date
        ORDER BY avg_similarity DESC
        LIMIT {limit}
        """)
        
        with self.Session() as session:
            result = session.execute(sql)
            
            meetings = []
            for row in result:
                meetings.append({
                    'meeting_id': row.meeting_id,
                    'title': row.title,
                    'date': row.date,
                    'chunk_count': row.chunk_count,
                    'avg_similarity': float(row.avg_similarity),
                    'max_similarity': float(row.max_similarity)
                })
            
            return meetings


def main():
    """Main search function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Search meeting transcripts')
    parser.add_argument('--query', '-q', default='pipeline water damage', 
                       help='Search query (default: "pipeline water damage")')
    args = parser.parse_args()
    
    query = args.query
    
    logger.info(f"Searching for: '{query}'")
    
    searcher = SemanticSearcher()
    
    # Search for most relevant chunks
    logger.info("Finding most relevant chunks...")
    chunks = searcher.search_chunks(query, limit=10)
    
    print(f"\n🔍 TOP CHUNKS FOR: '{query}'")
    print("=" * 80)
    
    for i, chunk in enumerate(chunks, 1):
        print(f"\n📄 RESULT {i} (Similarity: {chunk['similarity_score']:.3f})")
        print(f"Meeting: {chunk['meeting_title']}")
        print(f"Date: {chunk['meeting_date'].strftime('%Y-%m-%d')}")
        print(f"Meeting ID: {chunk['meeting_id']}, Chunk: {chunk['chunk_index']}")
        
        # Show first 300 characters of chunk
        text_preview = chunk['chunk_text'][:300]
        if len(chunk['chunk_text']) > 300:
            text_preview += "..."
        print(f"Text: {text_preview}")
        print("-" * 80)
    
    # Search for most relevant meetings
    logger.info("Finding most relevant meetings...")
    meetings = searcher.search_meetings_summary(query, limit=5)
    
    print(f"\n📊 TOP MEETINGS FOR: '{query}'")
    print("=" * 80)
    
    for i, meeting in enumerate(meetings, 1):
        print(f"\n🏛️  MEETING {i}")
        print(f"Title: {meeting['title']}")
        print(f"Date: {meeting['date'].strftime('%Y-%m-%d')}")
        print(f"Meeting ID: {meeting['meeting_id']}")
        print(f"Chunks: {meeting['chunk_count']}")
        print(f"Avg Similarity: {meeting['avg_similarity']:.3f}")
        print(f"Max Similarity: {meeting['max_similarity']:.3f}")
        print("-" * 80)


if __name__ == "__main__":
    main()