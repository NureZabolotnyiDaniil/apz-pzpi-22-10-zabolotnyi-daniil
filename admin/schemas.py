from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import Dict


class CreateUser(BaseModel):
    email: EmailStr
    password: str


class UserInDB(CreateUser):
    hashed_password: str


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token configuration
SECRET_KEY = "smartlighting_arkpz"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory "database"
users_db: Dict[str, UserInDB] = {}
