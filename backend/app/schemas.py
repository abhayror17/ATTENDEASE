"""
Pydantic schemas for request/response validation.
"""
import uuid
from datetime import datetime, date, time
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum


# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class Gender(str, Enum):
    MALE = "M"
    FEMALE = "F"
    OTHER = "O"


class EmployeeStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    HALF_DAY = "half_day"
    ON_LEAVE = "on_leave"


class LeaveType(str, Enum):
    ANNUAL = "annual"
    SICK = "sick"
    PERSONAL = "personal"
    MATERNITY = "maternity"
    PATERNITY = "paternity"
    UNPAID = "unpaid"
    OTHER = "other"


class LeaveRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# ============ User Schemas ============
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=150)
    first_name: Optional[str] = Field(None, max_length=150)
    last_name: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=17)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    password2: str = Field(..., min_length=8)

    @field_validator('password2')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    avatar: Optional[str]
    department_id: Optional[uuid.UUID]
    is_employee: bool
    employee_id: Optional[uuid.UUID]
    role: str
    is_admin: bool
    employee_id_code: Optional[str] = None
    employee_full_name: Optional[str] = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    full_name: str
    phone: Optional[str]
    role: str
    is_staff: bool
    is_superuser: bool
    is_active: bool
    department_id: Optional[uuid.UUID]
    department_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=150)
    last_name: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=17)
    avatar: Optional[str] = None


class PromoteUserRequest(BaseModel):
    user_id: uuid.UUID
    make_superuser: bool = False
    make_staff: bool = False
    role: Optional[UserRole] = None


# ============ Auth Schemas ============
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access: str
    refresh: str


class LoginResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
    message: str = "Login successful."


class RegisterResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
    message: str = "Registration successful."


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: uuid.UUID
    new_password: str = Field(..., min_length=8)
    new_password2: str = Field(..., min_length=8)

    @field_validator('new_password2')
    @classmethod
    def passwords_match(cls, v, info):
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)
    new_password2: str = Field(..., min_length=8)

    @field_validator('new_password2')
    @classmethod
    def passwords_match(cls, v, info):
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


class EmailVerificationRequest(BaseModel):
    token: uuid.UUID


class CreateSuperAdminRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=150)
    password: str = Field(..., min_length=8)
    setup_secret: str


# ============ Department Schemas ============
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class DepartmentResponse(DepartmentBase):
    id: uuid.UUID
    employee_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Employee Schemas ============
class EmployeeBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=17)
    gender: Optional[Gender] = None
    date_of_birth: Optional[date] = None
    position: Optional[str] = Field(None, max_length=100)
    hire_date: date
    address: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    department_id: Optional[uuid.UUID] = None
    new_role: Optional[UserRole] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=17)
    gender: Optional[Gender] = None
    date_of_birth: Optional[date] = None
    department_id: Optional[uuid.UUID] = None
    position: Optional[str] = Field(None, max_length=100)
    status: Optional[EmployeeStatus] = None
    address: Optional[str] = None
    new_role: Optional[UserRole] = None


class EmployeeResponse(EmployeeBase):
    id: uuid.UUID
    employee_id: str
    full_name: str
    department_id: Optional[uuid.UUID]
    department_name: Optional[str] = None
    status: str
    avatar: Optional[str]
    linked_user_email: Optional[str] = None
    user_role: Optional[str] = None
    is_superuser: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    id: uuid.UUID
    employee_id: str
    first_name: str
    last_name: str
    full_name: str
    email: str
    phone: Optional[str]
    gender: Optional[str]
    date_of_birth: Optional[date]
    department_id: Optional[uuid.UUID]
    department_name: Optional[str] = None
    position: Optional[str]
    status: str
    hire_date: date
    address: Optional[str]
    linked_user_email: Optional[str] = None
    user_role: Optional[str] = None
    is_superuser: bool = False

    class Config:
        from_attributes = True


class LinkUserRequest(BaseModel):
    user_email: EmailStr


# ============ Attendance Schemas ============
class AttendanceBase(BaseModel):
    employee_id: uuid.UUID
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: AttendanceStatus = AttendanceStatus.PRESENT
    notes: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    employee_id_code: Optional[str] = None
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    date: date
    check_in: Optional[time]
    check_out: Optional[time]
    status: str
    working_hours: Optional[float] = None
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AttendanceListResponse(BaseModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    employee_id_code: Optional[str] = None
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    date: date
    check_in: Optional[time]
    check_out: Optional[time]
    status: str
    working_hours: Optional[float] = None

    class Config:
        from_attributes = True


class CheckInOutRequest(BaseModel):
    employee: uuid.UUID


class DailySummaryItem(BaseModel):
    employee_id: uuid.UUID
    employee_id_code: str
    employee_name: str
    first_name: str
    department_id: Optional[uuid.UUID]
    department_name: Optional[str]
    date: date
    check_in: Optional[time]
    check_out: Optional[time]
    status: str
    attendance_id: Optional[uuid.UUID]
    working_hours: Optional[float]


class AttendanceStatsResponse(BaseModel):
    total_employees: int
    present: int
    absent: int
    late: int
    on_leave: int
    half_day: int
    not_checked_in: int


# ============ Leave Request Schemas ============
class LeaveRequestBase(BaseModel):
    leave_type: LeaveType = LeaveType.ANNUAL
    start_date: date
    end_date: date
    reason: str = Field(..., min_length=1)


class LeaveRequestCreate(LeaveRequestBase):
    employee_id: Optional[uuid.UUID] = None


class LeaveRequestUpdate(BaseModel):
    leave_type: Optional[LeaveType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None


class LeaveRequestResponse(BaseModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    employee_id_code: Optional[str] = None
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    days_count: int
    reason: str
    status: str
    admin_comment: Optional[str]
    reviewed_by_id: Optional[uuid.UUID]
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeaveRequestListResponse(BaseModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    employee_id_code: Optional[str] = None
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    days_count: int
    reason: str
    status: str
    admin_comment: Optional[str]
    reviewed_by_id: Optional[uuid.UUID]
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class LeaveRequestAction(BaseModel):
    admin_comment: Optional[str] = ""


# ============ Common Schemas ============
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    error: str


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    size: int
    pages: int
