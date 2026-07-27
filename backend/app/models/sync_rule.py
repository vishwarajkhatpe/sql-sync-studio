from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class SyncRule(Base):
    __tablename__ = "sync_rules"

    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, ForeignKey("database_configs.id", ondelete="CASCADE"), nullable=False)
    table_name = Column(String(255), nullable=False)
    sync_frequency = Column(String(50), nullable=False)  # 'manual', 'realtime', 'hourly', 'daily'
    sync_strategy = Column(String(50), nullable=False)   # 'full_load', 'incremental'
    is_active = Column(Boolean, default=True)

    # Establish relationship back to the parent database configuration
    db_config = relationship("DatabaseConfig", back_populates="sync_rules")