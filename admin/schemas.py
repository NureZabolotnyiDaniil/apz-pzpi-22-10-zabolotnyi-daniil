from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext


class CreateUser(BaseModel):
    email: EmailStr
    password: str


class UserInDB(CreateUser):
    hashed_password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

users_db = {}

ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
