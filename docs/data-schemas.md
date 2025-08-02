# SFGovTV Data Schemas

This document defines the metadata schemas for scraped SFGovTV content, optimized for pgvector embeddings and chonkie chunking.

## Core Meeting Metadata

```python
{
  # Identification
  "clip_id": "50352",
  "view_id": "10", 
  "meeting_id": "175195800007_08_25_id50352",  # Unique identifier
  
  # Government Body
  "department": "Board of Supervisors",
  "committee": "Regular Meeting",
  "meeting_type": "regular|special|budget|committee",
  
  # Temporal
  "date": "2025-07-08",
  "duration": "04:15:30",  # HH:MM:SS
  "start_time": "14:00:00",
  
  # Content Classification  
  "title": "Board of Supervisors Regular Meeting - July 8, 2025",
  "status": "completed|live|upcoming",
  "language": "en"
}
```

## Resource Links

```python
{
  # Media Resources (external links only)
  "resources": {
    "video_player_url": "//sanfrancisco.granicus.com/MediaPlayer.php?view_id=10&clip_id=50352",
    "video_stream_url": "//sanfrancisco.granicus.com/ASX.php?view_id=10&clip_id=50352", 
    "audio_mp3_url": "https://archive-video.granicus.com/sanfrancisco/...",  # Link only, no download
    "agenda_url": "//sanfrancisco.granicus.com/AgendaViewer.php?view_id=10&clip_id=50352",
    "transcript_url": "//sanfrancisco.granicus.com/TranscriptViewer.php?view_id=10&clip_id=50352"
  },
  
  # Local Files (processed content)
  "local_files": {
    "transcript_path": "/transcripts/transcript_175195800007_08_25_id50352.txt",
    "chunks_path": "/chunks/transcript_175195800007_08_25_id50352_semantic_chunks.txt"
  }
}
```

## Content Metadata

```python
{
  # Content Analysis (AI-generated)
  "content_summary": {
    "topics": ["budget", "housing", "public safety", "homelessness"],
    "key_votes": [],
    "legislation_discussed": ["ordinance_123", "resolution_456"],
    "ai_summary": "Board discussed budget priorities and housing initiatives...",
    "sentiment": "neutral|positive|contentious"
  },
  
  # Agenda Items (structured)
  "agenda_items": [
    {
      "item_number": "3-32",
      "title": "Budget Appropriation Ordinance", 
      "type": "ordinance|resolution|hearing",
      "timestamp": "00:15:30",
      "duration": "01:45:00",
      "outcome": "passed|failed|continued|withdrawn"
    }
  ]
}
```

## Chunking & Vector Storage

```python
{
  # Processing Status
  "processing": {
    "scraped_at": "2025-08-02T10:30:00Z",
    "processed_at": "2025-08-02T10:45:00Z", 
    "last_updated": "2025-08-02T10:45:00Z",
    "status": "scraped|processing|indexed|error",
    "error_message": null,
    "processing_version": "1.0"
  },
  
  # Chonkie Chunking Configuration
  "chunking": {
    "strategy": "semantic",  # Using chonkie semantic chunking
    "chunk_count": 156,
    "total_tokens": 35525,
    "chunk_size_avg": 227,  # Average tokens per chunk
    "chunk_overlap": 50,    # Token overlap between chunks
    "chunking_model": "chonkie[st]"
  },
  
  # pgvector Embedding Storage
  "embeddings": {
    "embedding_model": "text-embedding-ada-002",
    "vector_dimension": 1536,
    "pgvector_table": "meeting_chunks",
    "indexed_in_pgvector": true,
    "total_vectors": 156,
    "embedding_created_at": "2025-08-02T10:45:00Z"
  }
}
```

## Search & API Integration

```python
{
  # Hybrid Search Support
  "search_metadata": {
    "supports_semantic_search": true,    # pgvector cosine similarity
    "supports_keyword_search": true,     # PostgreSQL full-text search
    "supports_hybrid_search": true,      # Combined semantic + keyword
    "supports_time_navigation": true,
    "searchable_fields": [
      "transcript_text",
      "agenda_items", 
      "topics",
      "content_summary"
    ]
  },
  
  # API Clip Generation
  "clip_segments": [
    {
      "segment_id": "seg_001",
      "start_time": "00:15:30",
      "end_time": "00:17:45", 
      "topic": "Budget Discussion",
      "chunk_ids": ["chunk_045", "chunk_046", "chunk_047"],  # References to pgvector chunks
      "relevance_score": 0.89
    }
  ]
}
```

## Database Schema for pgvector

### meetings table
```sql
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    meeting_id VARCHAR UNIQUE NOT NULL,
    clip_id VARCHAR NOT NULL,
    view_id VARCHAR NOT NULL,
    department VARCHAR NOT NULL,
    date DATE NOT NULL,
    duration INTERVAL,
    title TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### meeting_chunks table (pgvector)
```sql
CREATE TABLE meeting_chunks (
    id SERIAL PRIMARY KEY,
    meeting_id VARCHAR REFERENCES meetings(meeting_id),
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),  -- pgvector extension
    start_time INTERVAL,
    end_time INTERVAL,
    topics TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- pgvector index for similarity search
CREATE INDEX ON meeting_chunks USING ivfflat (embedding vector_cosine_ops);
```

## Integration Notes

- **Chonkie**: Handles semantic chunking of transcripts before embedding
- **pgvector**: Stores embeddings for fast similarity search
- **Hybrid Search**: Combines pgvector semantic search with PostgreSQL full-text search
- **No Local Audio**: Audio files remain as external links only
- **Handshake Integration**: Schema designed for handshake workflow compatibility