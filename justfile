# SF10X Development Commands
# Use `just --list` to see all available commands

# Default recipe - shows help
default:
    @just --list

# === Database Management ===

# Start PostgreSQL database with pgvector
db-start:
    @echo "🚀 Starting PostgreSQL with pgvector..."
    docker-compose up -d postgres
    @echo "⏳ Waiting for database to be ready..."
    @sleep 5
    @just db-wait

# Stop database
db-stop:
    @echo "🛑 Stopping PostgreSQL..."
    docker-compose down

# Wait for database to be ready
db-wait:
    @echo "⏳ Waiting for database connection..."
    @timeout 30 bash -c 'until docker-compose exec postgres pg_isready -U sf10x_user -d sf10x > /dev/null 2>&1; do sleep 1; done'
    @echo "✅ Database is ready!"

# Run database migrations
db-migrate:
    @echo "🔄 Running database migrations..."
    uv run alembic upgrade head
    @echo "✅ Migrations completed!"

# Create a new migration
db-migration MESSAGE:
    @echo "📝 Creating new migration: {{MESSAGE}}"
    uv run alembic revision --autogenerate -m "{{MESSAGE}}"

# Reset database (drop all tables and re-migrate)
db-reset:
    @echo "⚠️  Resetting database..."
    uv run alembic downgrade base
    uv run alembic upgrade head
    @echo "✅ Database reset completed!"

# Show database status
db-status:
    @echo "📊 Database Status:"
    @echo "=================="
    docker-compose ps postgres
    @echo ""
    @echo "📋 Migration Status:"
    uv run alembic current
    @echo ""
    @echo "🔍 Extensions installed:"
    docker-compose exec postgres psql -U sf10x_user -d sf10x -c "\dx" || echo "Database not accessible"

# Connect to database shell
db-shell:
    @echo "🐘 Connecting to PostgreSQL shell..."
    docker-compose exec postgres psql -U sf10x_user -d sf10x

# === Development Setup ===

# Install Python dependencies
install:
    @echo "📦 Installing Python dependencies..."
    uv sync
    @echo "✅ Dependencies installed!"

# Full development setup (start db + install + migrate)
setup:
    @echo "🔧 Setting up development environment..."
    just install
    just db-start
    just db-migrate
    @echo "🎉 Development environment ready!"

# === Application Commands ===

# Start the FastAPI server
serve:
    @echo "🌐 Starting FastAPI server..."
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start Streamlit frontend
streamlit:
    @echo "🎨 Starting Streamlit frontend..."
    streamlit run app/streamlit_app.py

# === Testing & Linting ===

# Run tests (when available)
test:
    @echo "🧪 Running tests..."
    pytest tests/ -v

# Check code formatting
lint:
    @echo "🔍 Checking code format..."
    ruff check .
    ruff format --check .

# Format code
format:
    @echo "🎨 Formatting code..."
    ruff format .

# === Database Utilities ===

# Show database logs
db-logs:
    docker-compose logs -f postgres

# Backup database
db-backup:
    @echo "💾 Creating database backup..."
    @mkdir -p backups
    docker-compose exec postgres pg_dump -U sf10x_user -d sf10x > backups/sf10x_$(date +%Y%m%d_%H%M%S).sql
    @echo "✅ Backup created in backups/ directory"

# Restore database from backup
db-restore BACKUP_FILE:
    @echo "📥 Restoring database from {{BACKUP_FILE}}..."
    @if [ ! -f "{{BACKUP_FILE}}" ]; then echo "❌ Backup file not found: {{BACKUP_FILE}}"; exit 1; fi
    docker-compose exec -T postgres psql -U sf10x_user -d sf10x < {{BACKUP_FILE}}
    @echo "✅ Database restored!"

# Clean up database volumes (WARNING: destroys all data)
db-clean:
    @echo "⚠️  This will destroy ALL database data!"
    @echo "Press Ctrl+C to cancel, or Enter to continue..."
    @read
    docker-compose down -v
    docker volume rm sf10x_postgres_data 2>/dev/null || true
    @echo "🧹 Database volumes cleaned!"

# === Scraping Pipeline ===

# Start scraping SFGovTV (when implemented)
scrape:
    @echo "🕷️  Starting SFGovTV scraping..."
    python -m app.scraper.main

# Process existing transcripts with chunking
chunk-transcripts:
    @echo "✂️  Chunking existing transcripts..."
    python scripts/test_chunking.py

# === Docker Management ===

# View all containers
docker-ps:
    docker-compose ps

# View container logs
docker-logs SERVICE="postgres":
    docker-compose logs -f {{SERVICE}}

# Rebuild containers
docker-rebuild:
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d

# === Cleanup ===

# Clean up Python cache files
clean-python:
    @echo "🧹 Cleaning Python cache files..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    find . -type f -name "*.pyo" -delete 2>/dev/null || true

# Full cleanup (Python cache + Docker)
clean-all:
    just clean-python
    just db-clean

# === Help ===

# Show detailed help
help:
    @echo "SF10X Development Commands"
    @echo "=========================="
    @echo ""
    @echo "Quick Start:"
    @echo "  just setup     # Full development setup"
    @echo "  just serve     # Start API server"
    @echo ""
    @echo "Database:"
    @echo "  just db-start  # Start PostgreSQL"
    @echo "  just db-migrate# Run migrations"
    @echo "  just db-status # Check database status"
    @echo ""
    @echo "Development:"
    @echo "  just install   # Install dependencies"
    @echo "  just test      # Run tests"
    @echo "  just lint      # Check code format"
    @echo ""
    @echo "Use 'just --list' to see all available commands"