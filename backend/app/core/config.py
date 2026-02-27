"""
Core configuration settings for the FastAPI application.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from datetime import timedelta


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AttendEase API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 1
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/employee_attendance"
    )
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]
    
    # Email Settings
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USE_TLS: bool = os.getenv("EMAIL_USE_TLS", "True") == "True"
    EMAIL_HOST_USER: str = os.getenv("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD: str = os.getenv("EMAIL_HOST_PASSWORD", "")
    DEFAULT_FROM_EMAIL: str = os.getenv("DEFAULT_FROM_EMAIL", "noreply@attendease.com")
    
    # Super Admin Setup
    SUPERADMIN_SETUP_SECRET: str = os.getenv("SUPERADMIN_SETUP_SECRET", "")
    SUPERADMIN_EMAIL: str = os.getenv("SUPERADMIN_EMAIL", "admin@attendease.com")
    SUPERADMIN_USERNAME: str = os.getenv("SUPERADMIN_USERNAME", "admin")
    SUPERADMIN_PASSWORD: str = os.getenv("SUPERADMIN_PASSWORD", "Admin@123")
    
    # Timezone
    TIMEZONE: str = os.getenv("TIMEZONE", "Asia/Kolkata")

    @property
    def access_token_expire_delta(self) -> timedelta:
        return timedelta(hours=self.ACCESS_TOKEN_EXPIRE_HOURS)
    
    @property
    def refresh_token_expire_delta(self) -> timedelta:
        return timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
