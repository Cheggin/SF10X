import os
import json
from typing import Optional, Tuple, List
import asyncpg
from loguru import logger
from dotenv import load_dotenv

class DatabaseService:
    def __init__(self):
        load_dotenv(dotenv_path='../local.env')
        self.connection_string = os.getenv("SUPABASE_DB_URL")
        if not self.connection_string:
            raise ValueError("SUPABASE_DB_URL environment variable is required")
    
    async def get_connection(self):
        """Get database connection"""
        try:
            connection = await asyncpg.connect(self.connection_string)
            return connection
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    async def get_meeting_summary(self, meeting_id: str) -> Optional[Tuple[str, List[dict]]]:
        """
        Get meeting summary and agenda summary by meeting_id
        
        Args:
            meeting_id: The meeting ID (clip_id + "_" + view_id)
            
        Returns:
            Tuple of (meeting_summary, agenda_summary_list) or None if not found
        """
        connection = None
        try:
            connection = await self.get_connection()
            
            query = """
                SELECT department 
                FROM meetings
                WHERE meeting_id = $1
            """
            
            result = await connection.fetchrow(query, meeting_id)
            
            if result:
                meeting_summary = result['meeting_summary']
                agenda_summary_json = result['agenda_summary']
                
                # Parse JSON if it's a string
                if isinstance(agenda_summary_json, str):
                    agenda_summary = json.loads(agenda_summary_json)
                else:
                    agenda_summary = agenda_summary_json
                
                return meeting_summary, agenda_summary
            
            return None
            
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            raise
        finally:
            if connection:
                await connection.close()


# Global instance
db_service = DatabaseService()