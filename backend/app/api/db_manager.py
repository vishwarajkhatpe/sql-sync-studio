from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
import pydantic

from app.db.database import get_db
from app.schemas import db_config as db_schema
from app.core.security import jwt # We'll use this to protect routes next

router = APIRouter(prefix="/databases", tags=["Database Manager"])

def verify_external_connection(config: db_schema.DatabaseConfigCreate):
    """
    Dynamically creates a short-lived connection pool to test 
    if the user's external database credentials are correct.
    """
    # Construct the appropriate connection URI string dynamically
    if config.db_type.lower() == "mysql":
        uri = f"mysql+pymysql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    elif config.db_type.lower() == "postgresql":
        uri = f"postgresql+psycopg2://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    else:
        raise HTTPException(status_code=400, detail="Unsupported database type. Use 'mysql' or 'postgresql'.")

    try:
        # Create a temporary engine with a strict timeout so it doesn't hang the server
        temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
        
        # Attempt to open a connection and execute a simple ping
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Clean up the pool completely
        temp_engine.dispose()
        return True
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Connection failed: {str(e)}"
        )

@router.post("/test-connection")
def test_connection(config: db_schema.DatabaseConfigCreate):
    """
    Endpoint to verify connection configurations BEFORE saving them.
    """
    success = verify_external_connection(config)
    if success:
        return {"status": "success", "message": "Successfully connected to the external database!"}