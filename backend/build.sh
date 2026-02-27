#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Initializing database tables..."
python -c "from app.database import init_db; init_db()"

echo "Creating superadmin (if SUPERADMIN_SETUP_SECRET is set)..."
if [ -n "$SUPERADMIN_SETUP_SECRET" ]; then
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
    # Check if superadmin already exists
    from app.repositories.user_repository import UserRepository
    user_repo = UserRepository(db)
    if user_repo.get_by_email(os.getenv('SUPERADMIN_EMAIL', 'admin@example.com')):
        print('Superadmin already exists, skipping...')
    else:
        data = CreateSuperAdminRequest(
            email=os.getenv('SUPERADMIN_EMAIL', 'admin@example.com'),
            username=os.getenv('SUPERADMIN_USERNAME', 'admin'),
            password=os.getenv('SUPERADMIN_PASSWORD', 'Admin@123'),
            setup_secret=os.getenv('SUPERADMIN_SETUP_SECRET')
        )
        auth_service.create_super_admin(data)
        print('Superadmin created successfully!')
except Exception as e:
    print(f'Could not create superadmin: {e}')
finally:
    db.close()
"
fi

echo "Build completed successfully!"