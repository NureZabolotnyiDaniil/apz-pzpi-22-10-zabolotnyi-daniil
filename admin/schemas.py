from pydantic import BaseModel, EmailStr


class RegistrationRequest(BaseModel):
    first_name: str
    surname: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminOut(BaseModel):
    id: int
    first_name: str
    surname: str
    email: EmailStr
    status: str

    class Config:
        from_attributes = True
