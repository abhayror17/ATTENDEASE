"""
Main FastAPI application entry point.
"""
import bcrypt
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .database import init_db, SessionLocal
from .models import User
from .controllers import (
    auth_controller,
    department_controller,
    employee_controller,
    attendance_controller,
    leave_controller
)


def create_superadmin_if_not_exists():
    """Create superadmin user if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if superadmin exists
        existing = db.query(User).filter(User.email == settings.SUPERADMIN_EMAIL).first()
        if existing:
            print(f"Superadmin already exists: {settings.SUPERADMIN_EMAIL}")
            return
        
        # Create superadmin - bcrypt has 72-byte limit
        password_bytes = settings.SUPERADMIN_PASSWORD.encode('utf-8')[:72]
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        superadmin = User(
            email=settings.SUPERADMIN_EMAIL,
            username=settings.SUPERADMIN_USERNAME,
            password_hash=password_hash,
            is_active=True,
            is_staff=True,
            is_superuser=True,
            role="admin"
        )
        db.add(superadmin)
        db.commit()
        print(f"Superadmin created: {settings.SUPERADMIN_EMAIL}")
    except Exception as e:
        print(f"Error creating superadmin: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup: Initialize database tables
    init_db()
    # Create superadmin if not exists
    create_superadmin_if_not_exists()
    yield
    # Shutdown: Cleanup if needed


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Employee Attendance Management System API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://[a-z0-9-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_controller.router, prefix="/api")
app.include_router(department_controller.router, prefix="/api")
app.include_router(employee_controller.router, prefix="/api")
app.include_router(attendance_controller.router, prefix="/api")
app.include_router(leave_controller.router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to AttendEase API",
        "docs": "/api/docs",
        "version": settings.APP_VERSION
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
