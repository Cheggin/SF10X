"""
Database connection utilities for async operations
"""

import os
from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
from loguru import logger

# Load environment variables
env_path = Path(__file__).parent.parent / "local.env"
load_dotenv(env_path)

# Get database URL from environment
DATABASE_URL = os.getenv("SUPABASE_DB_URL")

if not DATABASE_URL:
    raise ValueError("SUPABASE_DB_URL not found in environment variables")

# Create async engine with connection pooling disabled for Supabase
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    poolclass=NullPool,  # Disable connection pooling for Supabase
    connect_args={
        "statement_cache_size": 0,  # Disable prepared statements for pgbouncer
        "server_settings": {
            "jit": "off"  # Disable JIT for compatibility
        }
    }
)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Get async database session"""
    async with async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def test_connection():
    """Test database connection"""
    try:
        async with engine.begin() as conn:
            result = await conn.execute("SELECT 1")
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False