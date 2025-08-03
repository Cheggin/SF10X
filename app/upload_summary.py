import json
import os
import asyncio
import asyncpg
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv(dotenv_path='../local.env')

class SummaryUploader:
    def __init__(self, json_file_path: str = "transcript_summaries.json"):
        self.json_file_path = json_file_path
        self.db_url = os.getenv('SUPABASE_DB_URL')
        
    def read_json_file(self) -> List[Dict[str, Any]]:
        """Read the transcript_summaries.json file and return the data"""
        try:
            with open(self.json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"Successfully read {len(data)} records from {self.json_file_path}")
            return data
        except FileNotFoundError:
            print(f"Error: File {self.json_file_path} not found")
            return []
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in {self.json_file_path}: {str(e)}")
            return []
    
    def extract_required_fields(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract meeting_id, main_summary, and agenda_summaries from each record"""
        extracted_records = []
        
        for record in data:
            try:
                if 'error' in record:
                    print(f"Skipping record with error: {record.get('meeting_id', 'unknown')}")
                    continue
                
                meeting_id = record.get('meeting_id')
                summary_response = record.get('summary_response', {})
                main_summary = summary_response.get('main_summary')
                agenda_summaries = summary_response.get('agenda_summaries', [])
                
                if not meeting_id or not main_summary:
                    print(f"Skipping incomplete record: {meeting_id}")
                    continue
                
                # Convert agenda_summaries to JSON string for database storage
                agenda_summaries_json = [json.dumps(item) for item in agenda_summaries]
                
                extracted_record = {
                    'meeting_id': meeting_id,
                    'main_summary': main_summary,
                    'agenda_summaries': agenda_summaries_json
                }
                
                extracted_records.append(extracted_record)
                print(f"Extracted data for meeting_id: {meeting_id}")
                
            except Exception as e:
                print(f"Error processing record: {str(e)}")
                continue
        
        print(f"Successfully extracted {len(extracted_records)} valid records")
        return extracted_records
    

    async def upload_to_database(self, records: List[Dict[str, Any]]) -> None:
        """Upload the extracted records to the meeting_summary table"""
        if not records:
            print("No records to upload")
            return
        
        try:
            db_url = self.db_url.replace('postgresql+asyncpg://', 'postgresql://')
            conn = await asyncpg.connect(db_url)
            try:
                # Insert or update records using ON CONFLICT
                upsert_sql = """
                INSERT INTO meeting_summary (meeting_id, main_summary, agenda_summary)
                VALUES ($1, $2, $3)
                ON CONFLICT (meeting_id) 
                DO UPDATE SET 
                    main_summary = EXCLUDED.main_summary,
                    agenda_summary = EXCLUDED.agenda_summary;
                """
                
                uploaded_count = 0
                for record in records:
                    try:
                        await conn.execute(
                            upsert_sql,
                            record['meeting_id'],
                            record['main_summary'],
                            record['agenda_summaries']
                        )
                        uploaded_count += 1
                        print(f"Uploaded: {record['meeting_id']}")
                    except Exception as e:
                        print(f"Error uploading record {record['meeting_id']}: {str(e)}")
                
                print(f"Successfully uploaded {uploaded_count} out of {len(records)} records")
                
            finally:
                await conn.close()
        
        except Exception as e:
            print(f"Database connection error: {str(e)}")
            raise
    
    async def process_and_upload(self) -> None:
        """Main method to orchestrate the entire upload process"""
        print("Starting summary upload process...")
        
        # Step 1: Read JSON file
        data = self.read_json_file()
        if not data:
            print("No data to process. Exiting.")
            return
        
        # Step 2: Extract required fields
        extracted_records = self.extract_required_fields(data)
        if not extracted_records:
            print("No valid records extracted. Exiting.")
            return

        # Step 4: Upload to database
        await self.upload_to_database(extracted_records)
        
        print("Summary upload process completed!")

async def main():
    """Main function to run the upload process"""
    uploader = SummaryUploader()
    await uploader.process_and_upload()

if __name__ == "__main__":
    # Run the upload process
    asyncio.run(main())
    
    # Optionally check a specific meeting
    # check_specific_meeting("10_50121")