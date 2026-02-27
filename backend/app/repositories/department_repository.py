"""
Department repository for data access operations.
"""
import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from ..models import Department
from .base_repository import BaseRepository


class DepartmentRepository(BaseRepository[Department]):
    """Repository for Department model operations."""
    
    def __init__(self, db: Session):
        super().__init__(Department, db)

    def get_by_name(self, name: str) -> Optional[Department]:
        """Get department by name."""
        return self.db.query(Department).filter(Department.name == name).first()

    def get_all_ordered(self) -> List[Department]:
        """Get all departments ordered by name."""
        return self.db.query(Department).order_by(Department.name).all()

    def get_with_employees(self, department_id: uuid.UUID) -> Optional[Department]:
        """Get department with employees loaded."""
        return self.db.query(Department).filter(Department.id == department_id).first()

    def get_employee_count(self, department_id: uuid.UUID) -> int:
        """Get count of employees in a department."""
        from ..models import Employee
        return self.db.query(Employee).filter(Employee.department_id == department_id).count()
