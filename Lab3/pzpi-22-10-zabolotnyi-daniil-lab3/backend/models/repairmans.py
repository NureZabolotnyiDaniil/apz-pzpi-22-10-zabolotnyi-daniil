from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database_base import Base


class Repairman(Base):
    __tablename__ = "repairmans"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    surname = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    specialization = Column(String, nullable=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    company = relationship("Company", back_populates="repairmans")

    renovations = relationship("Renovation", back_populates="repairman")
