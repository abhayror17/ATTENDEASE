#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Dropping existing tables with CASCADE..."
python -c "
from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    # Drop all tables with cascade
    result = conn.execute(text(\"SELECT tablename FROM pg_tables WHERE schemaname = 'public'\"))
    tables = [row[0] for row in result]
    for table in tables:
        conn.execute(text(f'DROP TABLE IF EXISTS {table} CASCADE'))
    conn.commit()
    print(f'Dropped {len(tables)} tables')
"

echo "Initializing database tables..."
python -c "from app.database import init_db; init_db()"

echo "Creating superadmin..."
python -c "
import os
import sys
sys.path.insert(0, '.')
from app.database import SessionLocal
from app.services.auth_service import AuthService
from app.schemas import CreateSuperAdminRequest

db = SessionLocal()
try:
    auth_service = AuthService(db)
    from app.repositories.user_repository import UserRepository
    user_repo = UserRepository(db)
    
    email = os.getenv('SUPERADMIN_EMAIL', 'admin@example.com')
    username = os.getenv('SUPERADMIN_USERNAME', 'admin')
    password = os.getenv('SUPERADMIN_PASSWORD', 'Admin@123')
    setup_secret = os.getenv('SUPERADMIN_SETUP_SECRET', '')
    
    if user_repo.get_by_email(email):
        print(f'Superadmin already exists: {email}')
    else:
        data = CreateSuperAdminRequest(
            email=email,
            username=username,
            password=password,
            setup_secret=setup_secret
        )
        user = auth_service.create_super_admin(data)
        print(f'Superadmin created successfully! Email: {email}, Username: {username}')
except Exception as e:
    print(f'ERROR creating superadmin: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()
"

echo "Build completed successfully!"