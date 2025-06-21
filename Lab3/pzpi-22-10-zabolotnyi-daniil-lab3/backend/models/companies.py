from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database_base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    repairmans = relationship("Repairman", back_populates="company")
