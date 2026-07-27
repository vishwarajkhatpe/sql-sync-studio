from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class DatabaseConfig(Base):
    __tablename__ = "database_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connection_name = Column(String(100), nullable=False) # e.g., "Production MySQL"
    db_type = Column(String(50), nullable=False)          # e.g., "mysql" or "postgresql"
    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    username = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)        # Encrypted
    database_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Establish a relationship back to the User model
    user = relationship("User")
    sync_rules = relationship("SyncRule", back_populates="db_config", cascade="all, delete-orphan")
    payloads = relationship("ExtractedPayload", back_populates="db_config", cascade="all, delete-orphan")