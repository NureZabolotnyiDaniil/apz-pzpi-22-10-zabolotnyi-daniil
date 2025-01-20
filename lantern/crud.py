from typing import List

from fastapi import HTTPException

from sqlalchemy.orm import Session

from lantern.models import Lantern
from lantern.schemas import AddRequest


def create_lantern(db: Session, lantern: AddRequest) -> Lantern:
    new_lantern = Lantern(
        base_brightness=lantern.base_brightness,
        active_brightness=lantern.active_brightness,
        active_time=lantern.active_time,
    )
    db.add(new_lantern)
    db.commit()
    db.refresh(new_lantern)
    return new_lantern


def get_all_lanterns(db: Session) -> List[Lantern]:
    return db.query(Lantern).order_by(Lantern.id).all()


def delete_lantern(db: Session, lantern_id: int) -> Lantern:
    lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
    if not lantern:
        raise HTTPException(status_code=404, detail="Lantern not found")
    db.delete(lantern)
    db.commit()
    return lantern
