import requests
from bs4 import BeautifulSoup
import re
import json

def scrape_video_page(url):
    """Scrape video page to get agenda items with timestamps"""
    
    response = requests.get(url)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract agenda items and timestamps
    agenda_items = []
    
    # Find all index-point elements (agenda items)
    for item in soup.find_all(class_='index-point'):
        time_attr = item.get('time')
        if time_attr:
            # Get the agenda text
            text = item.get_text(strip=True)
            
            # Skip if no text content
            if not text:
                continue
            
            # Convert time from seconds to HH:MM:SS format
            total_seconds = int(time_attr)
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            time_formatted = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            
            agenda_items.append({
                'time_seconds': total_seconds,
                'time_formatted': time_formatted,
                'agenda_name': text
            })
    
    return agenda_items

def main():
    # Example URL
    url = "https://sanfrancisco.granicus.com/player/clip/50523?view_id=10&redirect=true"
    
    print("Scraping video page for agenda timestamps...")
    agenda_items = scrape_video_page(url)
    
    # Sort by time
    agenda_items.sort(key=lambda x: x['time_seconds'])
    
    # Display results
    print(f"\nFound {len(agenda_items)} agenda items with timestamps:\n")
    for item in agenda_items:
        print(f"{item['time_formatted']} - {item.get('agenda_name', 'Unknown')}")
    
    # Save to JSON file
    with open('agenda_timestamps.json', 'w') as f:
        json.dump(agenda_items, f, indent=2)
    
    print("\nSaved to agenda_timestamps.json")

if __name__ == "__main__":
    main()