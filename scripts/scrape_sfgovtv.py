#!/usr/bin/env python3
"""
SFGovTV Scraper - Initial version

This script scrapes meeting data from the San Francisco Government TV website.
Starting with basic functionality to fetch and parse the main listing page.
"""

import requests
import sys
from pathlib import Path
from loguru import logger
from bs4 import BeautifulSoup
import re
from dataclasses import dataclass
from typing import List, Optional, Dict

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Import the get_timestamps function from the same directory
from get_timestamps import scrape_video_page


@dataclass
class MeetingInfo:
    """Data structure for meeting information"""
    clip_id: str
    view_id: str = "10"
    date: Optional[str] = None
    duration: Optional[str] = None
    title: Optional[str] = None
    video_url: Optional[str] = None
    agenda_url: Optional[str] = None
    transcript_url: Optional[str] = None
    audio_url: Optional[str] = None
    timestamps: Optional[List[Dict]] = None


def get_timestamps_for_meeting(meeting: MeetingInfo) -> Optional[List[Dict]]:
    """Get timestamps for a meeting using its video player URL"""
    if not meeting.clip_id or not meeting.view_id:
        return None
    
    # Construct the player URL
    player_url = f"https://sanfrancisco.granicus.com/player/clip/{meeting.clip_id}?view_id={meeting.view_id}&redirect=true"
    
    try:
        logger.info(f"Fetching timestamps for clip_id={meeting.clip_id}")
        timestamps = scrape_video_page(player_url)
        logger.info(f"Found {len(timestamps)} timestamps for clip_id={meeting.clip_id}")
        return timestamps
    except Exception as e:
        logger.error(f"Failed to get timestamps for clip_id={meeting.clip_id}: {e}")
        return None


def parse_meetings_from_html(html_content: str) -> List[MeetingInfo]:
    """Parse meeting information from HTML content"""
    soup = BeautifulSoup(html_content, 'lxml')
    meetings = {}  # Use dict to avoid duplicates
    
    # Look for the main table containing meeting data
    # The meetings are typically in table rows
    tables = soup.find_all('table')
    logger.info(f"Found {len(tables)} tables")
    
    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            # Look for video links in this row
            video_links = row.find_all('a', href=re.compile(r'MediaPlayer\.php.*clip_id=(\d+)'))
            
            for video_link in video_links:
                href = video_link.get('href')
                clip_id_match = re.search(r'clip_id=(\d+)', href)
                
                if clip_id_match:
                    clip_id = clip_id_match.group(1)
                    
                    # Skip if we already have this meeting
                    if clip_id in meetings:
                        continue
                        
                    # Create meeting info with basic data
                    meeting = MeetingInfo(
                        clip_id=clip_id,
                        video_url=f"https:{href}" if href.startswith('//') else href
                    )
                    
                    # Extract data from the same row
                    cells = row.find_all(['td', 'th'])
                    
                    # Extract date and duration from specific table cells
                    for cell in cells:
                        cell_text = cell.get_text(strip=True)
                        
                        # Look for date patterns (MM/DD/YY format)
                        date_match = re.search(r'(\d{1,2}/\d{1,2}/\d{2,4})', cell_text)
                        if date_match and not meeting.date:
                            meeting.date = date_match.group(1)
                        
                        # Look for duration patterns (06h 00m format)
                        duration_match = re.search(r'(\d{1,2}h\s*\d{1,2}m)', cell_text.replace('&nbsp;', ' '))
                        if duration_match and not meeting.duration:
                            meeting.duration = duration_match.group(1)
                        
                        # Alternative duration patterns (HH:MM:SS or MM:SS)
                        if not meeting.duration:
                            duration_match2 = re.search(r'(\d{1,2}:\d{2}(?::\d{2})?)', cell_text)
                            if duration_match2:
                                meeting.duration = duration_match2.group(1)
                    
                    # Find agenda and transcript links in the same row
                    agenda_link = row.find('a', href=re.compile(f'AgendaViewer\\.php.*clip_id={clip_id}'))
                    if agenda_link:
                        agenda_href = agenda_link.get('href')
                        meeting.agenda_url = f"https:{agenda_href}" if agenda_href.startswith('//') else agenda_href
                    
                    transcript_link = row.find('a', href=re.compile(f'TranscriptViewer\\.php.*clip_id={clip_id}'))
                    if transcript_link:
                        transcript_href = transcript_link.get('href')
                        meeting.transcript_url = f"https:{transcript_href}" if transcript_href.startswith('//') else transcript_href
                    
                    # Look for MP3 audio links in the same row
                    audio_links = row.find_all('a', href=re.compile(r'https://archive-video\.granicus\.com/.*\.mp3'))
                    if audio_links:
                        meeting.audio_url = audio_links[0].get('href')  # Take the first MP3 link
                    
                    # Try to construct a basic title
                    if meeting.date:
                        # Convert MM/DD/YY to a more readable format
                        try:
                            from datetime import datetime
                            date_obj = datetime.strptime(meeting.date, '%m/%d/%y')
                            formatted_date = date_obj.strftime('%B %d, %Y')
                            meeting.title = f"Board of Supervisors Regular Meeting - {formatted_date}"
                        except ValueError:
                            # Fallback if date parsing fails
                            meeting.title = f"Board of Supervisors Regular Meeting - {meeting.date}"
                    
                    meetings[clip_id] = meeting
                    logger.debug(f"Parsed meeting: clip_id={clip_id}, date={meeting.date}, duration={meeting.duration}")
    
    logger.info(f"Found {len(meetings)} unique meetings")
    return list(meetings.values())


