"""
User repository for data access operations.
"""
import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from ..models import User, PasswordResetToken, EmailVerificationToken
from .base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model operations."""
    
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()

    def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone number."""
        return self.db.query(User).filter(User.phone == phone).first()

    def get_all_with_department(self) -> List[User]:
        """Get all users with department relationship loaded."""
        return self.db.query(User).all()

    def get_users_by_role(self, role: str) -> List[User]:
        """Get all users with a specific role."""
        return self.db.query(User).filter(User.role == role).all()

    def update_password(self, user: User, password_hash: str) -> User:
        """Update user's password hash."""
        user.password_hash = password_hash
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_role(self, user: User, role: str, is_staff: bool = False, is_superuser: bool = False) -> User:
        """Update user's role and permissions."""
        user.role = role
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        self.db.commit()
        self.db.refresh(user)
        return user

    def link_employee(self, user: User, employee_id: uuid.UUID) -> User:
        """Link a user to an employee record."""
        user.employee_id = employee_id
        user.is_employee = True
        self.db.commit()
        self.db.refresh(user)
        return user


class PasswordResetTokenRepository(BaseRepository[PasswordResetToken]):
    """Repository for PasswordResetToken model operations."""
    
    def __init__(self, db: Session):
        super().__init__(PasswordResetToken, db)

    def get_by_token(self, token: uuid.UUID) -> Optional[PasswordResetToken]:
        """Get token by UUID."""
        return self.db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token,
            PasswordResetToken.used == False
        ).first()

    def mark_used(self, token: PasswordResetToken) -> PasswordResetToken:
        """Mark token as used."""
        token.used = True
        self.db.commit()
        self.db.refresh(token)
        return token

    def mark_all_used_for_user(self, user_id: uuid.UUID) -> int:
        """Mark all unused tokens for a user as used."""
        count = self.db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user_id,
            PasswordResetToken.used == False
        ).update({"used": True})
        self.db.commit()
        return count


class EmailVerificationTokenRepository(BaseRepository[EmailVerificationToken]):
    """Repository for EmailVerificationToken model operations."""
    
    def __init__(self, db: Session):
        super().__init__(EmailVerificationToken, db)

    def get_by_token(self, token: uuid.UUID) -> Optional[EmailVerificationToken]:
        """Get token by UUID."""
        return self.db.query(EmailVerificationToken).filter(
            EmailVerificationToken.token == token,
            EmailVerificationToken.verified == False
        ).first()

    def mark_verified(self, token: EmailVerificationToken) -> EmailVerificationToken:
        """Mark token as verified."""
        token.verified = True
        self.db.commit()
        self.db.refresh(token)
        return token
