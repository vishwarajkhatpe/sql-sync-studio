from sqlalchemy.orm import Session
from app.models import user as user_model
from app.schemas import user as user_schema
from app.core import security

def get_user_by_email(db: Session, email: str):
    """Fetches a single user by their email address."""
    return db.query(user_model.User).filter(user_model.User.email == email).first()

def create_user(db: Session, user: user_schema.UserCreate):
    """Hashes the password and creates a new user in the database."""
    hashed_password = security.get_password_hash(user.password)
    # Create the SQLAlchemy model instance
    db_user = user_model.User(email=user.email, hashed_password=hashed_password)
    
    # Add and commit to the database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user