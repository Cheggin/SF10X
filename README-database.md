# Database Setup

This guide explains how to set up the local PostgreSQL database with pgvector for the SF10X project.

## Prerequisites

- Docker and Docker Compose installed
- Python environment with dependencies from `pyproject.toml`

## Quick Start

### Using Just (Recommended)
```bash
# Full development setup (installs deps, starts DB, runs migrations)
just setup

# Or step by step:
just install        # Install Python dependencies
just db-start       # Start PostgreSQL with pgvector
just db-migrate     # Run database migrations
just db-status      # Verify setup
```

### Manual Setup
1. **Start PostgreSQL with pgvector:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Install Python dependencies:**
   ```bash
   uv install  # or pip install -e .
   ```

3. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Verify setup:**
   ```bash
   docker-compose exec postgres psql -U sf10x_user -d sf10x -c "\dx"
   ```
   Should show the `vector` extension installed.

## Database Configuration

### Environment Variables (local.env)
```
DATABASE_URL=postgresql+asyncpg://sf10x_user:sf10x_password@localhost:5432/sf10x
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sf10x
DB_USER=sf10x_user
DB_PASSWORD=sf10x_password
```

### Docker Compose
- **Image**: `pgvector/pgvector:pg16`
- **Port**: `5432:5432`
- **Volume**: Persistent storage in `postgres_data`
- **Health Check**: Ensures database is ready

## Schema Overview

### meetings table
- Stores meeting metadata (clip_id, view_id, department, date, etc.)
- JSONB metadata field for flexible additional data

### meeting_chunks table
- Stores chunked transcript text with embeddings
- pgvector embeddings for semantic search
- References meetings table via meeting_id

## Alembic Migrations

### Create new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations:
```bash
alembic upgrade head
```

### Rollback migrations:
```bash
alembic downgrade -1  # Roll back one migration
alembic downgrade base  # Roll back all migrations
```

## pgvector Usage

### Insert embedding:
```python
from pgvector.sqlalchemy import Vector
from database.models import MeetingChunk

chunk = MeetingChunk(
    meeting_id="meeting_123",
    chunk_text="Some text...",
    embedding=[0.1, 0.2, 0.3, ...]  # 1536-dimensional vector
)
```

### Similarity search:
```sql
SELECT chunk_text, embedding <=> %s AS distance 
FROM meeting_chunks 
WHERE meeting_id = %s 
ORDER BY distance 
LIMIT 10;
```

## Troubleshooting

### Database connection issues:
1. Ensure Docker container is running: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Verify connection: `docker-compose exec postgres pg_isready`

### pgvector extension:
- Extension is automatically installed via init script
- Verify with: `\dx` in psql

### Migration issues:
- Check alembic.ini configuration
- Ensure DATABASE_URL is correct
- Run with verbose output: `alembic -x verbose upgrade head`