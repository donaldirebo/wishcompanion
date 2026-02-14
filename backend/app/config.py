from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database (with development default)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/wishcompanion"
    
    # Redis (with development default)
    REDIS_URL: str = "redis://localhost:6380"
    
    # Security (with development default)
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Optional
    IMGUR_CLIENT_ID: str = ""
    
    # Environment
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    LOG_LEVEL: str = "INFO"
    
    @property
    def cors_origins(self):
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(',')]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
