"""
Database initialization and seeding script.
Run this to create tables and optionally seed initial data.
"""
import sys
import os
import bcrypt

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db, engine
from app.models import User, Department, Employee


def hash_password(password: str) -> str:
    """Hash a password using bcrypt directly. Truncates to 72 bytes."""
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    init_db()
    print("Tables created successfully!")


def drop_tables():
    """Drop all database tables (use with caution!)."""
    print("Dropping all tables...")
    from app.database import Base
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped!")


def seed_departments():
    """Seed initial departments."""
    db = SessionLocal()
    try:
        # Check if departments exist
        if db.query(Department).first():
            print("Departments already exist, skipping seed...")
            return
        
        departments = [
            {"name": "Engineering", "description": "Software Engineering Department"},
            {"name": "Human Resources", "description": "HR Department"},
            {"name": "Finance", "description": "Finance and Accounting"},
            {"name": "Marketing", "description": "Marketing and Communications"},
            {"name": "Operations", "description": "Operations and Logistics"},
        ]
        
        for dept_data in departments:
            dept = Department(**dept_data)
            db.add(dept)
        
        db.commit()
        print(f"Created {len(departments)} departments.")
    except Exception as e:
        print(f"Error seeding departments: {e}")
        db.rollback()
    finally:
        db.close()


def create_superuser(email: str, username: str, password: str):
    """Create a superuser."""
    db = SessionLocal()
    try:
        # Check if user exists
        if db.query(User).filter(User.email == email).first():
            print(f"User with email {email} already exists.")
            return
        
        user = User(
            email=email,
            username=username,
            password_hash=hash_password(password),
            is_active=True,
            is_staff=True,
            is_superuser=True,
            role="admin"
        )
        db.add(user)
        db.commit()
        print(f"Superuser created: {email}")
    except Exception as e:
        print(f"Error creating superuser: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database management script")
    parser.add_argument("command", choices=["init", "reset", "seed", "superuser"],
                       help="Command to run")
    parser.add_argument("--email", default="admin@example.com", help="Superuser email")
    parser.add_argument("--username", default="admin", help="Superuser username")
    parser.add_argument("--password", default="Admin@123", help="Superuser password")
    
    args = parser.parse_args()
    
    if args.command == "init":
        create_tables()
    elif args.command == "reset":
        drop_tables()
        create_tables()
    elif args.command == "seed":
        create_tables()
        seed_departments()
    elif args.command == "superuser":
        create_superuser(args.email, args.username, args.password)
