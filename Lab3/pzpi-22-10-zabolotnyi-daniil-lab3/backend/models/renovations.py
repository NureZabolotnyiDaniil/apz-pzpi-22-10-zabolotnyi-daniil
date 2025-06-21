from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from database_base import Base


class Renovation(Base):
    __tablename__ = "renovations"

    id = Column(Integer, primary_key=True, index=True)

    lantern_id = Column(Integer, ForeignKey("lanterns.id"), nullable=True)
    lantern = relationship("Lantern", back_populates="renovations")

    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="planned")
    priority = Column(String, nullable=False, default="medium")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    cost = Column(Integer, nullable=False, default=0)

    repairman_id = Column(Integer, ForeignKey("repairmans.id"), nullable=True)
    repairman = relationship("Repairman", back_populates="renovations")
