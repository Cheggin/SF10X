# Hybrid Search Evaluation: Chonkie + ChromaDB

## Overview
This document evaluates the feasibility of using Chonkie (text chunking) and ChromaDB (vector database) for implementing a hybrid search approach combining semantic search (HNSW) with full-text/keyword search for the SFGovTV Insights MVP.

## Chonkie - Text Chunking Library

### What is Chonkie?
- Ultra-lightweight Python library for text chunking in RAG applications
- 15MB default install, up to 33x faster than alternatives
- Supports 56 languages and multiple chunking strategies

### CHOMP Pipeline
1. **Document**: Raw input text
2. **Chef**: Optional preprocessing (cleaning, normalization)
3. **Chunker**: Splits text using selected strategy (token, sentence, recursive, semantic)
4. **Refinery**: Post-processing stage
5. **Friends**: Export/ingest chunks to databases

### Available Refineries
Currently, Chonkie offers only two refineries:
1. **Overlap Refinery**: Adds overlapping context from adjacent chunks
2. **Embeddings Refinery**: Adds embeddings to chunks using specified models

**Limitation**: No built-in refineries for keyword extraction or metadata enrichment.

## ChromaDB - Vector Database

### Current State (2024-2025)
- **No native BM25 support**: ChromaDB lacks built-in full-text search capabilities
- Multiple open feature requests for BM25 implementation (#1686, #1330)
- Primarily designed for semantic/vector search using HNSW

### Common Hybrid Search Workarounds

#### 1. LangChain Integration
```python
# Pseudo-implementation
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from langchain.vectorstores import Chroma

# Separate BM25 for keyword search
bm25_retriever = BM25Retriever.from_documents(documents)

# ChromaDB for semantic search
chroma_retriever = Chroma.from_documents(documents, embeddings)

# Combine with EnsembleRetriever
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, chroma_retriever],
    weights=[0.5, 0.5]
)
```

#### 2. Custom Implementation
- Roll your own BM25 implementation
- Store keyword indices separately
- Combine results programmatically

#### 3. Dual Storage Approach
- ChromaDB for semantic search (HNSW)
- Separate system for full-text search (SQLite FTS, Elasticsearch, etc.)

## Evaluation for SFGovTV Insights MVP

### Pros
1. **Chonkie**: Fast, lightweight chunking perfect for processing long transcripts
2. **ChromaDB**: Excellent semantic search with HNSW
3. **Flexibility**: Can implement custom hybrid approach

### Cons
1. **No native hybrid search**: Requires additional implementation
2. **Chonkie refineries limitation**: Won't solve metadata/keyword extraction
3. **Performance overhead**: BM25Retriever rebuilds index at runtime

### Recommended Approach

Given the limitations, here's a hybrid architecture:

```
┌─────────────────┐     ┌──────────────────┐
│   Transcript    │────▶│     Chonkie      │
└─────────────────┘     │   (Chunking)     │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐
          │ Custom Metadata │       │   Embeddings    │
          │   Extractor     │       │   Generation    │
          └────────┬────────┘       └────────┬────────┘
                   │                          │
                   ▼                          ▼
          ┌─────────────────┐       ┌─────────────────┐
          │  SQLite FTS5    │       │    ChromaDB     │
          │ (Full-text)     │       │   (Semantic)    │
          └─────────────────┘       └─────────────────┘
                   │                          │
                   └──────────┬───────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Hybrid Query   │
                    │    Handler      │
                    └─────────────────┘
```

### Implementation Steps

1. **Use Chonkie for chunking** transcripts with appropriate chunk size
2. **Build custom metadata extractor** to extract:
   - Speaker names (using NER)
   - Key topics/keywords
   - Timestamps
   - Meeting agenda items
3. **Dual storage**:
   - ChromaDB for semantic search
   - SQLite FTS5 for full-text search with metadata
4. **Hybrid query handler** to:
   - Route queries appropriately
   - Combine and rank results
   - Apply reranking strategies

### Alternative Considerations

If the dual-storage approach proves too complex, consider:
1. **Qdrant**: Offers native hybrid search but requires more setup
2. **Weaviate**: Built-in BM25 support
3. **ElasticSearch + ChromaDB**: More mature full-text search

## Conclusion

While Chonkie's refineries won't directly solve the metadata/keyword extraction challenge, and ChromaDB lacks native BM25 support, a hybrid approach using both tools alongside a custom metadata extraction pipeline and dual storage (ChromaDB + SQLite FTS5) can effectively implement the required hybrid search for the MVP.