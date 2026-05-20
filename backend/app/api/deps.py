from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import os

from app.db.database import get_db
from app.crud import user as user_crud
from app.models import user as user_model

# Tell FastAPI where to look for the token during a request
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> user_model.User:
    """
    Decodes the incoming JWT token, extracts the user email, 
    and checks if they exist in our platform database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token using our secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Query the database to ensure this user actually exists
    user = user_crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
        
    return user