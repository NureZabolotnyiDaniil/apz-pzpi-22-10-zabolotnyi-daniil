from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/admin", tags=["admin"])


class CreateUser(BaseModel):
    email: EmailStr


@router.post("")
async def send_email(user: CreateUser):
    return {"message": "success", "email": user.email}
