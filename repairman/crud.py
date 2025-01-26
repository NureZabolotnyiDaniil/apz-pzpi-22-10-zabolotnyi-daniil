from typing import List
from fastapi import HTTPException
from pydantic import EmailStr
from sqlalchemy.orm import Session
from models.repairmans import Repairman


def create_repairman_db(
    db: Session,
    first_name: str,
    surname: str,
    email: EmailStr,
    company_email: EmailStr,
) -> Repairman:
    company_id = None
    if company_email:
        company_id = (
            db.query(Repairman.id).filter(Repairman.email == company_email).scalar()
        )
        if not company_id:
            raise HTTPException(
                status_code=404,
                detail=f"Company with email: {company_email} not found",
            )

    new_repairman = Repairman(
        first_name=first_name,
        surname=surname,
        email=email,
        company_id=company_id,
    )
    db.add(new_repairman)
    db.commit()
    db.refresh(new_repairman)
    return new_repairman


def update_repairman_in_db(
    db: Session,
    repairman_id: int,
    first_name: str,
    surname: str,
    email: EmailStr,
    company_email: EmailStr,
) -> Repairman:

    repairman = db.query(Repairman).filter(Repairman.id == repairman_id).first()
    if not repairman:
        raise HTTPException(status_code=404, detail="Repairman not found")

    if company_email:
        company_id = (
            db.query(Repairman.id).filter(Repairman.email == company_email).scalar()
        )
        if not company_id:
            raise HTTPException(
                status_code=404,
                detail=f"Company with email: {company_email} not found",
            )
        repairman.repairman_id = repairman_id

    if first_name:
        repairman.first_name = first_name

    if surname:
        repairman.surname = surname

    if email:
        repairman.email = email

    db.commit()
    db.refresh(repairman)
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

    db.delete(repairman)
    db.commit()
    return repairman
