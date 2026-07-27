from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class SyncLog(Base):
    __tablename__ = "sync_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("sync_rules.id", ondelete="CASCADE"), nullable=True)
    config_id = Column(Integer, ForeignKey("database_configs.id", ondelete="CASCADE"), nullable=False)
    table_name = Column(String(255))
    status = Column(String(20))       # "success" | "failed"
    record_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Establish relationship back to the parent database configuration
    db_config = relationship("DatabaseConfig")
    sync_rule = relationship("SyncRule")
