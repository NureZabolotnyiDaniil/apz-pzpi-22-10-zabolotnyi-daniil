from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from routers.admin.dependencies import get_current_admin
from models.admins import Admin
from database import get_db

from datetime import datetime
from routers.breakdown.schemas import BreakdownOut
from routers.breakdown.crud import (
    create_breakdown_db as create_breakdown,
    get_all_breakdowns_from_db as get_all_breakdowns,
    update_breakdown_in_db as update_breakdown,
    get_breakdown_from_db as get_breakdown,
    delete_breakdown_from_db,
)

router = APIRouter(prefix="/breakdown", tags=["breakdown"])

DATE_FORMAT = "%Y-%m-%d"
TIME_FORMAT = "%H:%M"
DATETIME_FORMAT = "%Y-%m-%d %H:%M"


@router.post("/add")
async def create_new_breakdown(
    lantern_id: int = Query(None, description="Foreign key of the table 'lanterns'"),
    date: str = Query(
        datetime.now().strftime(DATE_FORMAT),
        description=f"Date in format {DATE_FORMAT}",
    ),
    time: str = Query(
        datetime.now().strftime(TIME_FORMAT),
        description=f"Time in format {TIME_FORMAT}",
    ),
    description: Optional[str] = Query(default=None, description="Description"),
    status: str = Query(default="reported", description="Status of the breakdown"),
    priority: str = Query(default="medium", description="Priority level"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    try:
        date_obj = datetime.strptime(date, DATE_FORMAT)
        time_obj = datetime.strptime(time, TIME_FORMAT)

        datetime_combined = datetime.combine(date_obj, time_obj.time())

        create_breakdown(db, lantern_id, datetime_combined, description, status, priority)
        return {"message": "Breakdown added successfully"}
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date or time format. Expected formats are {DATE_FORMAT} and {TIME_FORMAT} respectively.",
        )


@router.get("/list", response_model=List[BreakdownOut])
async def get_breakdown_list(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    breakdowns = get_all_breakdowns(db)

    formatted_breakdowns = []
    for breakdown in breakdowns:
        breakdown_out = BreakdownOut(
            id=breakdown.id,
            lantern_id=breakdown.lantern_id,
            reported_at=breakdown.reported_at,
            description=breakdown.description,
            status=breakdown.status,
            priority=breakdown.priority,
            fixed_at=breakdown.fixed_at
        )
        formatted_breakdowns.append(breakdown_out)

    return formatted_breakdowns


@router.get("/info/{breakdown_id}", response_model=BreakdownOut)
def get_single_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    breakdown = get_breakdown(db, breakdown_id)

    breakdown_formated = BreakdownOut(
        id=breakdown.id,
        lantern_id=breakdown.lantern_id,
        reported_at=breakdown.reported_at,
        description=breakdown.description,
        status=breakdown.status,
        priority=breakdown.priority,
        fixed_at=breakdown.fixed_at
    )
    return breakdown_formated


@router.put("/update/{breakdown_id}", response_model=BreakdownOut)
def update_breakdown_details(
    breakdown_id: int,
    lantern_id: int = Query(None, description="Foreign key of the table 'lanterns'"),
    date: str = Query(
        None,
        description=f"Date in format {DATE_FORMAT}",
    ),
    time: str = Query(
        None,
        description=f"Time in format {TIME_FORMAT}",
    ),
    description: str = Query(
        default=None, description="Description. Enter 'none' to reset the value"
    ),
    status: str = Query(None, description="Status of the breakdown"),
    priority: str = Query(None, description="Priority level"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    breakdown = update_breakdown(
        db,
        breakdown_id,
        lantern_id,
        date,
        time,
        DATE_FORMAT,
        TIME_FORMAT,
        description,
        status,
        priority,
    )

    formatted_breakdown = BreakdownOut(
        id=breakdown.id,
        lantern_id=breakdown.lantern_id,
        reported_at=breakdown.reported_at,
        description=breakdown.description,
        status=breakdown.status,
        priority=breakdown.priority,
        fixed_at=breakdown.fixed_at
    )
    return formatted_breakdown


@router.delete("/delete/{breakdown_id}", response_model=BreakdownOut)
async def delete_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    breakdown = delete_breakdown_from_db(db, breakdown_id)

    formatted_breakdown = BreakdownOut(
        id=breakdown.id,
        lantern_id=breakdown.lantern_id,
        reported_at=breakdown.reported_at,
        description=breakdown.description,
        status=breakdown.status,
        priority=breakdown.priority,
        fixed_at=breakdown.fixed_at
    )
    return formatted_breakdown
