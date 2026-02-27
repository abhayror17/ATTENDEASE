"""
SQLAlchemy models for the application.
"""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Text, ForeignKey, 
    Time, Enum, UniqueConstraint, Integer
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class Gender(str, enum.Enum):
    MALE = "M"
    FEMALE = "F"
    OTHER = "O"


class EmployeeStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    HALF_DAY = "half_day"
    ON_LEAVE = "on_leave"


class LeaveType(str, enum.Enum):
    ANNUAL = "annual"
    SICK = "sick"
    PERSONAL = "personal"
    MATERNITY = "maternity"
    PATERNITY = "paternity"
    UNPAID = "unpaid"
    OTHER = "other"


class LeaveRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(150), unique=True, nullable=False, index=True)
    email = Column(String(254), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(150), nullable=True)
    last_name = Column(String(150), nullable=True)
    phone = Column(String(17), nullable=True, unique=True)
    avatar = Column(String(255), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    is_employee = Column(Boolean, default=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, unique=True)
    role = Column(String(10), default=UserRole.USER.value)
    is_staff = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="users")
    employee = relationship("Employee", back_populates="user_account", uselist=False)
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    verification_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")
    reviewed_leave_requests = relationship("LeaveRequest", back_populates="reviewed_by")

    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value or self.is_superuser

    def __repr__(self):
        return f"<User {self.email}>"


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="reset_tokens")

    def is_valid(self) -> bool:
        return not self.used and self.expires_at > datetime.utcnow()

    def __repr__(self):
        return f"<PasswordResetToken for {self.user.email}>"


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    verified = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="verification_tokens")

    def is_valid(self) -> bool:
        return not self.verified and self.expires_at > datetime.utcnow()

    def __repr__(self):
        return f"<EmailVerificationToken for {self.user.email}>"


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employees = relationship("Employee", back_populates="department")
    users = relationship("User", back_populates="department")

    def __repr__(self):
        return f"<Department {self.name}>"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(String(20), unique=True, nullable=False, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(254), unique=True, nullable=False, index=True)
    phone = Column(String(17), unique=True, nullable=True)
    gender = Column(String(1), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    position = Column(String(100), nullable=True)
    hire_date = Column(Date, nullable=False)
    status = Column(String(20), default=EmployeeStatus.ACTIVE.value)
    address = Column(Text, nullable=True)
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="employees")
    user_account = relationship("User", back_populates="employee", uselist=False)
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<Employee {self.employee_id} - {self.full_name}>"


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint('employee_id', 'date', name='unique_employee_date'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    check_in = Column(Time, nullable=True)
    check_out = Column(Time, nullable=True)
    status = Column(String(20), default=AttendanceStatus.PRESENT.value)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="attendance_records")

    @property
    def working_hours(self) -> float:
        if self.check_in and self.check_out:
            from datetime import datetime, timedelta
            check_in_dt = datetime.combine(self.date, self.check_in)
            check_out_dt = datetime.combine(self.date, self.check_out)
            diff = check_out_dt - check_in_dt
            return round(diff.total_seconds() / 3600, 2)
        return None

    def __repr__(self):
        return f"<Attendance {self.employee.employee_id} - {self.date}>"


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    leave_type = Column(String(20), default=LeaveType.ANNUAL.value)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default=LeaveRequestStatus.PENDING.value)
    admin_comment = Column(Text, nullable=True)
    reviewed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="leave_requests")
    reviewed_by = relationship("User", back_populates="reviewed_leave_requests")

    @property
    def days_count(self) -> int:
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0

    def __repr__(self):
        return f"<LeaveRequest {self.employee.employee_id} - {self.start_date} to {self.end_date}>"
