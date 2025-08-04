#!/usr/bin/env python3
"""
Scrape Transcripts to Local Disk

This script reads meeting data from the parsed JSON file and downloads transcript content
to a local transcripts/ directory as raw text files.
"""

import asyncio
import json
import re
from pathlib import Path
from typing import Optional, List, Dict

import aiohttp
from loguru import logger
from bs4 import BeautifulSoup

# Set up paths
project_root = Path(__file__).parent.parent


class TranscriptScraper:
    def __init__(self):
        """Initialize transcript scraper and create transcripts directory"""
        # Create transcripts directory
        self.transcripts_dir = project_root / "transcripts"
        self.transcripts_dir.mkdir(exist_ok=True)
        
        logger.info(f"Initialized transcript scraper, saving to: {self.transcripts_dir}")

    async def scrape_transcript(self, session: aiohttp.ClientSession, transcript_url: str) -> Optional[str]:
        """Scrape transcript content from transcript URL using async HTTP"""
        if not transcript_url:
            return None
        
        try:
            logger.debug(f"Fetching transcript: {transcript_url}")
            async with session.get(transcript_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                html_content = await response.text()
            
            # Parse HTML content
            soup = BeautifulSoup(html_content, 'lxml')
            
            # Look for transcript content
            transcript_text = ""
            
            # Method 1: Look for specific transcript containers
            transcript_div = soup.find('div', {'id': re.compile(r'transcript', re.I)})
            if transcript_div:
                transcript_text = transcript_div.get_text(separator='\n', strip=True)
                logger.debug(f"Using transcript div, extracted {len(transcript_text)} characters")
            
            # Method 2: Look for pre-formatted text (common for transcripts)
            elif soup.find_all('pre'):
                pre_tags = soup.find_all('pre')
                transcript_text = '\n'.join(pre.get_text(strip=True) for pre in pre_tags)
                logger.debug(f"Using pre tags, extracted {len(transcript_text)} characters")
            
            # Method 3: Look for substantial divs with content
            else:
                all_divs = soup.find_all('div')
                substantial_divs = [div for div in all_divs if len(div.get_text(strip=True)) > 1000]
                if substantial_divs:
                    # Pick the div with the most content
                    best_div = max(substantial_divs, key=lambda d: len(d.get_text()))
                    transcript_text = best_div.get_text(separator='\n', strip=True)
                    logger.debug(f"Using substantial div, extracted {len(transcript_text)} characters")
            
            # Method 4: Extract from body text (works for SFGovTV format)
            if not transcript_text or len(transcript_text) < 1000:
                logger.debug("Trying to extract from body text...")
                body = soup.find('body')
                if body:
                    # Remove script and style tags
                    for script_or_style in body(["script", "style"]):
                        script_or_style.decompose()
                    
                    # Get all text content, preserving line breaks
                    body_text = body.get_text(separator='\n', strip=True)
                    
                    # Filter lines to keep substantial content only
                    lines = body_text.split('\n')
                    transcript_lines = []
                    
                    for line in lines:
                        line = line.strip()
                        if line and len(line) > 20:  # Only include lines with substantial content
                            transcript_lines.append(line)
                    
                    if transcript_lines:
                        transcript_text = '\n'.join(transcript_lines)
                        logger.debug(f"Extracted transcript from body, {len(transcript_text)} characters")
            
            # Clean up the text
            if transcript_text:
                # Remove excessive whitespace
                transcript_text = re.sub(r'\n\s*\n', '\n\n', transcript_text)
                transcript_text = re.sub(r'[ \t]+', ' ', transcript_text)
                transcript_text = transcript_text.strip()
            
            # Basic validation - transcript should be reasonably long
            if transcript_text and len(transcript_text) > 1000:  # Increased threshold
                logger.debug(f"Successfully scraped transcript ({len(transcript_text)} chars)")
                return transcript_text
            else:
                logger.warning(f"Transcript appears to be empty or too short: {len(transcript_text)} chars")
                return None
                
        except Exception as e:
            logger.error(f"Error scraping transcript from {transcript_url}: {e}")
            return None

    def save_transcript_to_disk(self, meeting_id: str, transcript_content: str) -> bool:
        """Save transcript content to local disk"""
        try:
            file_path = self.transcripts_dir / f"{meeting_id}.txt"
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(transcript_content)
            
            logger.info(f"Saved transcript to disk: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving transcript for {meeting_id}: {e}")
            return False

    def load_meetings_from_json(self) -> List[Dict]:
        """Load meeting data from parsed JSON file"""
        json_file = project_root / "scripts" / "parsed_meetings.json"
        
        if not json_file.exists():
            raise FileNotFoundError(f"Parsed meetings file not found: {json_file}")
        
        with open(json_file, 'r') as f:
            meetings = json.load(f)
        
        logger.info(f"Loaded {len(meetings)} meetings from JSON file")
        return meetings

    async def process_single_transcript(self, session: aiohttp.ClientSession, meeting_data: Dict) -> tuple[str, str]:
        """Process a single transcript and return (meeting_id, status)"""
        meeting_id = f"{meeting_data['view_id']}_{meeting_data['clip_id']}"
        transcript_url = meeting_data.get('transcript_url')
        
        if not transcript_url:
            logger.debug(f"No transcript URL for meeting: {meeting_id}")
            return meeting_id, "no_url"
        
        # Check if transcript already exists locally
        local_file = self.transcripts_dir / f"{meeting_id}.txt"
        if local_file.exists():
            logger.debug(f"Transcript already exists for meeting: {meeting_id}, skipping")
            return meeting_id, "skipped"
        
        logger.info(f"Processing transcript for meeting: {meeting_id}")
        
        # Scrape transcript content
        transcript_content = await self.scrape_transcript(session, transcript_url)
        
        if transcript_content:
            # Save to local disk
            if self.save_transcript_to_disk(meeting_id, transcript_content):
                return meeting_id, "success"
            else:
                return meeting_id, "save_failed"
        else:
            logger.warning(f"No transcript content found for meeting: {meeting_id}")
            return meeting_id, "scrape_failed"

    async def process_transcripts(self):
        """Process transcripts for all meetings with parallel downloads"""
        logger.info("Starting parallel transcript processing...")
        
        # Load meetings from JSON
        meetings = self.load_meetings_from_json()
        
        # Filter to only meetings that need processing
        meetings_to_process = []
        skipped_count = 0
        
        for meeting_data in meetings:
            meeting_id = f"{meeting_data['view_id']}_{meeting_data['clip_id']}"
            local_file = self.transcripts_dir / f"{meeting_id}.txt"
            
            if not meeting_data.get('transcript_url'):
                skipped_count += 1
                continue
                
            if local_file.exists():
                skipped_count += 1
                continue
                
            meetings_to_process.append(meeting_data)
        
        logger.info(f"Found {len(meetings_to_process)} meetings to process, {skipped_count} already exist")
        
        if not meetings_to_process:
            logger.info("No meetings to process!")
            return
        
        # Set up async HTTP session with concurrency limit
        connector = aiohttp.TCPConnector(limit=4)  # Max 4 concurrent connections
        timeout = aiohttp.ClientTimeout(total=30)
        
        processed_count = 0
        failed_count = 0
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            # Process in batches of 4 for politeness to server
            batch_size = 4
            
            for i in range(0, len(meetings_to_process), batch_size):
                batch = meetings_to_process[i:i + batch_size]
                logger.info(f"Processing batch {i//batch_size + 1} ({len(batch)} meetings)")
                
                # Process batch concurrently
                tasks = [self.process_single_transcript(session, meeting) for meeting in batch]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Count results
                for result in results:
                    if isinstance(result, Exception):
                        logger.error(f"Exception in batch processing: {result}")
                        failed_count += 1
                    else:
                        meeting_id, status = result
                        if status == "success":
                            processed_count += 1
                        elif status in ["scrape_failed", "save_failed"]:
                            failed_count += 1
                        # skipped and no_url don't count as processed or failed
                
                # Small delay between batches to be respectful
                if i + batch_size < len(meetings_to_process):
                    await asyncio.sleep(1)
        
        logger.info(f"Transcript processing complete: {processed_count} processed, {failed_count} failed, {skipped_count} skipped")

    async def run(self):
        """Main execution function"""
        try:
            # Process transcripts
            await self.process_transcripts()
            
            logger.info("Transcript scraping completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during transcript scraping: {e}")
            raise


async def main():
    """Main entry point"""
    logger.info("Starting parallel transcript scraping to local disk...")
    
    scraper = TranscriptScraper()
    await scraper.run()
    
    return 0


if __name__ == "__main__":
    exit(asyncio.run(main()))