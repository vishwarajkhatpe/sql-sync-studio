from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class ExtractedPayload(Base):
    __tablename__ = "extracted_payloads"

    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, ForeignKey("database_configs.id"), nullable=False)
    table_name = Column(String(255), nullable=False)
    
    # Native JSON Storage Column: This acts as our internal data lake vault,
    # holding the full array of rows extracted from the client's system.
    raw_data = Column(JSON, nullable=False)
    
    # Track exactly when this snapshot execution occurred
    extracted_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relational linkage back to the workspace configuration profile
    db_config = relationship("DatabaseConfig")