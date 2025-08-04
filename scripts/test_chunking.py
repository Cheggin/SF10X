#!/usr/bin/env python3
"""
Simple script to test Chonkie semantic chunking on SF Gov transcript files.
"""

import os
from chonkie import SemanticChunker
from loguru import logger
import re




def chunk_transcript_semantic(file_path: str, output_file: str = None):
    """Chunk a transcript file semantically and save to file."""
    
    # Initialize Semantic Chunker
    chunker = SemanticChunker(
        chunk_size=1024,  # Larger chunks for meeting segments
        threshold="auto",  # Auto-detect semantic boundaries
        similarity_window=2,  # Compare with 2 preceding sentences
        min_sentences=2,  # At least 2 sentences per chunk
        min_chunk_size=200  # Minimum 200 tokens per chunk
    )
    
    # Read transcript file
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript_text = f.read()
    
    logger.info(f"Loaded transcript: {len(transcript_text)} characters")
    
    # Chunk the text
    chunks = chunker.chunk(transcript_text)
    
    logger.info(f"Created {len(chunks)} chunks")
    
    # Create output filename if not provided
    if output_file is None:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_file = f"{base_name}_semantic_chunks.txt"
    
    # Display and save results
    print(f"\n{'='*80}")
    print(f"SEMANTIC CHUNKING RESULTS FOR: {os.path.basename(file_path)}")
    print(f"Total chunks: {len(chunks)}")
    print(f"Output file: {output_file}")
    print(f"{'='*80}\n")
    
    # Write chunks to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"SEMANTIC CHUNKS FOR: {os.path.basename(file_path)}\n")
        f.write(f"Total chunks: {len(chunks)}\n")
        f.write(f"Generated using Chonkie SemanticChunker\n")
        f.write("="*80 + "\n\n")
        
        for i, chunk in enumerate(chunks):
            # Write to file
            f.write(f"CHUNK {i+1}/{len(chunks)}\n")
            f.write(f"Start index: {chunk.start_index}\n")
            f.write(f"End index: {chunk.end_index}\n")
            f.write(f"Length: {len(chunk.text)} chars\n")
            f.write(f"Sentences: {len(chunk.sentences)}\n")
            f.write("-" * 60 + "\n")
            f.write(chunk.text)
            f.write("\n\n" + "="*80 + "\n\n")
            
            # Display first few chunks to console
            if i < 3:
                print(f"CHUNK {i+1}/{len(chunks)}")
                print(f"Length: {len(chunk.text)} chars, Sentences: {len(chunk.sentences)}")
                print("-" * 40)
                print(chunk.text[:400] + "..." if len(chunk.text) > 400 else chunk.text)
                print("\n" + "="*60 + "\n")
    
    print(f"All {len(chunks)} chunks saved to: {output_file}")
    return chunks


def main():
    """Main function to test semantic chunking."""
    
    # Find transcript files
    transcript_dir = "transcripts"
    
    if not os.path.exists(transcript_dir):
        logger.error(f"Transcript directory not found: {transcript_dir}")
        return
    
    transcript_files = [f for f in os.listdir(transcript_dir) if f.endswith('.txt')]
    
    if not transcript_files:
        logger.error("No transcript files found")
        return
    
    # Use the first transcript file
    transcript_file = os.path.join(transcript_dir, transcript_files[0])
    logger.info(f"Using transcript file: {transcript_file}")
    
    print(f"\n{'#'*100}")
    print(f"TESTING SEMANTIC CHUNKING FOR MEETING TRANSCRIPTS")
    print(f"{'#'*100}")
    
    chunks = chunk_transcript_semantic(transcript_file)
    
    # Show some statistics
    chunk_lengths = [len(chunk.text) for chunk in chunks]
    sentence_counts = [len(chunk.sentences) for chunk in chunks]
    avg_length = sum(chunk_lengths) / len(chunk_lengths)
    avg_sentences = sum(sentence_counts) / len(sentence_counts)
    
    print(f"\nSEMANTIC CHUNKING STATISTICS:")
    print(f"Average chunk length: {avg_length:.1f} characters")
    print(f"Average sentences per chunk: {avg_sentences:.1f}")
    print(f"Min chunk length: {min(chunk_lengths)} characters")
    print(f"Max chunk length: {max(chunk_lengths)} characters")
    print(f"Min sentences: {min(sentence_counts)}")
    print(f"Max sentences: {max(sentence_counts)}")
    
    return chunks


if __name__ == "__main__":
    main()