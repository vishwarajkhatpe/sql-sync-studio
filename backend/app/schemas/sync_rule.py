from pydantic import BaseModel
from typing import Optional, List

class SyncRuleBase(BaseModel):
    table_name: str
    sync_frequency: str  # 'manual', 'realtime', 'hourly', 'daily'
    sync_strategy: str   # 'full_load', 'incremental'
    is_active: Optional[bool] = True
    selected_columns: Optional[List[str]] = None

class SyncRuleCreate(SyncRuleBase):
    pass

class SyncRuleResponse(SyncRuleBase):
    id: int
    config_id: int

    class Config:
        from_attributes = True