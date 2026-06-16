from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings
import asyncpg

# SQLAlchemy async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=0
)

# Session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Dependency for raw asyncpg connection pool
_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            min_size=10,
            max_size=20
        )
        # Auto-create invitations table if not exists
        async with _pool.acquire() as connection:
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS invitations (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
                    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
    return _pool

async def get_db():
    """Dependency to get asyncpg connection"""
    pool = await get_pool()
    async with pool.acquire() as connection:
        yield connection

async def close_pool():
    """Close database pool on shutdown"""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
