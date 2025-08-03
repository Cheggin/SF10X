#!/usr/bin/env python3
"""
Simple script to test database connection
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from database.connection import test_connection

async def main():
    print("Testing database connection...")
    success = await test_connection()
    if success:
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed!")
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)