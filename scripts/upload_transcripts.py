#!/usr/bin/env python3
"""
Upload Transcripts to Supabase Object Storage

This script uploads transcript text files from the local transcripts/ directory 
to Supabase object storage.
"""

import os
import sys
from pathlib import Path
from typing import List

from loguru import logger
from supabase import create_client, Client
from dotenv import load_dotenv

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Load environment variables
load_dotenv(project_root / "local.env")


class TranscriptUploader:
    def __init__(self):
        """Initialize Supabase client"""
        self.supabase_url = os.getenv("SUPABASE_PROJECT_URL")
        self.supabase_key = os.getenv("SUPABASE_SECRET_API_KEY")
        self.bucket_name = os.getenv("SUPABASE_BUCKET_NAME")
        
        if not all([self.supabase_url, self.supabase_key, self.bucket_name]):
            raise ValueError("Missing required Supabase environment variables")
        
        # Initialize Supabase client
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Set transcripts directory
        self.transcripts_dir = project_root / "transcripts"
        
        if not self.transcripts_dir.exists():
            raise FileNotFoundError(f"Transcripts directory not found: {self.transcripts_dir}")
        
        logger.info(f"Initialized transcript uploader for bucket: {self.bucket_name}")

    def get_local_transcript_files(self) -> List[Path]:
        """Get list of transcript files in local directory"""
        transcript_files = list(self.transcripts_dir.glob("*.txt"))
        logger.info(f"Found {len(transcript_files)} transcript files locally")
        return transcript_files

    def get_uploaded_transcripts(self) -> set:
        """Get list of transcripts already uploaded to Supabase storage"""
        try:
            # List files in the transcripts folder
            result = self.supabase.storage.from_(self.bucket_name).list("transcripts/")
            
            if result:
                uploaded_files = {file['name'] for file in result}
                logger.info(f"Found {len(uploaded_files)} transcripts already uploaded")
                return uploaded_files
            else:
                logger.info("No transcripts found in storage")
                return set()
                
        except Exception as e:
            logger.warning(f"Could not list existing files in storage: {e}")
            return set()

    def upload_transcript(self, local_file: Path) -> bool:
        """Upload a single transcript file to Supabase storage"""
        try:
            # Read transcript content
            with open(local_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Define storage path
            storage_path = f"transcripts/{local_file.name}"
            
            # Upload to Supabase storage
            result = self.supabase.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=content.encode('utf-8'),
                file_options={
                    "content-type": "text/plain",
                    "upsert": "true"  # Allow overwriting existing files
                }
            )
            
            logger.info(f"Uploaded transcript: {storage_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error uploading {local_file.name}: {e}")
            return False

    def run(self):
        """Main execution function"""
        try:
            # Get local transcript files
            local_files = self.get_local_transcript_files()
            
            if not local_files:
                logger.warning("No transcript files found locally")
                return
            
            # Get already uploaded files
            uploaded_files = self.get_uploaded_transcripts()
            
            # Filter files that need to be uploaded
            files_to_upload = [
                f for f in local_files 
                if f.name not in uploaded_files
            ]
            
            logger.info(f"Need to upload {len(files_to_upload)} transcript files")
            
            if not files_to_upload:
                logger.info("All transcripts are already uploaded")
                return
            
            # Upload transcripts
            uploaded_count = 0
            failed_count = 0
            
            for file_path in files_to_upload:
                logger.info(f"Uploading: {file_path.name}")
                
                if self.upload_transcript(file_path):
                    uploaded_count += 1
                else:
                    failed_count += 1
            
            logger.info(f"Upload complete: {uploaded_count} uploaded, {failed_count} failed")
            
        except Exception as e:
            logger.error(f"Error during transcript upload: {e}")
            raise


def main():
    """Main entry point"""
    logger.info("Starting transcript upload to Supabase storage...")
    
    uploader = TranscriptUploader()
    uploader.run()
    
    logger.info("Transcript upload completed!")
    return 0


if __name__ == "__main__":
    exit(main())