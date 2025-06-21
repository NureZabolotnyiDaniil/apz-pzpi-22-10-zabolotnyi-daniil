from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from database_base import Base


class Breakdown(Base):
    __tablename__ = "breakdowns"
    id = Column(Integer, primary_key=True, index=True)

    lantern_id = Column(Integer, ForeignKey("lanterns.id"), nullable=False)
    lantern = relationship("Lantern", back_populates="breakdowns")

    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="reported")
    priority = Column(String, nullable=False, default="medium")
    reported_at = Column(DateTime, nullable=False)
    fixed_at = Column(DateTime, nullable=True)
