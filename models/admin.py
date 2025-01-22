from sqlalchemy import Column, Integer, String
from database import Base


class Administrator(Base):
    __tablename__ = "administrators"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    status = Column(String, nullable=False, default="inactive")
    rights = Column(String, nullable=False, default="restricted_access")
