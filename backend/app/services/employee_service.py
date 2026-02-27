"""
Employee service with business logic.
"""
import uuid
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session

from ..models import Employee, User
from ..schemas import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse,
    LinkUserRequest
)
from ..repositories.employee_repository import EmployeeRepository
from ..repositories.user_repository import UserRepository


class EmployeeService:
    """Service for employee operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.employee_repo = EmployeeRepository(db)
        self.user_repo = UserRepository(db)

    def get_all(self, status: Optional[str] = None, department_id: Optional[uuid.UUID] = None,
                search: Optional[str] = None) -> List[Employee]:
        """Get all employees with optional filters."""
        return self.employee_repo.get_filtered(
            status=status,
            department_id=department_id,
            search=search
        )

    def get_by_id(self, employee_id: uuid.UUID) -> Optional[Employee]:
        """Get employee by ID."""
        return self.employee_repo.get_by_id(employee_id)

    def get_by_employee_id(self, employee_id: str) -> Optional[Employee]:
        """Get employee by employee_id code."""
        return self.employee_repo.get_by_employee_id(employee_id)

    def create(self, employee_data: EmployeeCreate) -> Employee:
        """Create a new employee."""
        # Check email uniqueness
        if self.employee_repo.get_by_email(employee_data.email):
            raise ValueError("Employee with this email already exists")
        
        # Check phone uniqueness if provided
        if employee_data.phone and self.employee_repo.get_by_phone(employee_data.phone):
            raise ValueError("Employee with this phone number already exists")
        
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
            "first_name": employee_data.first_name.title(),
            "last_name": employee_data.last_name.title(),
            "email": employee_data.email,
            "phone": employee_data.phone,
            "gender": employee_data.gender.value if employee_data.gender else None,
            "date_of_birth": employee_data.date_of_birth,
            "department_id": employee_data.department_id,
            "position": employee_data.position,
            "hire_date": employee_data.hire_date,
            "address": employee_data.address,
            "status": "active"
        }
        employee = self.employee_repo.create(employee_dict)
        
        # Update linked user role if provided
        if employee_data.new_role and hasattr(employee, 'user_account') and employee.user_account:
            user = employee.user_account
            user.role = employee_data.new_role.value
            if employee_data.new_role.value == "admin":
                user.is_staff = True
            else:
                user.is_staff = False
                user.is_superuser = False
            self.db.commit()
        
        return employee

    def update(self, employee_id: uuid.UUID, employee_data: EmployeeUpdate) -> Employee:
        """Update an employee."""
        employee = self.employee_repo.get_by_id(employee_id)
        if not employee:
            raise ValueError("Employee not found")
        
        # Check email uniqueness if changing
        if employee_data.email and employee_data.email != employee.email:
            if self.employee_repo.get_by_email(employee_data.email):
                raise ValueError("Employee with this email already exists")
        
        # Check phone uniqueness if changing
        if employee_data.phone and employee_data.phone != employee.phone:
            if self.employee_repo.get_by_phone(employee_data.phone):
                raise ValueError("Employee with this phone number already exists")
        
        update_dict = employee_data.model_dump(exclude_unset=True)
        
        # Handle enum values
        if 'gender' in update_dict and update_dict['gender']:
            update_dict['gender'] = update_dict['gender'].value
        if 'status' in update_dict and update_dict['status']:
            update_dict['status'] = update_dict['status'].value
        
        # Title case names
        if 'first_name' in update_dict:
            update_dict['first_name'] = update_dict['first_name'].title()
        if 'last_name' in update_dict:
            update_dict['last_name'] = update_dict['last_name'].title()
        
        # Handle role update
        new_role = update_dict.pop('new_role', None)
        
        employee = self.employee_repo.update(employee, update_dict)
        
        # Sync department_id to linked user if department was updated
        if 'department_id' in update_dict and hasattr(employee, 'user_account') and employee.user_account:
            employee.user_account.department_id = update_dict['department_id']
            self.db.commit()
        
        # Update linked user role if provided
        if new_role and hasattr(employee, 'user_account') and employee.user_account:
            user = employee.user_account
            user.role = new_role.value if hasattr(new_role, 'value') else new_role
            if user.role == "admin":
                user.is_staff = True
            else:
                user.is_staff = False
                user.is_superuser = False
            self.db.commit()
        
        return employee

    def delete(self, employee_id: uuid.UUID) -> bool:
        """Delete an employee."""
        employee = self.employee_repo.get_by_id(employee_id)
        if not employee:
            raise ValueError("Employee not found")
        
        return self.employee_repo.delete(employee_id)

    def get_active(self, department_id: Optional[uuid.UUID] = None) -> List[Employee]:
        """Get active employees."""
        return self.employee_repo.get_active_employees(department_id)

    def link_user(self, employee_id: uuid.UUID, user_email: str) -> Employee:
        """Link a user account to an employee."""
        employee = self.employee_repo.get_by_id(employee_id)
        if not employee:
            raise ValueError("Employee not found")
        
        user = self.user_repo.get_by_email(user_email)
        if not user:
            raise ValueError(f"No user found with email: {user_email}")
        
        self.user_repo.link_employee(user, employee.id)
        return employee

    def get_attendance_history(self, employee_id: uuid.UUID):
        """Get attendance history for an employee."""
        from ..repositories.employee_repository import AttendanceRepository
        attendance_repo = AttendanceRepository(self.db)
        return attendance_repo.get_filtered(employee_id=employee_id)
