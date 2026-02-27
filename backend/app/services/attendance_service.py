"""
Attendance service with business logic.
"""
import uuid
from typing import List, Optional, Dict, Any
from datetime import date, datetime, time
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo

from ..models import Employee, Attendance
from ..schemas import (
    AttendanceCreate, AttendanceUpdate, AttendanceResponse, AttendanceListResponse,
    CheckInOutRequest, DailySummaryItem, AttendanceStatsResponse
)
from ..repositories.employee_repository import AttendanceRepository, EmployeeRepository
from ..core.config import settings


class AttendanceService:
    """Service for attendance operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.attendance_repo = AttendanceRepository(db)
        self.employee_repo = EmployeeRepository(db)

    def _get_local_datetime(self) -> datetime:
        """Get current datetime in configured timezone."""
        tz = ZoneInfo(settings.TIMEZONE)
        return datetime.now(tz)

    def _get_local_date(self) -> date:
        """Get current date in configured timezone."""
        return self._get_local_datetime().date()

    def _get_local_time(self) -> time:
        """Get current time in configured timezone."""
        return self._get_local_datetime().time()

    def get_all(self, employee_id: Optional[uuid.UUID] = None, 
                date_from: Optional[date] = None, date_to: Optional[date] = None,
                status: Optional[str] = None, department_id: Optional[uuid.UUID] = None,
                user: Optional[Any] = None) -> List[Attendance]:
        """Get all attendance records with filters."""
        # Non-admin users can only see their own attendance
        if user and not user.is_admin:
            if hasattr(user, 'employee') and user.employee:
                employee_id = user.employee.id
            else:
                return []
        
        return self.attendance_repo.get_filtered(
            employee_id=employee_id,
            date_from=date_from,
            date_to=date_to,
            status=status,
            department_id=department_id
        )

    def get_by_id(self, attendance_id: uuid.UUID) -> Optional[Attendance]:
        """Get attendance record by ID."""
        return self.attendance_repo.get_by_id(attendance_id)

    def create(self, attendance_data: AttendanceCreate) -> Attendance:
        """Create an attendance record."""
        # Check if employee exists
        employee = self.employee_repo.get_by_id(attendance_data.employee_id)
        if not employee:
            raise ValueError("Employee not found")
        
        # Check for existing record on same date
        existing = self.attendance_repo.get_by_employee_and_date(
            attendance_data.employee_id, attendance_data.date
        )
        if existing:
            raise ValueError("Attendance record already exists for this date")
        
        attendance_dict = {
            "employee_id": attendance_data.employee_id,
            "date": attendance_data.date,
            "check_in": attendance_data.check_in,
            "check_out": attendance_data.check_out,
            "status": attendance_data.status.value,
            "notes": attendance_data.notes
        }
        return self.attendance_repo.create(attendance_dict)

    def update(self, attendance_id: uuid.UUID, attendance_data: AttendanceUpdate) -> Attendance:
        """Update an attendance record."""
        attendance = self.attendance_repo.get_by_id(attendance_id)
        if not attendance:
            raise ValueError("Attendance record not found")
        
        update_dict = attendance_data.model_dump(exclude_unset=True)
        if 'status' in update_dict and update_dict['status']:
            update_dict['status'] = update_dict['status'].value
        
        return self.attendance_repo.update(attendance, update_dict)

    def delete(self, attendance_id: uuid.UUID) -> bool:
        """Delete an attendance record."""
        return self.attendance_repo.delete(attendance_id)

    def get_today(self, user: Optional[Any] = None) -> List[Attendance]:
        """Get today's attendance records."""
        today = self._get_local_date()
        return self.get_all(user=user, date_from=today, date_to=today)

    def get_daily_summary(self, target_date: Optional[date] = None, 
                         department_id: Optional[uuid.UUID] = None,
                         status_filter: Optional[str] = None) -> List[Dict]:
        """Get daily summary for all employees."""
        if target_date is None:
            target_date = self._get_local_date()
        
        # Get active employees
        employees = self.employee_repo.get_active_employees(department_id)
        
        # Get attendance for the date
        attendance_records = self.attendance_repo.get_by_date(target_date)
        attendance_map = {r.employee_id: r for r in attendance_records}
        
        result = []
        for employee in employees:
            attendance = attendance_map.get(employee.id)
            record = {
                'employee_id': employee.id,
                'employee_id_code': employee.employee_id,
                'employee_name': employee.full_name,
                'first_name': employee.first_name,
                'department_id': employee.department_id,
                'department_name': employee.department.name if employee.department else None,
                'date': target_date,
                'check_in': attendance.check_in if attendance else None,
                'check_out': attendance.check_out if attendance else None,
                'status': attendance.status if attendance else 'not_checked_in',
                'attendance_id': attendance.id if attendance else None,
                'working_hours': attendance.working_hours if attendance else None,
            }
            
            if status_filter and record['status'] != status_filter:
                continue
            
            result.append(record)
        
        return result

    def get_stats(self, target_date: Optional[date] = None) -> Dict:
        """Get attendance statistics for a date."""
        if target_date is None:
            target_date = self._get_local_date()
        
        total_employees = self.employee_repo.count_active()
        status_counts = self.attendance_repo.count_by_status(target_date)
        checked_in_count = self.attendance_repo.count_for_date(target_date)
        
        return {
            'total_employees': total_employees,
            'present': status_counts.get('present', 0),
            'absent': status_counts.get('absent', 0),
            'late': status_counts.get('late', 0),
            'on_leave': status_counts.get('on_leave', 0),
            'half_day': status_counts.get('half_day', 0),
            'not_checked_in': max(0, total_employees - checked_in_count)
        }

    def check_in(self, employee_id: uuid.UUID, user: Optional[Any] = None) -> Attendance:
        """Check in an employee."""
        # Validate permissions
        if user and not user.is_admin:
            if not hasattr(user, 'employee') or str(user.employee.id) != str(employee_id):
                raise ValueError("You can only check in for yourself")
        
        today = self._get_local_date()
        current_time = self._get_local_time()
        
        # Get or create attendance record
        attendance = self.attendance_repo.get_by_employee_and_date(employee_id, today)
        
        if attendance:
            if attendance.check_in:
                raise ValueError("Already checked in today")
            attendance.check_in = current_time
            attendance.status = 'present'
            self.db.commit()
            self.db.refresh(attendance)
        else:
            attendance_dict = {
                "employee_id": employee_id,
                "date": today,
                "check_in": current_time,
                "status": "present"
            }
            attendance = self.attendance_repo.create(attendance_dict)
        
        return attendance

    def check_out(self, employee_id: uuid.UUID, user: Optional[Any] = None) -> Attendance:
        """Check out an employee."""
        # Validate permissions
        if user and not user.is_admin:
            if not hasattr(user, 'employee') or str(user.employee.id) != str(employee_id):
                raise ValueError("You can only check out for yourself")
        
        today = self._get_local_date()
        current_time = self._get_local_time()
        
        attendance = self.attendance_repo.get_by_employee_and_date(employee_id, today)
        
        if not attendance:
            raise ValueError("No check-in record found for today")
        
        attendance.check_out = current_time
        self.db.commit()
        self.db.refresh(attendance)
        
        return attendance
