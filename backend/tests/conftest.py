"""
Pytest configuration and async test fixtures.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.database import Base, get_db
from app.main import create_app
from app.services.seed_data import seed_database


@pytest_asyncio.fixture(scope="function")
async def test_db_session():
    """Provides an isolated in-memory SQLite database session for tests."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with session_maker() as session:
        # Seed test database with Northern Command seed 26251
        await seed_database(session, seed=26251, force=True)
        yield session

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_client(test_db_session: AsyncSession):
    """Provides an HTTP async client hooked to test in-memory database."""
    app = create_app()

    async def override_get_db():
        yield test_db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

    app.dependency_overrides.clear()
