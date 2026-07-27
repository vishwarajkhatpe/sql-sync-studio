from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base schema with shared fields
class DatabaseConfigBase(BaseModel):
    connection_name: str
    db_type: str  # 'mysql' or 'postgresql'
    host: str
    port: int
    username: str
    database_name: str

# Schema for incoming request data (requires the password)
class DatabaseConfigCreate(DatabaseConfigBase):
    password: str

class DatabaseConfigUpdate(BaseModel):
    connection_name: Optional[str] = None
    db_type: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    database_name: Optional[str] = None
    password: Optional[str] = None

# Schema for responding to the frontend (omits the password for security)
class DatabaseConfigResponse(DatabaseConfigBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True