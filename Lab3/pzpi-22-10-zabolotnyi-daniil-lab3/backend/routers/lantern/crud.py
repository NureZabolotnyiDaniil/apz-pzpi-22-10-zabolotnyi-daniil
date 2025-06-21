from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.lanterns import Lantern
from models.parks import Park
from models.db_activity import DatabaseActivity, ActivityType
from datetime import datetime


def create_lantern_db(
    db: Session,
    base_brightness: int,
    active_brightness: int,
    active_time: int,
    status: str,
    park_id: int,
    performed_by: str = "admin",
) -> Lantern:
    park = db.query(Park).filter(Park.id == park_id).first()
    if not park:
        raise HTTPException(status_code=404, detail="Park not found")
    new_lantern = Lantern(
        base_brightness=base_brightness,
        active_brightness=active_brightness,
        active_time=active_time,
        status=status,
        park_id=park_id,
    )
    db.add(new_lantern)
    db.commit()
    db.refresh(new_lantern)
    
    # Створюємо активність для нового ліхтаря
    activity = DatabaseActivity(
        activity_type=ActivityType.LANTERN_CREATED,
        entity_type="lantern",
        entity_id=new_lantern.id,
        description=f"Створено новий ліхтар #{new_lantern.id}",
        details=f"Парк: {park.name}, Базова яскравість: {base_brightness}%, Активна яскравість: {active_brightness}%, Статус: {status}",
        performed_by=performed_by,
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    
    return new_lantern


def update_lantern_in_db(
    db: Session,
    lantern_id: int,
    base_brightness: int,
    active_brightness: int,
    active_time: int,
    status: str,
    park_id: int,
    latitude: float = None,
    longitude: float = None,
    performed_by: str = "admin",
) -> Lantern:
    lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
    if not lantern:
        raise HTTPException(status_code=404, detail="Lantern not found")

    changes = []

    if base_brightness is not None:
        lantern.base_brightness = base_brightness
        changes.append(f"базова яскравість: {base_brightness}%")

    if active_brightness is not None:
        lantern.active_brightness = active_brightness
        changes.append(f"активна яскравість: {active_brightness}%")

    if active_time is not None:
        lantern.active_time = active_time
        changes.append(f"час активності: {active_time}с")

    if status is not None:
        lantern.status = status
        changes.append(f"статус: {status}")

    if park_id is not None:
        if park_id == 0:
            lantern.park_id = None
            changes.append("парк: видалено")
        else:
            park = db.query(Park).filter(Park.id == park_id).first()
            if not park:
                raise HTTPException(status_code=404, detail="Park not found")
            lantern.park_id = park_id
            changes.append(f"парк: {park.name}")

    if latitude is not None:
        lantern.latitude = latitude
        changes.append(f"широта: {latitude}")

    if longitude is not None:
        lantern.longitude = longitude
        changes.append(f"довгота: {longitude}")

    db.commit()
    db.refresh(lantern)
    
    if changes:
        activity = DatabaseActivity(
            activity_type=ActivityType.LANTERN_UPDATED,
            entity_type="lantern",
            entity_id=lantern.id,
            description=f"Оновлено ліхтар #{lantern.id}",
            details=f"Зміни: {', '.join(changes)}",
            performed_by=performed_by,
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    
    return lantern


def get_all_lanterns_from_db(db: Session) -> List[Lantern]:
    return db.query(Lantern).order_by(Lantern.id).all()


def get_lantern_from_db(db: Session, lantern_id: int) -> Lantern:
    lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
    if not lantern:
        raise HTTPException(status_code=404, detail="Lantern not found")

    return lantern


def delete_lantern_from_db(db: Session, lantern_id: int, performed_by: str = "admin") -> Lantern:
    lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
    if not lantern:
        raise HTTPException(status_code=404, detail="Lantern not found")
    
    # Створюємо активність для видалення ліхтаря
    park = db.query(Park).filter(Park.id == lantern.park_id).first() if lantern.park_id else None
    activity = DatabaseActivity(
        activity_type=ActivityType.LANTERN_DELETED,
        entity_type="lantern",
        entity_id=lantern.id,
        description=f"Видалено ліхтар #{lantern.id}",
        details=f"Парк: {park.name if park else 'Не вказано'}, Статус: {lantern.status}",
        performed_by=performed_by,
        created_at=datetime.utcnow()
    )
    db.add(activity)
    
    db.delete(lantern)
    db.commit()
    return lantern
