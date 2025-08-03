import os
import json
from typing import Optional, Tuple, List
import asyncpg
from loguru import logger
from dotenv import load_dotenv

class DatabaseService:
    def __init__(self):
        load_dotenv(dotenv_path='../.env')
        self.connection_string = os.getenv("SUPABASE_DB_URL")
        if not self.connection_string:
            # For development, don't raise error if DB URL is missing
            logger.warning("SUPABASE_DB_URL environment variable not set - database features disabled")
        self.pool = None
    
    async def init_pool(self):
        """Initialize connection pool"""
        if self.connection_string and self.pool is None:
            try:
                self.pool = await asyncpg.create_pool(
                    self.connection_string,
                    min_size=1,
                    max_size=10,
                    command_timeout=60
                )
                logger.info("Database connection pool initialized")
            except Exception as e:
                logger.error(f"Failed to create connection pool: {e}")
                raise
    
    async def get_connection(self):
        """Get database connection from pool"""
        if self.pool is None:
            await self.init_pool()
        try:
            return await self.pool.acquire()
        except Exception as e:
            logger.error(f"Failed to acquire connection from pool: {e}")
            raise
    
    async def release_connection(self, connection):
        """Release connection back to pool"""
        if self.pool and connection:
            await self.pool.release(connection)
    
    async def close_pool(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
            self.pool = None
    
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
                SELECT meeting_summary, agenda_summary 
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
                await self.release_connection(connection)
    
    async def get_timestamps(self, clip_id: str, view_id: str) -> Optional[List[dict]]:
        """
        Get timestamps/agenda items for a given clip_id and view_id
        
        Args:
            clip_id: The clip identifier
            view_id: The view identifier
            
        Returns:
            List of timestamp dictionaries or None if not found
        """
        connection = None
        try:
            connection = await self.get_connection()

            meeting_id = f"{view_id}_{clip_id}"
            query = """
                SELECT agenda_timestamps 
                FROM meetings
                WHERE meeting_id = $1
            """
            
            result = await connection.fetchrow(query, meeting_id)
            
            if result and result['agenda_timestamps']:
                timestamps = result['agenda_timestamps']
                # Parse JSON strings in the array
                if isinstance(timestamps, list):
                    parsed_timestamps = []
                    for timestamp in timestamps:
                        if isinstance(timestamp, str):
                            parsed_timestamps.append(json.loads(timestamp))
                        else:
                            parsed_timestamps.append(timestamp)
                    return parsed_timestamps
                elif isinstance(timestamps, str):
                    return json.loads(timestamps)
                else:
                    return timestamps
            
            return None
            
        except Exception as e:
            meeting_id = f"{view_id}_{clip_id}"
            logger.error(f"Database query failed for meeting_id={meeting_id}: {e}")
            raise
        finally:
            if connection:
                await self.release_connection(connection)


# Global instance
db_service = DatabaseService()