"""
Authentication service with business logic.
"""
import uuid
import secrets
from datetime import datetime, timedelta, date
from typing import Optional, Tuple
import bcrypt
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from ..models import User, PasswordResetToken, EmailVerificationToken, Employee
from ..schemas import (
    UserCreate, UserResponse, LoginRequest, LoginResponse, RegisterResponse,
    PasswordResetRequest, PasswordResetConfirm, ChangePasswordRequest,
    EmailVerificationRequest, CreateSuperAdminRequest, PromoteUserRequest
)
from ..core.config import settings
from ..repositories.user_repository import (
    UserRepository, PasswordResetTokenRepository, EmailVerificationTokenRepository
)
from ..repositories.employee_repository import EmployeeRepository


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.reset_token_repo = PasswordResetTokenRepository(db)
        self.verification_token_repo = EmailVerificationTokenRepository(db)
        self.employee_repo = EmployeeRepository(db)

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt directly. Truncates to 72 bytes for bcrypt compatibility."""
        # bcrypt has a 72-byte limit, truncate if necessary
        password_bytes = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash using bcrypt directly. Truncates to 72 bytes."""
        # bcrypt has a 72-byte limit, truncate if necessary
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    def create_access_token(self, user_id: uuid.UUID, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + settings.access_token_expire_delta
        
        to_encode = {
            "sub": str(user_id),
            "type": "access",
            "exp": expire
        }
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def create_refresh_token(self, user_id: uuid.UUID) -> str:
        """Create a JWT refresh token."""
        expire = datetime.utcnow() + settings.refresh_token_expire_delta
        to_encode = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": expire
        }
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def decode_token(self, token: str) -> Optional[dict]:
        """Decode and validate a JWT token."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None

    def register_user(self, user_data: UserCreate) -> Tuple[User, str, str]:
        """
        Register a new user.
        Returns: (user, access_token, refresh_token)
        """
        # Check if email exists
        if self.user_repo.get_by_email(user_data.email):
            raise ValueError("Email already registered")
        
        # Check if username exists
        if self.user_repo.get_by_username(user_data.username):
            raise ValueError("Username already taken")
        
        # Normalize phone - convert empty strings to None
        phone = user_data.phone if user_data.phone and user_data.phone.strip() else None
        
        # Check phone uniqueness if provided
        if phone and self.user_repo.get_by_phone(phone):
            raise ValueError("Phone number already registered")
        
        # Create user
        user_dict = {
            "email": user_data.email,
            "username": user_data.username,
            "password_hash": self.hash_password(user_data.password),
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "phone": phone,
            "is_active": True,
            "role": "user"
        }
        user = self.user_repo.create(user_dict)
        
        # Create employee record
        first_name = (user_data.first_name or user_data.username).title()
        last_name = (user_data.last_name or "").title()
        
        # Generate employee_id
        last_employee = self.employee_repo.get_last_employee()
        if last_employee:
            last_num = int(last_employee.employee_id.replace("EMP", ""))
            new_num = last_num + 1
        else:
            new_num = 1
        employee_id = f"EMP{new_num:04d}"
        
        # Create employee
        employee_dict = {
            "employee_id": employee_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": user_data.email,
            "phone": user_data.phone if user_data.phone else None,
            "hire_date": date.today(),
            "status": "active"
        }
        employee = self.employee_repo.create(employee_dict)
        
        # Link user to employee
        self.user_repo.link_employee(user, employee.id)
        
        # Generate tokens
        access_token = self.create_access_token(user.id)
        refresh_token = self.create_refresh_token(user.id)
        
        return user, access_token, refresh_token

    def login(self, login_data: LoginRequest) -> Tuple[User, str, str]:
        """
        Authenticate user and return tokens.
        Returns: (user, access_token, refresh_token)
        """
        user = self.user_repo.get_by_email(login_data.email)
        
        if not user:
            raise ValueError("Invalid credentials")
        
        if not user.is_active:
            raise ValueError("Account is inactive")
        
        if not self.verify_password(login_data.password, user.password_hash):
            raise ValueError("Invalid credentials")
        
        access_token = self.create_access_token(user.id)
        refresh_token = self.create_refresh_token(user.id)
        
        return user, access_token, refresh_token

    def get_current_user(self, user_id: uuid.UUID) -> Optional[User]:
        """Get current user by ID."""
        return self.user_repo.get_by_id(user_id)

    def request_password_reset(self, email: str) -> bool:
        """Request a password reset token."""
        user = self.user_repo.get_by_email(email)
        if not user:
            # Don't reveal if user exists
            return True
        
        # Mark existing tokens as used
        self.reset_token_repo.mark_all_used_for_user(user.id)
        
        # Create new token
        token_dict = {
            "user_id": user.id,
            "expires_at": datetime.utcnow() + timedelta(hours=1)
        }
        self.reset_token_repo.create(token_dict)
        
        # TODO: Send email with reset link
        return True

    def confirm_password_reset(self, token: uuid.UUID, new_password: str) -> bool:
        """Confirm password reset with token."""
        reset_token = self.reset_token_repo.get_by_token(token)
        
        if not reset_token or not reset_token.is_valid():
            raise ValueError("Invalid or expired token")
        
        # Update password
        self.user_repo.update_password(reset_token.user, self.hash_password(new_password))
        
        # Mark token as used
        self.reset_token_repo.mark_used(reset_token)
        
        return True

    def change_password(self, user: User, old_password: str, new_password: str) -> bool:
        """Change user's password."""
        if not self.verify_password(old_password, user.password_hash):
            raise ValueError("Old password is incorrect")
        
        self.user_repo.update_password(user, self.hash_password(new_password))
        return True

    def verify_email(self, token: uuid.UUID) -> bool:
        """Verify email with token."""
        verification_token = self.verification_token_repo.get_by_token(token)
        
        if not verification_token or not verification_token.is_valid():
            raise ValueError("Invalid or expired token")
        
        # Mark as verified
        self.verification_token_repo.mark_verified(verification_token)
        
        # Activate user
        user = verification_token.user
        user.is_active = True
        self.db.commit()
        
        return True

    def create_super_admin(self, data: CreateSuperAdminRequest) -> User:
        """Create a super admin user."""
        # Validate setup secret
        if data.setup_secret != settings.SUPERADMIN_SETUP_SECRET:
            raise ValueError("Invalid setup secret")
        
        # Check if email exists
        if self.user_repo.get_by_email(data.email):
            raise ValueError("Email already registered")
        
        # Check if username exists
        if self.user_repo.get_by_username(data.username):
            raise ValueError("Username already taken")
        
        # Create super admin
        user_dict = {
            "email": data.email,
            "username": data.username,
            "password_hash": self.hash_password(data.password),
            "is_active": True,
            "is_staff": True,
            "is_superuser": True,
            "role": "admin"
        }
        return self.user_repo.create(user_dict)

    def promote_user(self, user_id: uuid.UUID, make_superuser: bool, make_staff: bool, role: Optional[str]) -> User:
        """Promote or demote a user."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        return self.user_repo.update_role(
            user,
            role=role or ("admin" if make_superuser else user.role),
            is_staff=make_staff or make_superuser,
            is_superuser=make_superuser
        )
