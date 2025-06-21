from typing import List
from fastapi import HTTPException
from pydantic import EmailStr
from sqlalchemy.orm import Session
from models.companies import Company
from models.db_activity import DatabaseActivity, ActivityType
from datetime import datetime


def create_company_db(
    db: Session,
    name: str,
    email: EmailStr,
    address: str,
    notes: str,
) -> Company:
    existing_email = db.query(Company).filter(Company.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_company = Company(
        name=name,
        email=email,
        address=address,
        notes=notes,
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    
    # Створюємо активність для нової компанії
    activity = DatabaseActivity(
        activity_type=ActivityType.USER_CREATED,  # Використовуємо як загальний тип для компаній
        entity_type="company",
        entity_id=new_company.id,
        description=f"Створено компанію '{new_company.name}'",
        details=f"Email: {new_company.email}, Адреса: {new_company.address}",
        performed_by="admin",
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    
    return new_company


def update_company_in_db(
    db: Session,
    company_id: int,
    name: str,
    email: EmailStr,
    address: str,
    notes: str,
) -> Company:

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    existing_email = db.query(Company).filter(Company.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Зберігаємо старі значення для логування
    old_values = {
        "name": company.name,
        "email": company.email,
        "address": company.address,
        "notes": company.notes
    }

    if name:
        company.name = name
        if name == "none":
            company.name = None

    if email:
        company.email = email

    if address:
        company.address = address
        if address == "none":
            company.address = None

    if notes:
        company.notes = notes
        if notes == "none":
            company.notes = None

    db.commit()
    db.refresh(company)
    
    # Створюємо активність для оновлення компанії
    changes = []
    if old_values["name"] != company.name:
        changes.append(f"Назва: '{old_values['name']}' → '{company.name}'")
    if old_values["email"] != company.email:
        changes.append(f"Email: '{old_values['email']}' → '{company.email}'")
    if old_values["address"] != company.address:
        changes.append(f"Адреса: '{old_values['address']}' → '{company.address}'")
    if old_values["notes"] != company.notes:
        changes.append(f"Нотатки: '{old_values['notes']}' → '{company.notes}'")
    
    if changes:
        activity = DatabaseActivity(
            activity_type=ActivityType.USER_UPDATED,
            entity_type="company",
            entity_id=company.id,
            description=f"Оновлено компанію '{company.name}'",
            details="; ".join(changes),
            performed_by="admin",
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    
    return company


def get_all_companies_from_db(db: Session) -> List[Company]:
    return db.query(Company).order_by(Company.id).all()


def get_company_from_db(db: Session, company_id: int) -> Company:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    return company


def delete_company_from_db(db: Session, company_id: int) -> Company:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Зберігаємо дані для логування перед видаленням
    company_name = company.name
    company_email = company.email
    
    db.delete(company)
    db.commit()
    
    # Створюємо активність для видалення компанії
    activity = DatabaseActivity(
        activity_type=ActivityType.USER_DELETED,
        entity_type="company",
        entity_id=company_id,
        description=f"Видалено компанію '{company_name}'",
        details=f"Email: {company_email}",
        performed_by="admin",
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    
    return company
