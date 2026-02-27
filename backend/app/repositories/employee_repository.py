"""
Employee repository for data access operations.
"""
import uuid
from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from ..models import Employee, Attendance, LeaveRequest
from .base_repository import BaseRepository


class EmployeeRepository(BaseRepository[Employee]):
    """Repository for Employee model operations."""
    
    def __init__(self, db: Session):
        super().__init__(Employee, db)

    def get_by_employee_id(self, employee_id: str) -> Optional[Employee]:
        """Get employee by employee_id code."""
        return self.db.query(Employee).filter(Employee.employee_id == employee_id).first()

    def get_by_email(self, email: str) -> Optional[Employee]:
        """Get employee by email."""
        return self.db.query(Employee).filter(Employee.email == email).first()

    def get_by_phone(self, phone: str) -> Optional[Employee]:
        """Get employee by phone number."""
        return self.db.query(Employee).filter(Employee.phone == phone).first()

    def get_last_employee(self) -> Optional[Employee]:
        """Get the last created employee for ID generation."""
        return self.db.query(Employee).order_by(Employee.id.desc()).first()

    def get_all_with_department(self) -> List[Employee]:
        """Get all employees with department relationship loaded."""
        return self.db.query(Employee).options(joinedload(Employee.department)).all()

    def get_filtered(
        self,
        status: Optional[str] = None,
        department_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None
    ) -> List[Employee]:
        """Get employees with filters."""
        query = self.db.query(Employee).options(joinedload(Employee.department))
        
        if status:
            query = query.filter(Employee.status == status)
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Employee.first_name.ilike(search_term),
                    Employee.last_name.ilike(search_term),
                    Employee.employee_id.ilike(search_term),
                    Employee.email.ilike(search_term)
                )
            )
        return query.all()

    def get_active_employees(self, department_id: Optional[uuid.UUID] = None) -> List[Employee]:
        """Get all active employees, optionally filtered by department."""
        query = self.db.query(Employee).filter(Employee.status == 'active')
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        return query.options(joinedload(Employee.department)).all()

    def count_active(self) -> int:
        """Count active employees."""
        return self.db.query(Employee).filter(Employee.status == 'active').count()

    def count_by_status(self) -> dict:
        """Count employees by status."""
        from sqlalchemy import func
        result = self.db.query(
            Employee.status,
            func.count(Employee.id)
        ).group_by(Employee.status).all()
        return {status: count for status, count in result}


class AttendanceRepository(BaseRepository[Attendance]):
    """Repository for Attendance model operations."""
    
    def __init__(self, db: Session):
        super().__init__(Attendance, db)

    def get_by_employee_and_date(self, employee_id: uuid.UUID, date: date) -> Optional[Attendance]:
        """Get attendance record for an employee on a specific date."""
        return self.db.query(Attendance).filter(
            Attendance.employee_id == employee_id,
            Attendance.date == date
        ).options(joinedload(Attendance.employee)).first()

    def get_by_date(self, date: date) -> List[Attendance]:
        """Get all attendance records for a specific date."""
        return self.db.query(Attendance).filter(
            Attendance.date == date
        ).options(
            joinedload(Attendance.employee),
            joinedload(Attendance.employee).joinedload(Employee.department)
        ).all()

    def get_filtered(
        self,
        employee_id: Optional[uuid.UUID] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        status: Optional[str] = None,
        department_id: Optional[uuid.UUID] = None
    ) -> List[Attendance]:
        """Get attendance records with filters."""
        query = self.db.query(Attendance).options(
            joinedload(Attendance.employee),
            joinedload(Attendance.employee).joinedload(Employee.department)
        )
        
        if employee_id:
            query = query.filter(Attendance.employee_id == employee_id)
        if date_from:
            query = query.filter(Attendance.date >= date_from)
        if date_to:
            query = query.filter(Attendance.date <= date_to)
        if status:
            query = query.filter(Attendance.status == status)
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        
        return query.order_by(Attendance.date.desc()).all()

    def count_by_status(self, date: date) -> dict:
        """Count attendance records by status for a specific date."""
        from sqlalchemy import func
        result = self.db.query(
            Attendance.status,
            func.count(Attendance.id)
        ).filter(Attendance.date == date).group_by(Attendance.status).all()
        return {status: count for status, count in result}

    def count_for_date(self, date: date) -> int:
        """Count attendance records for a specific date."""
        return self.db.query(Attendance).filter(Attendance.date == date).count()


class LeaveRequestRepository(BaseRepository[LeaveRequest]):
    """Repository for LeaveRequest model operations."""
    
    def __init__(self, db: Session):
        super().__init__(LeaveRequest, db)

    def get_filtered(
        self,
        employee_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        leave_type: Optional[str] = None
    ) -> List[LeaveRequest]:
        """Get leave requests with filters."""
        query = self.db.query(LeaveRequest).options(
            joinedload(LeaveRequest.employee),
            joinedload(LeaveRequest.employee).joinedload(Employee.department),
            joinedload(LeaveRequest.reviewed_by)
        )
        
        if employee_id:
            query = query.filter(LeaveRequest.employee_id == employee_id)
        if status:
            query = query.filter(LeaveRequest.status == status)
        if leave_type:
            query = query.filter(LeaveRequest.leave_type == leave_type)
        
        return query.order_by(LeaveRequest.created_at.desc()).all()
