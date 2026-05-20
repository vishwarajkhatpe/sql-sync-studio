from pydantic import BaseModel, EmailStr

# Schema for when a user registers
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Schema for the data we return to the frontend (notice we omit the password!)
class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy database models