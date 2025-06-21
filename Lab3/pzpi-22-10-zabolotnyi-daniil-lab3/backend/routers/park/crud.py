from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.parks import Park
from models.db_activity import DatabaseActivity, ActivityType
from decimal import Decimal
from datetime import datetime

from models.admins import Admin


def create_park_db(
    db: Session,
    name: str,
    latitude: float,
    longitude: float,
    area: str = None,
    address: str = None,
) -> Park:
    """
    Create new park
    :param db:
    :param name: park name
    :param latitude: park latitude
    :param longitude: park longitude
    :param area: park area
    :param address: park address
    """
    new_park = Park(
        name=name,
        latitude=Decimal(str(latitude)),
        longitude=Decimal(str(longitude)),
        area=area,
        address=address,
    )
    db.add(new_park)
    db.commit()
    db.refresh(new_park)

    # Створюємо активність для нового парку
    activity = DatabaseActivity(
        activity_type=ActivityType.USER_CREATED,
        entity_type="park",
        entity_id=new_park.id,
        description=f"Створено парк '{new_park.name}'",
        details=f"Координати: {latitude}, {longitude}, Адреса: {address or 'Не вказано'}",
        performed_by="admin",
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()

    return new_park


def update_park_in_db(
    db: Session,
    park_id: int,
    name: str,
    address: str,
    admin_id: int,
) -> Park:

    park = db.query(Park).filter(Park.id == park_id).first()
    if not park:
        raise HTTPException(status_code=404, detail="Park not found")
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if name:
        park.name = name
    if address:
        park.address = address
    if admin_id:
        park.admin_id = admin_id

    db.commit()
    db.refresh(park)
    return park


def get_all_parks_from_db(db: Session) -> List[Park]:
    return db.query(Park).order_by(Park.id).all()


def get_park_from_db(db: Session, park_id: int) -> Park:
    park = db.query(Park).filter(Park.id == park_id).first()
    if not park:
        raise HTTPException(status_code=404, detail="Park not found")

    return park


def delete_park_from_db(db: Session, park_id: int) -> Park:
    park = db.query(Park).filter(Park.id == park_id).first()
    if not park:
        raise HTTPException(status_code=404, detail="Park not found")

    db.delete(park)
    db.commit()
    return park
