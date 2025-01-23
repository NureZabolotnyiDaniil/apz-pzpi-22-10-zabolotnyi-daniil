from datetime import datetime
from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.lanterns import Lantern
from models.renovations import Renovation


def create_renovation_db(
    db: Session,
    lantern_id: int,
    date: datetime,
    status: str,
) -> Renovation:

    lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
    if not lantern:
        raise HTTPException(
            status_code=404, detail=f"Lantern with id: {lantern_id} not found"
        )

    new_renovation = Renovation(
        lantern_id=lantern_id,
        date=date,
        status=status,
    )
    db.add(new_renovation)
    db.commit()
    db.refresh(new_renovation)
    return new_renovation


def update_renovation_in_db(
    db: Session,
    renovation_id: int,
    lantern_id: int,
    date: str,
    time: str,
    date_format: str,
    time_format: str,
    status: str,
) -> Renovation:

    renovation = db.query(Renovation).filter(Renovation.id == renovation_id).first()
    if not renovation:
        raise HTTPException(status_code=404, detail="Renovation not found")
    if lantern_id:
        lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
        if not lantern:
            raise HTTPException(status_code=404, detail="Lantern not found")
        renovation.lantern_id = lantern_id
    if date:
        try:
            date_obj = datetime.strptime(date, date_format)

            datetime_combined = datetime.combine(date_obj, renovation.date.time())
            renovation.date = datetime_combined
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format. Expected format is {date_format}.",
            )
    if time:
        try:
            time_obj = datetime.strptime(time, time_format)

            datetime_combined = datetime.combine(
                renovation.date.date(), time_obj.time()
            )
            renovation.date = datetime_combined
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid time format. Expected format is {time_format}.",
            )
    if status:
        renovation.status = status

    db.commit()
    db.refresh(renovation)
    return renovation


def get_all_renovations_from_db(db: Session) -> List[Renovation]:
    return db.query(Renovation).order_by(Renovation.id).all()


def get_renovation_from_db(db: Session, renovation_id: int) -> Renovation:
    renovation = db.query(Renovation).filter(Renovation.id == renovation_id).first()
    if not renovation:
        raise HTTPException(status_code=404, detail="Renovation not found")

    return renovation


def delete_renovation_from_db(db: Session, renovation_id: int) -> Renovation:
    renovation = db.query(Renovation).filter(Renovation.id == renovation_id).first()
    if not renovation:
        raise HTTPException(status_code=404, detail="Renovation not found")

    db.delete(renovation)
    db.commit()
    return renovation
