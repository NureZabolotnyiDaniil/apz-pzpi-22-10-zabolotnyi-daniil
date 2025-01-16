from datetime import timedelta

from database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from admin.crud import create_admin, authenticate_admin, create_access_token, get_all_admins, \
    ACCESS_TOKEN_EXPIRE_MINUTES
from admin.schemas import RegistrationRequest, LoginRequest, AdminOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/register")
async def register_user(user: RegistrationRequest, db: Session = Depends(get_db)):
    create_admin(db, user)
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(user: LoginRequest, db: Session = Depends(get_db)):
    admin = authenticate_admin(db, user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": admin.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/admins", response_model=list[AdminOut])
async def read_admins(db: Session = Depends(get_db)):
    admins = get_all_admins(db)
    return admins
