from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SyncLogBase(BaseModel):
    rule_id: Optional[int] = None
    config_id: int
    table_name: str
    status: str
    record_count: int
    error_message: Optional[str] = None

class SyncLogResponse(SyncLogBase):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
