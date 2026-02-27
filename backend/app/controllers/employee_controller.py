"""
Employee controller (HTTP endpoints).
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse,
    MessageResponse, LinkUserRequest
)
from ..services.employee_service import EmployeeService
from ..core.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/employees", tags=["Employees"])


def _employee_to_response(employee) -> EmployeeResponse:
    """Convert Employee model to response schema."""
    return EmployeeResponse(
        id=employee.id,
        employee_id=employee.employee_id,
        first_name=employee.first_name,
        last_name=employee.last_name,
        full_name=employee.full_name,
        email=employee.email,
        phone=employee.phone,
        gender=employee.gender,
        date_of_birth=employee.date_of_birth,
        department_id=employee.department_id,
        department_name=employee.department.name if employee.department else None,
        position=employee.position,
        hire_date=employee.hire_date,
        status=employee.status,
        address=employee.address,
        avatar=employee.avatar,
        linked_user_email=employee.user_account.email if employee.user_account else None,
        user_role=employee.user_account.role if employee.user_account else None,
        is_superuser=employee.user_account.is_superuser if employee.user_account else False,
        created_at=employee.created_at,
        updated_at=employee.updated_at
    )


@router.get("", response_model=list[EmployeeListResponse])
def list_employees(
    status: Optional[str] = Query(None),
    department: Optional[uuid.UUID] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all employees with optional filters."""
    service = EmployeeService(db)
    employees = service.get_all(status=status, department_id=department, search=search)
    return [
        EmployeeListResponse(
            id=emp.id,
            employee_id=emp.employee_id,
            first_name=emp.first_name,
            last_name=emp.last_name,
            full_name=emp.full_name,
            email=emp.email,
            phone=emp.phone,
            gender=emp.gender,
            date_of_birth=emp.date_of_birth,
            department_id=emp.department_id,
            department_name=emp.department.name if emp.department else None,
            position=emp.position,
            status=emp.status,
            hire_date=emp.hire_date,
            address=emp.address,
            linked_user_email=emp.user_account.email if emp.user_account else None,
            user_role=emp.user_account.role if emp.user_account else None,
            is_superuser=emp.user_account.is_superuser if emp.user_account else False
        )
        for emp in employees
    ]


@router.get("/active", response_model=list[EmployeeListResponse])
def list_active_employees(
    department: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List active employees."""
    service = EmployeeService(db)
    employees = service.get_active(department_id=department)
    return [
        EmployeeListResponse(
            id=emp.id,
            employee_id=emp.employee_id,
            first_name=emp.first_name,
            last_name=emp.last_name,
            full_name=emp.full_name,
            email=emp.email,
            phone=emp.phone,
            gender=emp.gender,
            date_of_birth=emp.date_of_birth,
            department_id=emp.department_id,
            department_name=emp.department.name if emp.department else None,
            position=emp.position,
            status=emp.status,
            hire_date=emp.hire_date,
            address=emp.address,
            linked_user_email=emp.user_account.email if emp.user_account else None,
            user_role=emp.user_account.role if emp.user_account else None,
            is_superuser=emp.user_account.is_superuser if emp.user_account else False
        )
        for emp in employees
    ]


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get an employee by ID."""
    service = EmployeeService(db)
    employee = service.get_by_id(employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return _employee_to_response(employee)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_data: EmployeeCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new employee (admin only)."""
    service = EmployeeService(db)
    try:
        employee = service.create(employee_data)
        return _employee_to_response(employee)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: uuid.UUID,
    employee_data: EmployeeUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an employee (admin only)."""
    service = EmployeeService(db)
    try:
        employee = service.update(employee_id, employee_data)
        return _employee_to_response(employee)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{employee_id}", response_model=MessageResponse)
def delete_employee(
    employee_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an employee (admin only)."""
    service = EmployeeService(db)
    try:
        service.delete(employee_id)
        return MessageResponse(message="Employee deleted successfully.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{employee_id}/link-user", response_model=EmployeeResponse)
def link_user(
    employee_id: uuid.UUID,
    data: LinkUserRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Link a user account to an employee (admin only)."""
    service = EmployeeService(db)
    try:
        employee = service.link_user(employee_id, data.user_email)
        return _employee_to_response(employee)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{employee_id}/attendance", response_model=list)
def get_employee_attendance(
    employee_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get attendance history for an employee."""
    service = EmployeeService(db)
    employee = service.get_by_id(employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    
    records = service.get_attendance_history(employee_id)
    from ..schemas import AttendanceListResponse
    return [
        AttendanceListResponse(
            id=r.id,
            employee_id=r.employee_id,
            employee_id_code=r.employee.employee_id if r.employee else None,
            employee_name=r.employee.full_name if r.employee else None,
            department_name=r.employee.department.name if r.employee and r.employee.department else None,
            date=r.date,
            check_in=r.check_in,
            check_out=r.check_out,
            status=r.status,
            working_hours=r.working_hours
        )
        for r in records
    ]
