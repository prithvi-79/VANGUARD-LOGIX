"""
Standalone database initializer & deterministic seeder for Northern Command XIV Corps.
Usage: python backend/seed.py [--force]
"""

import sys
import asyncio
from app.core.database import init_db, AsyncSessionLocal
from app.services.seed_data import seed_database
from app.core.config import settings


async def main():
    force = "--force" in sys.argv
    print(f"[*] Initializing {settings.PROJECT_NAME} database ({settings.DATABASE_URL})...")
    await init_db()
    print("[+] Database tables verified/created.")

    print(f"[*] Seeding Northern Command XIV Corps theater (fixed seed={settings.SEED}, force={force})...")
    async with AsyncSessionLocal() as session:
        result = await seed_database(session, seed=settings.SEED, force=force)
        print(f"[+] Seed Result: {result}")


if __name__ == "__main__":
    asyncio.run(main())
