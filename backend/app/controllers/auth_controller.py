"""
Authentication controller (HTTP endpoints).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    UserCreate, UserResponse, LoginRequest, LoginResponse, RegisterResponse,
    PasswordResetRequest, PasswordResetConfirm, ChangePasswordRequest,
    EmailVerificationRequest, CreateSuperAdminRequest, MessageResponse,
    ErrorResponse, UserListResponse, PromoteUserRequest, TokenResponse
)
from ..services.auth_service import AuthService
from ..core.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_to_response(user: User) -> UserResponse:
    """Convert User model to response schema."""
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        avatar=user.avatar,
        department_id=user.department_id,
        is_employee=user.is_employee,
        employee_id=user.employee_id,
        role=user.role,
        is_admin=user.is_admin,
        employee_id_code=user.employee.employee_id if user.employee else None,
        employee_full_name=user.employee.full_name if user.employee else None
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    auth_service = AuthService(db)
    try:
        user, access_token, refresh_token = auth_service.register_user(user_data)
        return RegisterResponse(
            user=_user_to_response(user),
            tokens=TokenResponse(access=access_token, refresh=refresh_token),
            message="Registration successful."
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login and get tokens."""
    auth_service = AuthService(db)
    try:
        user, access_token, refresh_token = auth_service.login(login_data)
        return LoginResponse(
            user=_user_to_response(user),
            tokens=TokenResponse(access=access_token, refresh=refresh_token),
            message="Login successful."
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout user."""
    # In a production system, you might want to blacklist the token
    return MessageResponse(message="Successfully logged out.")


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return _user_to_response(current_user)


@router.post("/password-reset/request", response_model=MessageResponse)
def request_password_reset(data: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset."""
    auth_service = AuthService(db)
    auth_service.request_password_reset(data.email)
    return MessageResponse(
        message="If an account with this email exists, a password reset link has been sent."
    )


@router.post("/password-reset/confirm", response_model=MessageResponse)
def confirm_password_reset(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Confirm password reset with token."""
    auth_service = AuthService(db)
    try:
        auth_service.confirm_password_reset(data.token, data.new_password)
        return MessageResponse(message="Password has been reset successfully.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password for authenticated user."""
    auth_service = AuthService(db)
    try:
        auth_service.change_password(current_user, data.old_password, data.new_password)
        return MessageResponse(message="Password changed successfully.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(data: EmailVerificationRequest, db: Session = Depends(get_db)):
    """Verify email with token."""
    auth_service = AuthService(db)
    try:
        auth_service.verify_email(data.token)
        return MessageResponse(message="Email verified successfully.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/superadmin", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_super_admin(data: CreateSuperAdminRequest, db: Session = Depends(get_db)):
    """Create super admin (requires setup secret)."""
    auth_service = AuthService(db)
    try:
        user = auth_service.create_super_admin(data)
        return _user_to_response(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/users", response_model=list[UserListResponse])
def list_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """List all users (admin only)."""
    from ..repositories.user_repository import UserRepository
    user_repo = UserRepository(db)
    users = user_repo.get_all_with_department()
    
    return [
        UserListResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            is_staff=user.is_staff,
            is_superuser=user.is_superuser,
            is_active=user.is_active,
            department_id=user.department_id,
            department_name=user.department.name if user.department else None,
            created_at=user.created_at
        )
        for user in users
    ]


@router.post("/users/promote", response_model=MessageResponse)
def promote_user(
    data: PromoteUserRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Promote or demote a user (admin only)."""
    # Prevent modifying yourself
    if data.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot modify your own permissions."
        )
    
    auth_service = AuthService(db)
    try:
        auth_service.promote_user(
            data.user_id,
            data.make_superuser,
            data.make_staff,
            data.role.value if data.role else None
        )
        return MessageResponse(message="User permissions updated successfully.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
