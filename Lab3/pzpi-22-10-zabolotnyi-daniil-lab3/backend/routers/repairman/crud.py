from typing import List
from fastapi import HTTPException
from pydantic import EmailStr
from sqlalchemy.orm import Session

from models.companies import Company
from models.repairmans import Repairman
from models.db_activity import DatabaseActivity, ActivityType
from datetime import datetime


def create_repairman_db(
    db: Session,
    first_name: str,
    surname: str,
    email: EmailStr,
    company_email: EmailStr,
) -> Repairman:
    existing_email = db.query(Repairman).filter(Repairman.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    company_id = None
    company_name = None
    if company_email:
        company = db.query(Company).filter(Company.email == company_email).first()
        if not company:
            raise HTTPException(
                status_code=404,
                detail=f"Company with email: {company_email} not found",
            )
        company_id = company.id
        company_name = company.name

    new_repairman = Repairman(
        first_name=first_name,
        surname=surname,
        email=email,
        company_id=company_id,
    )
    db.add(new_repairman)
    db.commit()
    db.refresh(new_repairman)
    
    # Створюємо активність для нового ремонтника
    details = f"Email: {new_repairman.email}"
    if company_name:
        details += f", Компанія: {company_name}"
    
    activity = DatabaseActivity(
        activity_type=ActivityType.USER_CREATED,
        entity_type="repairman",
        entity_id=new_repairman.id,
        description=f"Створено ремонтника '{new_repairman.first_name} {new_repairman.surname}'",
        details=details,
        performed_by="admin",
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    
    return new_repairman


def update_repairman_in_db(
    db: Session,
    repairman_id: int,
    first_name: str,
    surname: str,
    email: EmailStr,
    change_company_email: bool,
    company_email: EmailStr,
) -> Repairman:
    repairman = db.query(Repairman).filter(Repairman.id == repairman_id).first()
    if not repairman:
        raise HTTPException(status_code=404, detail="Repairman not found")

    existing_email = db.query(Repairman).filter(Repairman.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Зберігаємо старі значення для логування
    old_values = {
        "first_name": repairman.first_name,
        "surname": repairman.surname,
        "email": repairman.email,
        "company_id": repairman.company_id
    }
    old_company_name = None
    if repairman.company_id:
        old_company = db.query(Company).filter(Company.id == repairman.company_id).first()
        old_company_name = old_company.name if old_company else None

    new_company_name = None
    if change_company_email:
        repairman.company_id = None
        if company_email:
            company = db.query(Company).filter(Company.email == company_email).first()
            if not company:
                raise HTTPException(
                    status_code=404,
                    detail=f"Company with email: {company_email} not found",
                )
            repairman.company_id = company.id
            new_company_name = company.name

    if first_name:
        repairman.first_name = first_name
        if first_name == "none":
            repairman.first_name = None

    if surname:
        repairman.surname = surname
        if surname == "none":
            repairman.surname = None

    if email:
        repairman.email = email

    db.commit()
    db.refresh(repairman)

    # Створюємо активність для оновлення ремонтника
    changes = []
    if old_values["first_name"] != repairman.first_name:
        changes.append(f"Ім'я: '{old_values['first_name']}' → '{repairman.first_name}'")
    if old_values["surname"] != repairman.surname:
        changes.append(f"Прізвище: '{old_values['surname']}' → '{repairman.surname}'")
    if old_values["email"] != repairman.email:
        changes.append(f"Email: '{old_values['email']}' → '{repairman.email}'")
    if old_values["company_id"] != repairman.company_id:
        changes.append(f"Компанія: '{old_company_name or 'Немає'}' → '{new_company_name or 'Немає'}'")
    
    if changes:
        activity = DatabaseActivity(
            activity_type=ActivityType.USER_UPDATED,
            entity_type="repairman",
            entity_id=repairman.id,
            description=f"Оновлено ремонтника '{repairman.first_name} {repairman.surname}'",
            details="; ".join(changes),
            performed_by="admin",
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()

    return repairman


def get_all_repairmans_from_db(db: Session) -> List[Repairman]:
    return db.query(Repairman).order_by(Repairman.id).all()


def get_repairman_from_db(db: Session, repairman_id: int) -> Repairman:
    repairman = db.query(Repairman).filter(Repairman.id == repairman_id).first()
    if not repairman:
        raise HTTPException(status_code=404, detail="Repairman not found")

    return repairman


def delete_repairman_from_db(db: Session, repairman_id: int) -> Repairman:
    repairman = db.query(Repairman).filter(Repairman.id == repairman_id).first()
    if not repairman:
        raise HTTPException(status_code=404, detail="Repairman not found")

    # Зберігаємо дані для логування перед видаленням
    repairman_name = f"{repairman.first_name} {repairman.surname}"
    repairman_email = repairman.email
    
    company_name = None
    if repairman.company_id:
        company = db.query(Company).filter(Company.id == repairman.company_id).first()
        company_name = company.name if company else None
    
    db.delete(repairman)
    db.commit()
    
    # Створюємо активність для видалення ремонтника
    details = f"Email: {repairman_email}"
    if company_name:
        details += f", Компанія: {company_name}"
    
    activity = DatabaseActivity(
        activity_type=ActivityType.USER_DELETED,
        entity_type="repairman",
        entity_id=repairman_id,
        description=f"Видалено ремонтника '{repairman_name}'",
        details=details,
        performed_by="admin",
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    
    return repairman
