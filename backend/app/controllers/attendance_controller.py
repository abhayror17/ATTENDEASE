"""
Attendance controller (HTTP endpoints).
"""
import uuid
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    AttendanceCreate, AttendanceUpdate, AttendanceResponse, AttendanceListResponse,
    CheckInOutRequest, DailySummaryItem, AttendanceStatsResponse, MessageResponse
)
from ..services.attendance_service import AttendanceService
from ..core.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _attendance_to_response(attendance) -> AttendanceResponse:
    """Convert Attendance model to response schema."""
    return AttendanceResponse(
        id=attendance.id,
        employee_id=attendance.employee_id,
        employee_id_code=attendance.employee.employee_id if attendance.employee else None,
        employee_name=attendance.employee.full_name if attendance.employee else None,
        department_name=attendance.employee.department.name if attendance.employee and attendance.employee.department else None,
        date=attendance.date,
        check_in=attendance.check_in,
        check_out=attendance.check_out,
        status=attendance.status,
        working_hours=attendance.working_hours,
        notes=attendance.notes,
        created_at=attendance.created_at,
        updated_at=attendance.updated_at
    )


@router.get("", response_model=list[AttendanceListResponse])
def list_attendance(
    employee: Optional[uuid.UUID] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    department: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List attendance records with filters."""
    service = AttendanceService(db)
    records = service.get_all(
        employee_id=employee,
        date_from=date_from,
        date_to=date_to,
        status=status,
        department_id=department,
        user=current_user
    )
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


@router.get("/today", response_model=list[AttendanceListResponse])
def get_today_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's attendance records."""
    service = AttendanceService(db)
    records = service.get_today(user=current_user)
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


@router.get("/daily-summary", response_model=list[DailySummaryItem])
def get_daily_summary(
    date_param: Optional[date] = Query(None, alias="date"),
    department: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily summary for all employees."""
    service = AttendanceService(db)
    return service.get_daily_summary(
        target_date=date_param,
        department_id=department,
        status_filter=status
    )


@router.get("/stats", response_model=AttendanceStatsResponse)
def get_attendance_stats(
    date_param: Optional[date] = Query(None, alias="date"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get attendance statistics for a date."""
    service = AttendanceService(db)
    stats = service.get_stats(target_date=date_param)
    return AttendanceStatsResponse(**stats)


@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance(
    attendance_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get an attendance record by ID."""
    service = AttendanceService(db)
    record = service.get_by_id(attendance_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    return _attendance_to_response(record)


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def create_attendance(
    attendance_data: AttendanceCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create an attendance record (admin only)."""
    service = AttendanceService(db)
    try:
        record = service.create(attendance_data)
        return _attendance_to_response(record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: uuid.UUID,
    attendance_data: AttendanceUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an attendance record (admin only)."""
    service = AttendanceService(db)
    try:
        record = service.update(attendance_id, attendance_data)
        return _attendance_to_response(record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{attendance_id}", response_model=MessageResponse)
def delete_attendance(
    attendance_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an attendance record (admin only)."""
    service = AttendanceService(db)
    service.delete(attendance_id)
    return MessageResponse(message="Attendance record deleted successfully.")


@router.post("/check-in", response_model=AttendanceResponse)
def check_in(
    data: CheckInOutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check in an employee."""
    service = AttendanceService(db)
    try:
        record = service.check_in(data.employee, user=current_user)
        return _attendance_to_response(record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    data: CheckInOutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check out an employee."""
    service = AttendanceService(db)
    try:
        record = service.check_out(data.employee, user=current_user)
        return _attendance_to_response(record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
