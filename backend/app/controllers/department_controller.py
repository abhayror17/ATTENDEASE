"""
Department controller (HTTP endpoints).
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse, MessageResponse
)
from ..services.department_service import DepartmentService
from ..core.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/departments", tags=["Departments"])


def _department_to_response(department, db: Session) -> DepartmentResponse:
    """Convert Department model to response schema."""
    from ..repositories.department_repository import DepartmentRepository
    repo = DepartmentRepository(db)
    return DepartmentResponse(
        id=department.id,
        name=department.name,
        description=department.description,
        employee_count=repo.get_employee_count(department.id),
        created_at=department.created_at,
        updated_at=department.updated_at
    )


@router.get("", response_model=list[DepartmentResponse])
def list_departments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all departments."""
    service = DepartmentService(db)
    departments = service.get_all()
    return [_department_to_response(d, db) for d in departments]


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a department by ID."""
    service = DepartmentService(db)
    department = service.get_by_id(department_id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return _department_to_response(department, db)


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    department_data: DepartmentCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new department (admin only)."""
    service = DepartmentService(db)
    try:
        department = service.create(department_data)
        return _department_to_response(department, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: uuid.UUID,
    department_data: DepartmentUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a department (admin only)."""
    service = DepartmentService(db)
    try:
        department = service.update(department_id, department_data)
        return _department_to_response(department, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{department_id}", response_model=MessageResponse)
def delete_department(
    department_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a department (admin only)."""
    service = DepartmentService(db)
    try:
        service.delete(department_id)
        return MessageResponse(message="Department deleted successfully.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{department_id}/employees", response_model=list)
def get_department_employees(
    department_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get employees in a department."""
    service = DepartmentService(db)
    department = service.get_by_id(department_id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    employees = service.get_employees(department_id)
    from ..schemas import EmployeeListResponse
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