def main():
    """Main scraping function"""
    logger.info("Starting SFGovTV scraper...")
    
    # Base URL for Board of Supervisors meetings (view_id=10)
    base_url = "https://sanfrancisco.granicus.com/ViewPublisher.php?view_id=10"
    
    logger.info(f"Fetching: {base_url}")
    
    try:
        response = requests.get(base_url)
        response.raise_for_status()
        
        logger.info(f"Successfully fetched page. Status: {response.status_code}")
        logger.info(f"Content length: {len(response.text)} characters")
        
        # Parse meetings from the HTML
        meetings = parse_meetings_from_html(response.text)
        
        # Display results
        logger.info(f"Successfully parsed {len(meetings)} meetings")
        
        # Sort meetings by clip_id (newest first)
        meetings.sort(key=lambda m: int(m.clip_id), reverse=True)
        
        # Fetch timestamps for each meeting (optionally limit this for testing)
        logger.info("Fetching timestamps for meetings...")
        for i, meeting in enumerate(meetings):  # Fetch timestamps for first 5 meetings
            meeting.timestamps = get_timestamps_for_meeting(meeting)
            if meeting.timestamps:
                logger.info(f"Meeting {meeting.clip_id} has {len(meeting.timestamps)} agenda items")
        
        for i, meeting in enumerate(meetings[:10], 1):  # Show first 10 meetings
            logger.info(f"Meeting {i}:")
            logger.info(f"  Clip ID: {meeting.clip_id}")
            logger.info(f"  Date: {meeting.date or 'Unknown'}")
            logger.info(f"  Duration: {meeting.duration or 'Unknown'}")
            logger.info(f"  Title: {meeting.title or 'Unknown'}")
            logger.info(f"  Video: {meeting.video_url}")
            if meeting.agenda_url:
                logger.info(f"  Agenda: {meeting.agenda_url}")
            if meeting.transcript_url:
                logger.info(f"  Transcript: {meeting.transcript_url}")
            if meeting.timestamps:
                logger.info(f"  Timestamps: {len(meeting.timestamps)} agenda items")
            logger.info("---")
        
        if len(meetings) > 10:
            logger.info(f"... and {len(meetings) - 10} more meetings")
            
        # Save results to a JSON file for inspection
        import json
        output_file = project_root / "scripts" / "parsed_meetings.json"
        with open(output_file, 'w') as f:
            # Convert dataclasses to dicts for JSON serialization
            meetings_data = [
                {
                    'clip_id': m.clip_id,
                    'view_id': m.view_id,
                    'date': m.date,
                    'duration': m.duration,
                    'title': m.title,
                    'video_url': m.video_url,
                    'agenda_url': m.agenda_url,
                    'transcript_url': m.transcript_url,
                    'audio_url': m.audio_url,
                    'timestamps': m.timestamps
                }
                for m in meetings
            ]
            json.dump(meetings_data, f, indent=2)
        
        logger.info(f"Meeting data saved to: {output_file}")
        
    except requests.RequestException as e:
        logger.error(f"Failed to fetch page: {e}")
        return 1
    
    logger.info("Scraper completed successfully")
    return 0


if __name__ == "__main__":
    exit(main())