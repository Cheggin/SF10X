import os
import json
import re
from typing import List, Dict, Any
from pathlib import Path
import asyncio
import asyncpg
from dotenv import load_dotenv

from app.constants import ModelName
from app.summarizer import Summarizer
from app.schemas.schema import SummarizationResponse

load_dotenv(dotenv_path='../local.env')

class TranscriptProcessor:
    def __init__(self):
        self.transcripts_folder = "../transcripts"
        self.output_file = "transcript_summaries_2.json"
        self.db_url = os.getenv('SUPABASE_DB_URL')
        
    def get_transcript_files(self) -> List[str]:
        """Step 1: Iterate through transcript files in the transcripts folder"""
        transcript_files = []
        transcripts_path = Path(self.transcripts_folder)
        
        if transcripts_path.exists():
            for file in transcripts_path.glob("*.txt"):
                transcript_files.append(file.name)
        
        return sorted(transcript_files)
    
    def extract_meeting_id(self, filename: str) -> str:
        """Step 2: Extract meeting_id from filename (e.g., 10_50523.txt -> 10_50523)"""
        return filename.replace('.txt', '')
    
    async def query_agenda_timestamps(self, meeting_id: str) -> List[Dict]:
        """Step 3: Query PostgreSQL database to get agenda_timestamps for the meeting_id"""
        try:
            # Parse the database URL to extract connection components
            db_url = self.db_url.replace('postgresql+asyncpg://', 'postgresql://')
            
            conn = await asyncpg.connect(db_url)
            try:
                query = "SELECT agenda_timestamps FROM meetings WHERE meeting_id = $1"
                result = await conn.fetchval(query, meeting_id)
                return result if result else []
            finally:
                await conn.close()
                
        except Exception as e:
            print(f"Database error for meeting_id {meeting_id}: {str(e)}")
            return []
    
    def parse_agenda_names(self, agenda_timestamps: List[Dict]) -> List[str]:
        """Step 4: Parse agenda_timestamps to extract agenda_name from all dicts"""
        agenda_list = []
        
        for item in agenda_timestamps:
            jj = json.loads(item)
            agenda_list.append(jj['agenda_name'])
        
        return agenda_list
    
    def generate_summary_with_llm(self, transcript_filename: str, agenda_list: List[str]) -> Dict[str, Any]:
        """Step 6: Generate summary using LLMGenerator similar to summarizer.py"""
        try:
            transcript_path = os.path.join(self.transcripts_folder, transcript_filename)
            
            summarizer = Summarizer(
                transcript_file_path=transcript_path,
                agenda_for_the_meetings=agenda_list,
                model_name=ModelName.GEMINI_2
            )
            
            response = summarizer.summarize()
            
            # Convert Pydantic model to dict for JSON serialization
            return {
                "filename": transcript_filename,
                "meeting_id": self.extract_meeting_id(transcript_filename),
                "agenda_list": agenda_list,
                "summary_response": response.model_dump()
            }
            
        except Exception as e:
            print(f"LLM generation error for {transcript_filename}: {str(e)}")
            return {
                "filename": transcript_filename,
                "meeting_id": self.extract_meeting_id(transcript_filename),
                "agenda_list": agenda_list,
                "error": str(e)
            }
    
    def save_to_json(self, data: Dict[str, Any]) -> None:
        """Step 7 & 8: Append LLM response to a single JSON file"""
        output_path = Path(self.output_file)
        
        # Read existing data if file exists
        existing_data = []
        if output_path.exists():
            try:
                with open(output_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                existing_data = []
        
        # Append new data
        existing_data.append(data)
        
        # Write back to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
        
        print(f"Saved summary for {data.get('filename', 'unknown')} to {self.output_file}")
    
    async def process_single_transcript(self, filename: str) -> None:
        """Process a single transcript file through all steps"""
        print(f"Processing {filename}...")
        
        # Step 2: Extract meeting_id
        meeting_id = self.extract_meeting_id(filename)
        print(f"  Meeting ID: {meeting_id}")

        if meeting_id =="10_50251":
            # Step 3: Query database for agenda_timestamps
            agenda_timestamps = await self.query_agenda_timestamps(meeting_id)
            print(f"  Found {len(agenda_timestamps)} agenda timestamps")

            # Step 4 & 5: Parse agenda names
            agenda_list = self.parse_agenda_names(agenda_timestamps)
            print(f"  Extracted {len(agenda_list)} agenda names")

            # Step 6: Generate summary with LLM
            summary_data = self.generate_summary_with_llm(filename, agenda_list)

            # Step 7 & 8: Save to JSON file
            self.save_to_json(summary_data)

            print(f"Completed processing {filename}\n")
    
    async def process_all_transcripts(self) -> None:
        """Main execution loop: Process all transcript files"""
        print("Starting transcript processing...")
        
        # Step 1: Get all transcript files
        transcript_files = self.get_transcript_files()
        print(f"Found {len(transcript_files)} transcript files: {transcript_files}")
        
        if not transcript_files:
            print("No transcript files found!")
            return
        
        # Process each file
        for filename in transcript_files:
            await self.process_single_transcript(filename)
        
        print(f"All transcripts processed! Results saved in {self.output_file}")

async def main():
    """Main function to run the transcript processor"""
    processor = TranscriptProcessor()
    await processor.process_all_transcripts()

def test_single_file():
    """Test function to process just one file for testing"""
    async def test_runner():
        processor = TranscriptProcessor()
        # Test with the first available file
        files = processor.get_transcript_files()
        if files:
            await processor.process_single_transcript(files[0])
        else:
            print("No transcript files found for testing!")
    
    asyncio.run(test_runner())

if __name__ == "__main__":
    # Uncomment the line below to test with a single file first
    # test_single_file()
    
    # Run the full processing
    asyncio.run(main())