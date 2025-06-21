from datetime import datetime
from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.lanterns import Lantern
from models.breakdowns import Breakdown


def create_breakdown_db(
    db: Session,
    lantern_id: int,
    reported_at: datetime,
    description: str,
    status: str = "reported",
    priority: str = "medium",
) -> Breakdown:

    lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
    if not lantern:
        raise HTTPException(
            status_code=404, detail=f"Lantern with id: {lantern_id} not found"
        )

    new_breakdown = Breakdown(
        lantern_id=lantern_id,
        reported_at=reported_at,
        description=description,
        status=status,
        priority=priority,
    )
    db.add(new_breakdown)
    db.commit()
    db.refresh(new_breakdown)
    return new_breakdown


def update_breakdown_in_db(
    db: Session,
    breakdown_id: int,
    lantern_id: int = None,
    date: str = None,
    time: str = None,
    date_format: str = None,
    time_format: str = None,
    description: str = None,
    status: str = None,
    priority: str = None,
) -> Breakdown:

    breakdown = db.query(Breakdown).filter(Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")

    if lantern_id:
        lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
        if not lantern:
            raise HTTPException(status_code=404, detail="Lantern not found")
        breakdown.lantern_id = lantern_id

    if date:
        try:
            date_obj = datetime.strptime(date, date_format)
            datetime_combined = datetime.combine(date_obj, breakdown.reported_at.time())
            breakdown.reported_at = datetime_combined
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format. Expected format is {date_format}.",
            )

    if time:
        try:
            time_obj = datetime.strptime(time, time_format)
            datetime_combined = datetime.combine(breakdown.reported_at.date(), time_obj.time())
            breakdown.reported_at = datetime_combined
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid time format. Expected format is {time_format}.",
            )

    if description is not None:
        breakdown.description = description
        if description == "none":
            breakdown.description = None

    if status:
        breakdown.status = status

    if priority:
        breakdown.priority = priority

    db.commit()
    db.refresh(breakdown)
    return breakdown


def get_all_breakdowns_from_db(db: Session) -> List[Breakdown]:
    return db.query(Breakdown).order_by(Breakdown.id).all()


def get_breakdown_from_db(db: Session, breakdown_id: int) -> Breakdown:
    breakdown = db.query(Breakdown).filter(Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")

    return breakdown


def delete_breakdown_from_db(db: Session, breakdown_id: int) -> Breakdown:
    breakdown = db.query(Breakdown).filter(Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")

    db.delete(breakdown)
    db.commit()
    return breakdown
