#!/usr/bin/env python3
"""
Test Single Transcript Scraping

Simple script to test scraping one transcript and see what we get.
"""

import requests
import re
from pathlib import Path
from loguru import logger
from bs4 import BeautifulSoup

def test_transcript_scraping():
    """Test scraping a single transcript"""
    
    # Test with the first meeting
    meeting_id = "10_50523"
    transcript_url = "https://sanfrancisco.granicus.com/TranscriptViewer.php?view_id=10&clip_id=50523"
    
    logger.info(f"Testing transcript scraping for meeting: {meeting_id}")
    logger.info(f"URL: {transcript_url}")
    
    try:
        # Fetch the transcript page
        logger.info("Fetching transcript page...")
        response = requests.get(transcript_url, timeout=30)
        response.raise_for_status()
        
        logger.info(f"Status: {response.status_code}")
        logger.info(f"Content length: {len(response.text)} characters")
        
        # Parse HTML content
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Let's explore the page structure first
        logger.info("Analyzing page structure...")
        
        # Check title
        title = soup.find('title')
        if title:
            logger.info(f"Page title: {title.get_text().strip()}")
        
        # Look for different potential transcript containers
        logger.info("Looking for transcript content...")
        
        # Method 1: Look for transcript-specific elements
        transcript_divs = soup.find_all('div', {'id': re.compile(r'transcript', re.I)})
        if transcript_divs:
            logger.info(f"Found {len(transcript_divs)} divs with 'transcript' in ID")
            for i, div in enumerate(transcript_divs):
                logger.info(f"  Div {i+1}: ID='{div.get('id')}', content length={len(div.get_text())}")
        
        # Method 2: Look for pre-formatted text
        pre_tags = soup.find_all('pre')
        if pre_tags:
            logger.info(f"Found {len(pre_tags)} <pre> tags")
            for i, pre in enumerate(pre_tags):
                logger.info(f"  Pre {i+1}: content length={len(pre.get_text())}")
        
        # Method 3: Look for main content areas
        main_content = soup.find('main')
        if main_content:
            logger.info(f"Found <main> tag with content length={len(main_content.get_text())}")
        
        # Method 4: Look for divs with content-related classes
        content_divs = soup.find_all('div', {'class': re.compile(r'content|main|body', re.I)})
        if content_divs:
            logger.info(f"Found {len(content_divs)} divs with content-related classes")
            for i, div in enumerate(content_divs):
                classes = div.get('class', [])
                logger.info(f"  Div {i+1}: classes={classes}, content length={len(div.get_text())}")
        
        # Method 5: Look for any div with substantial text content
        all_divs = soup.find_all('div')
        substantial_divs = [div for div in all_divs if len(div.get_text(strip=True)) > 1000]
        logger.info(f"Found {len(substantial_divs)} divs with substantial content (>1000 chars)")
        
        # Let's try to extract the transcript content
        transcript_text = ""
        
        # Try transcript-specific divs first
        if transcript_divs:
            transcript_text = transcript_divs[0].get_text(separator='\n', strip=True)
            logger.info(f"Using transcript div, extracted {len(transcript_text)} characters")
        
        # Try pre tags if no transcript div
        elif pre_tags:
            transcript_text = '\n'.join(pre.get_text(strip=True) for pre in pre_tags)
            logger.info(f"Using pre tags, extracted {len(transcript_text)} characters")
        
        # Try substantial divs
        elif substantial_divs:
            # Pick the div with the most content
            best_div = max(substantial_divs, key=lambda d: len(d.get_text()))
            transcript_text = best_div.get_text(separator='\n', strip=True)
            logger.info(f"Using substantial div, extracted {len(transcript_text)} characters")
        
        # Method 6: Try extracting all text from body and look for transcript-like content
        if not transcript_text:
            logger.info("Trying to extract from body text...")
            body = soup.find('body')
            if body:
                # Get all text content, preserving line breaks
                body_text = body.get_text(separator='\n', strip=True)
                logger.info(f"Body text length: {len(body_text)} characters")
                
                # Look for patterns that indicate transcript content
                # Transcripts often have speaker names in ALL CAPS followed by speech
                lines = body_text.split('\n')
                transcript_lines = []
                
                for line in lines:
                    line = line.strip()
                    if line:
                        # Skip navigation/header lines that are typically short
                        if len(line) > 20:  # Only include lines with substantial content
                            transcript_lines.append(line)
                
                if transcript_lines:
                    transcript_text = '\n'.join(transcript_lines)
                    logger.info(f"Extracted transcript from body, {len(transcript_text)} characters")
        
        # Clean up the text
        if transcript_text:
            # Remove excessive whitespace
            transcript_text = re.sub(r'\n\s*\n', '\n\n', transcript_text)
            transcript_text = re.sub(r'[ \t]+', ' ', transcript_text)
            transcript_text = transcript_text.strip()
            
            logger.info(f"After cleanup: {len(transcript_text)} characters")
            
            # Show first few lines
            lines = transcript_text.split('\n')[:10]
            logger.info("First 10 lines of transcript:")
            for i, line in enumerate(lines, 1):
                logger.info(f"  {i}: {line[:100]}{'...' if len(line) > 100 else ''}")
            
            # Save to file for inspection
            transcripts_dir = Path(__file__).parent.parent / "transcripts"
            transcripts_dir.mkdir(exist_ok=True)
            
            output_file = transcripts_dir / f"{meeting_id}.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(transcript_text)
            
            logger.info(f"Saved transcript to: {output_file}")
            logger.info(f"File size: {output_file.stat().st_size} bytes")
            
            return True
        else:
            logger.warning("No transcript content found")
            
            # Save the raw HTML for debugging
            debug_file = Path(__file__).parent.parent / "transcripts" / f"{meeting_id}_debug.html"
            with open(debug_file, 'w', encoding='utf-8') as f:
                f.write(response.text)
            logger.info(f"Saved raw HTML for debugging: {debug_file}")
            
            return False
            
    except Exception as e:
        logger.error(f"Error scraping transcript: {e}")
        return False

def main():
    """Main entry point"""
    logger.info("Testing single transcript scraping...")
    
    success = test_transcript_scraping()
    
    if success:
        logger.info("✅ Transcript scraping test successful!")
        return 0
    else:
        logger.info("❌ Transcript scraping test failed")
        return 1

if __name__ == "__main__":
    exit(main())