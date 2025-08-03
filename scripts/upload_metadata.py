#!/usr/bin/env python3
"""
Upload Meeting Metadata to Supabase

This script loads meeting data from parsed_meetings.json and uploads it to Supabase PostgreSQL.
Handles duplicates by keeping the latest meeting (highest clip_id).
"""

import asyncio
import json
import os
import sys
import re
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from loguru import logger
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from database.models import Meeting

# Load environment variables
load_dotenv(project_root / "local.env")


class MetadataUploader:
    def __init__(self):
        """Initialize database connection"""
        self.supabase_db_url = os.getenv("SUPABASE_DB_URL")
        
        if not self.supabase_db_url:
            raise ValueError("Missing SUPABASE_DB_URL environment variable")
        
        # Initialize async database engine with pgbouncer compatibility
        self.engine = create_async_engine(
            self.supabase_db_url,
            connect_args={"statement_cache_size": 0}  # Required for pgbouncer
        )
        self.async_session = sessionmaker(self.engine, class_=AsyncSession)
        
        logger.info("Initialized metadata uploader")

    def load_parsed_meetings(self) -> List[Dict[str, Any]]:
        """Load meeting data from parsed JSON file"""
        json_file = project_root / "scripts" / "parsed_meetings.json"
        
        if not json_file.exists():
            raise FileNotFoundError(f"Parsed meetings file not found: {json_file}")
        
        with open(json_file, 'r') as f:
            meetings = json.load(f)
        
        logger.info(f"Loaded {len(meetings)} meetings from JSON file")
        return meetings

    def parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string in MM/DD/YY format to datetime"""
        if not date_str:
            return None
        
        try:
            # Handle MM/DD/YY format
            return datetime.strptime(date_str, '%m/%d/%y')
        except ValueError:
            try:
                # Handle MM/DD/YYYY format
                return datetime.strptime(date_str, '%m/%d/%Y')
            except ValueError:
                logger.warning(f"Could not parse date: {date_str}")
                return None

    def parse_duration(self, duration_str: str) -> Optional[timedelta]:
        """Parse duration string to timedelta"""
        if not duration_str:
            return None
        
        try:
            # Handle "6h 0m" format
            match = re.match(r'(\d+)h\s*(\d+)m', duration_str)
            if match:
                hours, minutes = map(int, match.groups())
                return timedelta(hours=hours, minutes=minutes)
            
            # Handle "HH:MM:SS" format
            match = re.match(r'(\d+):(\d+):(\d+)', duration_str)
            if match:
                hours, minutes, seconds = map(int, match.groups())
                return timedelta(hours=hours, minutes=minutes, seconds=seconds)
            
            # Handle "MM:SS" format
            match = re.match(r'(\d+):(\d+)', duration_str)
            if match:
                minutes, seconds = map(int, match.groups())
                return timedelta(minutes=minutes, seconds=seconds)
                
        except Exception as e:
            logger.warning(f"Could not parse duration '{duration_str}': {e}")
        
        return None

    async def insert_meeting(self, session: AsyncSession, meeting_data: Dict[str, Any]) -> bool:
        """Insert a single meeting into the database"""
        try:
            # Parse date and duration
            date_obj = self.parse_date(meeting_data.get('date'))
            duration_obj = self.parse_duration(meeting_data.get('duration'))
            
            # Create meeting_id from clip_id and view_id
            meeting_id = f"{meeting_data['view_id']}_{meeting_data['clip_id']}"
            
            # Check if meeting already exists
            existing = await session.execute(
                text("SELECT meeting_id FROM meetings WHERE meeting_id = :meeting_id"),
                {"meeting_id": meeting_id}
            )
            
            if existing.fetchone():
                logger.debug(f"Meeting {meeting_id} already exists, skipping")
                return False
            
            # Create Meeting object
            meeting = Meeting(
                meeting_id=meeting_id,
                clip_id=meeting_data['clip_id'],
                view_id=meeting_data['view_id'],
                department="Board of Supervisors",  # Default for view_id=10
                date=date_obj or datetime.now(),  # Use current time if date parsing fails
                duration=duration_obj,
                title=meeting_data.get('title'),
                meta_data={
                    'video_url': meeting_data.get('video_url'),
                    'agenda_url': meeting_data.get('agenda_url'),
                    'transcript_url': meeting_data.get('transcript_url'),
                    'audio_url': meeting_data.get('audio_url'),
                    'scraped_at': datetime.now().isoformat()
                }
            )
            
            session.add(meeting)
            await session.commit()
            
            logger.info(f"Inserted meeting: {meeting_id}")
            return True
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error inserting meeting {meeting_data.get('clip_id')}: {e}")
            return False

    async def upload_meetings(self, meetings: List[Dict[str, Any]]):
        """Upload all meetings to Supabase database"""
        logger.info("Starting to upload meetings to Supabase database...")
        
        # Sort by clip_id to keep latest meetings (higher clip_id = newer)
        meetings.sort(key=lambda x: int(x['clip_id']), reverse=True)
        
        inserted_count = 0
        skipped_count = 0
        
        async with self.async_session() as session:
            for meeting_data in meetings:
                if await self.insert_meeting(session, meeting_data):
                    inserted_count += 1
                else:
                    skipped_count += 1
        
        logger.info(f"Upload complete: {inserted_count} inserted, {skipped_count} skipped")

    async def run(self):
        """Main execution function"""
        try:
            # Load meetings data
            logger.info("Loading meetings data...")
            meetings = self.load_parsed_meetings()
            
            # Upload to database
            await self.upload_meetings(meetings)
            
            logger.info("Metadata upload completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during metadata upload: {e}")
            raise
        finally:
            # Close database connections
            await self.engine.dispose()


async def main():
    """Main entry point"""
    logger.info("Starting metadata upload to Supabase...")
    
    uploader = MetadataUploader()
    await uploader.run()
    
    return 0


if __name__ == "__main__":
    exit(asyncio.run(main()))