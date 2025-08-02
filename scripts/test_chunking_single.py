#!/usr/bin/env python3
"""
Test chunking on a single transcript to verify the pipeline works
"""

import asyncio
from pathlib import Path
from loguru import logger
from chonkie import SemanticChunker
import tiktoken

# Set up paths
project_root = Path(__file__).parent.parent
transcripts_dir = project_root / "transcripts"


async def test_single_chunking():
    """Test chunking on one transcript"""
    # Use the smallest 2025 transcript for testing
    test_meeting_id = "10_48335"
    transcript_path = transcripts_dir / f"{test_meeting_id}.txt"
    
    logger.info(f"Testing chunking on {test_meeting_id}")
    
    # Load transcript
    with open(transcript_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    logger.info(f"Loaded transcript: {len(content)} characters")
    
    # Initialize chunker with correct SemanticChunker parameters
    chunker = SemanticChunker(
        chunk_size=1000,
        threshold=0.5,
        min_chunk_size=200,
        min_sentences=1
    )
    
    # Chunk the transcript
    chunks = chunker.chunk(content)
    
    logger.info(f"Created {len(chunks)} chunks")
    
    # Display chunk info
    total_tokens = 0
    for i, chunk in enumerate(chunks[:3]):  # Show first 3 chunks
        logger.info(f"\nChunk {i+1}:")
        logger.info(f"  Tokens: {chunk.token_count}")
        logger.info(f"  Text preview: {chunk.text[:200]}...")
        total_tokens += chunk.token_count
    
    # Calculate total tokens for all chunks
    all_tokens = sum(c.token_count for c in chunks)
    logger.info(f"\nTotal tokens across all chunks: {all_tokens}")
    logger.info(f"Average tokens per chunk: {all_tokens / len(chunks):.0f}")
    
    # Estimate embedding cost
    cost = (all_tokens / 1_000_000) * 0.10
    logger.info(f"Estimated embedding cost for this transcript: ${cost:.4f}")


if __name__ == "__main__":
    asyncio.run(test_single_chunking())