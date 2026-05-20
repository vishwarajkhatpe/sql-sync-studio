from pydantic import BaseModel
from typing import Optional

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

# Schema for responding to the frontend (omits the password for security)
class DatabaseConfigResponse(DatabaseConfigBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True