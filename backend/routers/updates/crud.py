from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.updates import Update
from .schemas import UpdateCreate, UpdateUpdate
from typing import List, Optional


def create_update(db: Session, update_data: UpdateCreate) -> Update:
    """Створити нове оновлення"""
    db_update = Update(**update_data.dict())
    db.add(db_update)
    db.commit()
    db.refresh(db_update)
    return db_update


def get_updates(db: Session, skip: int = 0, limit: int = 10) -> List[Update]:
    """Отримати список оновлень"""
    return db.query(Update).order_by(desc(Update.created_at)).offset(skip).limit(limit).all()


def get_update(db: Session, update_id: int) -> Optional[Update]:
    """Отримати конкретне оновлення"""
    return db.query(Update).filter(Update.id == update_id).first()


def update_update(db: Session, update_id: int, update_data: UpdateUpdate) -> Optional[Update]:
    """Оновити існуюче оновлення"""
    db_update = db.query(Update).filter(Update.id == update_id).first()
    if not db_update:
        return None
    
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_update, key, value)
    
    db.commit()
    db.refresh(db_update)
    return db_update


def delete_update(db: Session, update_id: int) -> bool:
    """Видалити оновлення"""
    db_update = db.query(Update).filter(Update.id == update_id).first()
    if not db_update:
        return False
    
    db.delete(db_update)
    db.commit()
    return True 