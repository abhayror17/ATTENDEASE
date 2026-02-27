"""
Department service with business logic.
"""
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session

from ..models import Department
from ..schemas import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from ..repositories.department_repository import DepartmentRepository


class DepartmentService:
    """Service for department operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.department_repo = DepartmentRepository(db)

    def get_all(self) -> List[Department]:
        """Get all departments."""
        return self.department_repo.get_all_ordered()

    def get_by_id(self, department_id: uuid.UUID) -> Optional[Department]:
        """Get department by ID."""
        return self.department_repo.get_by_id(department_id)

    def create(self, department_data: DepartmentCreate) -> Department:
        """Create a new department."""
        # Check if name already exists
        if self.department_repo.get_by_name(department_data.name):
            raise ValueError("Department with this name already exists")
        
        department_dict = {
            "name": department_data.name,
            "description": department_data.description
        }
        return self.department_repo.create(department_dict)

    def update(self, department_id: uuid.UUID, department_data: DepartmentUpdate) -> Department:
        """Update a department."""
        department = self.department_repo.get_by_id(department_id)
        if not department:
            raise ValueError("Department not found")
        
        # Check name uniqueness if changing
        if department_data.name and department_data.name != department.name:
            if self.department_repo.get_by_name(department_data.name):
                raise ValueError("Department with this name already exists")
        
        update_dict = department_data.model_dump(exclude_unset=True)
        return self.department_repo.update(department, update_dict)

    def delete(self, department_id: uuid.UUID) -> bool:
        """Delete a department."""
        department = self.department_repo.get_by_id(department_id)
        if not department:
            raise ValueError("Department not found")
        
        # Check if department has employees
        employee_count = self.department_repo.get_employee_count(department_id)
        if employee_count > 0:
            raise ValueError("Cannot delete department with employees")
        
        return self.department_repo.delete(department_id)

    def get_employees(self, department_id: uuid.UUID) -> List:
        """Get employees in a department."""
        from ..repositories.employee_repository import EmployeeRepository
        employee_repo = EmployeeRepository(self.db)
        return employee_repo.get_filtered(department_id=department_id)
