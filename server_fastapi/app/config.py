from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    # Database
    DB_HOST: str
    DB_PORT: int = 5432
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 10080  # 7 days
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # App
    APP_NAME: str = "SkillBridge API"
    DEBUG: bool = True
    
    # Optional APIs
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: Optional[str] = "gpt-4-turbo-preview"
    YOUTUBE_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def SYNC_DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        # Look for .env in parent directory (server_fastapi/)
        env_file = str(Path(__file__).parent.parent / ".env")
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
