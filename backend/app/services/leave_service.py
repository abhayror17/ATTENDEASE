"""
Leave request service with business logic.
"""
import uuid
from typing import List, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session

from ..models import LeaveRequest, User
from ..schemas import (
    LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestResponse,
    LeaveRequestListResponse, LeaveRequestAction
)
from ..repositories.employee_repository import LeaveRequestRepository, EmployeeRepository


class LeaveRequestService:
    """Service for leave request operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.leave_repo = LeaveRequestRepository(db)
        self.employee_repo = EmployeeRepository(db)

    def get_all(self, employee_id: Optional[uuid.UUID] = None,
                status: Optional[str] = None, leave_type: Optional[str] = None,
                user: Optional[Any] = None) -> List[LeaveRequest]:
        """Get all leave requests with filters."""
        # Non-admin users can only see their own requests
        if user and not user.is_admin:
            if hasattr(user, 'employee') and user.employee:
                employee_id = user.employee.id
            else:
                return []
        
        return self.leave_repo.get_filtered(
            employee_id=employee_id,
            status=status,
            leave_type=leave_type
        )

    def get_by_id(self, leave_id: uuid.UUID) -> Optional[LeaveRequest]:
        """Get leave request by ID."""
        return self.leave_repo.get_by_id(leave_id)

    def create(self, leave_data: LeaveRequestCreate, user: Optional[Any] = None) -> LeaveRequest:
        """Create a leave request."""
        # Determine employee
        employee_id = leave_data.employee_id
        
        if user and not user.is_admin:
            if hasattr(user, 'employee') and user.employee:
                employee_id = user.employee.id
            else:
                raise ValueError("Your account is not linked to an employee profile")
        elif not employee_id:
            raise ValueError("Employee is required")
        
        # Validate employee exists
        employee = self.employee_repo.get_by_id(employee_id)
        if not employee:
            raise ValueError("Employee not found")
        
        leave_dict = {
            "employee_id": employee_id,
            "leave_type": leave_data.leave_type.value,
            "start_date": leave_data.start_date,
            "end_date": leave_data.end_date,
            "reason": leave_data.reason,
            "status": "pending"
        }
        return self.leave_repo.create(leave_dict)

    def update(self, leave_id: uuid.UUID, leave_data: LeaveRequestUpdate) -> LeaveRequest:
        """Update a leave request."""
        leave = self.leave_repo.get_by_id(leave_id)
        if not leave:
            raise ValueError("Leave request not found")
        
        if leave.status != "pending":
            raise ValueError("Cannot modify processed leave request")
        
        update_dict = leave_data.model_dump(exclude_unset=True)
        if 'leave_type' in update_dict and update_dict['leave_type']:
            update_dict['leave_type'] = update_dict['leave_type'].value
        
        return self.leave_repo.update(leave, update_dict)

    def delete(self, leave_id: uuid.UUID) -> bool:
        """Delete a leave request."""
        leave = self.leave_repo.get_by_id(leave_id)
        if not leave:
            raise ValueError("Leave request not found")
        
        if leave.status != "pending":
            raise ValueError("Cannot delete processed leave request")
        
        return self.leave_repo.delete(leave_id)

    def approve(self, leave_id: uuid.UUID, admin_comment: str, admin_user: User) -> LeaveRequest:
        """Approve a leave request."""
        leave = self.leave_repo.get_by_id(leave_id)
        if not leave:
            raise ValueError("Leave request not found")
        
        leave.status = "approved"
        leave.admin_comment = admin_comment
        leave.reviewed_by_id = admin_user.id
        leave.reviewed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(leave)
        
        return leave

    def reject(self, leave_id: uuid.UUID, admin_comment: str, admin_user: User) -> LeaveRequest:
        """Reject a leave request."""
        leave = self.leave_repo.get_by_id(leave_id)
        if not leave:
            raise ValueError("Leave request not found")
        
        leave.status = "rejected"
        leave.admin_comment = admin_comment
        leave.reviewed_by_id = admin_user.id
        leave.reviewed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(leave)
        
        return leave
