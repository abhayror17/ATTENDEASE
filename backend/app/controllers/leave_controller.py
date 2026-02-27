"""
Leave request controller (HTTP endpoints).
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestResponse,
    LeaveRequestListResponse, LeaveRequestAction, MessageResponse
)
from ..services.leave_service import LeaveRequestService
from ..core.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/leave-requests", tags=["Leave Requests"])


def _leave_to_response(leave) -> LeaveRequestResponse:
    """Convert LeaveRequest model to response schema."""
    return LeaveRequestResponse(
        id=leave.id,
        employee_id=leave.employee_id,
        employee_id_code=leave.employee.employee_id if leave.employee else None,
        employee_name=leave.employee.full_name if leave.employee else None,
        department_name=leave.employee.department.name if leave.employee and leave.employee.department else None,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        days_count=leave.days_count,
        reason=leave.reason,
        status=leave.status,
        admin_comment=leave.admin_comment,
        reviewed_by_id=leave.reviewed_by_id,
        reviewed_by_name=leave.reviewed_by.full_name if leave.reviewed_by else None,
        reviewed_at=leave.reviewed_at,
        created_at=leave.created_at,
        updated_at=leave.updated_at
    )


@router.get("", response_model=list[LeaveRequestListResponse])
def list_leave_requests(
    employee: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    leave_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List leave requests with filters."""
    service = LeaveRequestService(db)
    requests = service.get_all(
        employee_id=employee,
        status=status,
        leave_type=leave_type,
        user=current_user
    )
    return [
        LeaveRequestListResponse(
            id=r.id,
            employee_id=r.employee_id,
            employee_id_code=r.employee.employee_id if r.employee else None,
            employee_name=r.employee.full_name if r.employee else None,
            department_name=r.employee.department.name if r.employee and r.employee.department else None,
            leave_type=r.leave_type,
            start_date=r.start_date,
            end_date=r.end_date,
            days_count=r.days_count,
            reason=r.reason,
            status=r.status,
            admin_comment=r.admin_comment,
            reviewed_by_id=r.reviewed_by_id,
            reviewed_by_name=r.reviewed_by.full_name if r.reviewed_by else None,
            reviewed_at=r.reviewed_at,
            created_at=r.created_at
        )
        for r in requests
    ]


@router.get("/{leave_id}", response_model=LeaveRequestResponse)
def get_leave_request(
    leave_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a leave request by ID."""
    service = LeaveRequestService(db)
    leave = service.get_by_id(leave_id)
    if not leave:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    return _leave_to_response(leave)


@router.post("", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
def create_leave_request(
    leave_data: LeaveRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a leave request."""
    service = LeaveRequestService(db)
    try:
        leave = service.create(leave_data, user=current_user)
        return _leave_to_response(leave)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{leave_id}", response_model=LeaveRequestResponse)
def update_leave_request(
    leave_id: uuid.UUID,
    leave_data: LeaveRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a leave request."""
    service = LeaveRequestService(db)
    try:
        leave = service.update(leave_id, leave_data)
        return _leave_to_response(leave)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{leave_id}", response_model=MessageResponse)
def delete_leave_request(
    leave_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a leave request."""
    service = LeaveRequestService(db)
    try:
        service.delete(leave_id)
        return MessageResponse(message="Leave request deleted successfully.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{leave_id}/approve", response_model=LeaveRequestResponse)
def approve_leave_request(
    leave_id: uuid.UUID,
    data: LeaveRequestAction,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Approve a leave request (admin only)."""
    service = LeaveRequestService(db)
    try:
        leave = service.approve(leave_id, data.admin_comment or "", current_user)
        return _leave_to_response(leave)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{leave_id}/reject", response_model=LeaveRequestResponse)
def reject_leave_request(
    leave_id: uuid.UUID,
    data: LeaveRequestAction,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Reject a leave request (admin only)."""
    service = LeaveRequestService(db)
    try:
        leave = service.reject(leave_id, data.admin_comment or "", current_user)
        return _leave_to_response(leave)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
