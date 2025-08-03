# pgvector/Supabase vs ChromaDB Comparison for SFGovTV Insights

## Executive Summary
**Recommendation: Use pgvector on Supabase** for the SFGovTV Insights MVP. It provides native hybrid search capabilities in a single database with managed hosting.

## Detailed Comparison

### pgvector + Supabase

#### Pros
1. **Native Hybrid Search**: PostgreSQL provides both:
   - Full-text search via `tsvector` (built-in, mature, BM25-like)
   - Semantic search via `pgvector` extension
   - Single query can combine both approaches

2. **Unified Data Store**:
   - Keep transcripts, metadata, embeddings in one place
   - ACID compliance for data consistency
   - Rich SQL queries for complex filtering

3. **Supabase Benefits**:
   - Managed hosting with automatic backups
   - Built-in authentication/authorization
   - Real-time subscriptions
   - REST and GraphQL APIs auto-generated
   - Excellent documentation for hybrid search

4. **Cost Effective**:
   - Free tier includes pgvector
   - Single database for all needs
   - No separate hosting for full-text search

5. **Production Ready**:
   - PostgreSQL is battle-tested
   - Supabase handles scaling
   - Built-in monitoring and analytics

#### Cons
1. **Vendor Lock-in**: Tied to PostgreSQL/Supabase ecosystem
2. **Performance**: May be slower than specialized vector DBs for pure semantic search
3. **Index Limitations**: HNSW index in pgvector less optimized than ChromaDB's

#### Implementation Example
```sql
-- Create table with both search types
CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  content TEXT,
  speaker TEXT,
  timestamp TIMESTAMP,
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  embedding vector(1536)
);

-- Create indexes
CREATE INDEX ON transcripts USING GIN (fts);
CREATE INDEX ON transcripts USING ivfflat (embedding vector_cosine_ops);

-- Hybrid search query
WITH semantic_search AS (
  SELECT id, RANK () OVER (ORDER BY embedding <=> $1) AS rank
  FROM transcripts
  ORDER BY embedding <=> $1
  LIMIT 20
),
keyword_search AS (
  SELECT id, RANK () OVER (ORDER BY ts_rank_cd(fts, query) DESC) AS rank
  FROM transcripts, plainto_tsquery('english', $2) query
  WHERE fts @@ query
  ORDER BY ts_rank_cd(fts, query) DESC
  LIMIT 20
)
SELECT 
  t.id,
  t.content,
  t.speaker,
  t.timestamp,
  COALESCE(1.0 / (60 + ss.rank), 0.0) + COALESCE(1.0 / (60 + ks.rank), 0.0) AS score
FROM transcripts t
LEFT JOIN semantic_search ss ON t.id = ss.id
LEFT JOIN keyword_search ks ON t.id = ks.id
WHERE ss.rank IS NOT NULL OR ks.rank IS NOT NULL
ORDER BY score DESC
LIMIT 10;
```

### ChromaDB

#### Pros
1. **Optimized for Vectors**: Purpose-built for semantic search
2. **Simple API**: Easy to get started
3. **HNSW Performance**: Highly optimized vector search
4. **Lightweight**: Can run locally or in-memory

#### Cons
1. **No Native Full-Text Search**: Requires workarounds:
   - External BM25 implementation
   - Dual storage systems
   - Complex query orchestration
2. **Limited Metadata Filtering**: Not as powerful as SQL
3. **Additional Infrastructure**: Need separate solution for full-text
4. **Less Mature**: Compared to PostgreSQL

## Architecture Comparison

### pgvector/Supabase Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Transcripts │────▶│   Chonkie    │────▶│   Supabase DB   │
└─────────────┘     │  (Chunking)  │     │  ┌────────────┐ │
                    └──────────────┘     │  │ pgvector   │ │
                                         │  │ tsvector   │ │
                                         │  │ metadata   │ │
                                         │  └────────────┘ │
                                         └─────────────────┘
                                                  │
                                         ┌────────▼────────┐
                                         │ Hybrid Search   │
                                         │  (Single Query) │
                                         └─────────────────┘
```

### ChromaDB Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Transcripts │────▶│   Chonkie    │────▶│    ChromaDB     │
└─────────────┘     │  (Chunking)  │     │   (Semantic)    │
                    └──────────────┘     └─────────────────┘
                             │                     │
                             ▼                     │
                    ┌─────────────────┐           │
                    │  BM25/SQLite    │           │
                    │  (Full-text)    │           │
                    └─────────────────┘           │
                             │                     │
                             └──────────┬──────────┘
                                        ▼
                              ┌─────────────────┐
                              │ Query Orchestr. │
                              │  (Complex)      │
                              └─────────────────┘
```

## Specific Benefits for SFGovTV Insights

### With pgvector/Supabase:
1. **Speaker Attribution**: SQL queries for speaker metadata
2. **Timestamp Navigation**: Native timestamp handling
3. **Topic Filtering**: Complex SQL WHERE clauses
4. **Meeting Metadata**: Store agenda items, votes, etc.
5. **Search Analytics**: Track popular searches with SQL

### Example Query for SFGovTV
```sql
-- Find discussions about "housing" by specific speakers
SELECT 
  t.content,
  t.speaker,
  t.timestamp,
  t.meeting_id,
  m.title as meeting_title
FROM transcripts t
JOIN meetings m ON t.meeting_id = m.id
WHERE 
  t.speaker ILIKE '%Mayor%'
  AND (
    t.fts @@ plainto_tsquery('housing affordable')
    OR t.embedding <=> $housing_embedding < 0.5
  )
ORDER BY t.timestamp DESC;
```

## Migration Path
If you start with ChromaDB and need to migrate:
- ChromaDB → pgvector: Export embeddings, import to PostgreSQL
- pgvector → ChromaDB: More difficult due to full-text search migration

## Conclusion
For SFGovTV Insights MVP, **pgvector on Supabase** is the superior choice because:
1. Native hybrid search without complex workarounds
2. Single database for all data (transcripts, metadata, embeddings)
3. Managed hosting with free tier
4. SQL flexibility for complex queries
5. Future-proof with Supabase's AI toolkit

The unified approach will significantly simplify development and provide better search capabilities out of the box.