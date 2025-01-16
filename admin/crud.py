from datetime import datetime, timedelta
from typing import List

import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models import Administrator
from admin.schemas import RegistrationRequest, LoginRequest

from passlib.context import CryptContext

ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET_KEY = "smartlighting_arkpz"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_admin(db: Session, user: RegistrationRequest) -> Administrator:
    existing_admin = db.query(Administrator).filter(Administrator.email == user.email).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_admin = Administrator(
        first_name=user.first_name,
        surname=user.surname,
        email=user.email,
        password=hashed_password
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


def authenticate_admin(db: Session, login_data: LoginRequest) -> Administrator:
    admin = db.query(Administrator).filter(Administrator.email == login_data.email).first()
    if not admin or not verify_password(login_data.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    return admin


def get_all_admins(db: Session) -> List[Administrator]:
    return db.query(Administrator).all()
