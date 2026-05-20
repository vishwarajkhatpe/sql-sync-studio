from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text

from app.db.database import get_db
from app.schemas import db_config as db_schema
from app.models import db_config as db_config_model
from app.api.deps import get_current_user  # Import our bouncer
from app.models import user as user_model

router = APIRouter(prefix="/databases", tags=["Database Manager"])

def verify_external_connection(config: db_schema.DatabaseConfigCreate):
    """Dynamically tests an external database connection."""
    if config.db_type.lower() == "mysql":
        uri = f"mysql+pymysql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    elif config.db_type.lower() == "postgresql":
        uri = f"postgresql+psycopg2://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    else:
        raise HTTPException(status_code=400, detail="Unsupported database type.")

    try:
        temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        temp_engine.dispose()
        return True
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

@router.post("/test-connection")
def test_connection(
    config: db_schema.DatabaseConfigCreate, 
    current_user: user_model.User = Depends(get_current_user) # Protected!
):
    """Verifies connection configurations. (Requires authorization token)"""
    verify_external_connection(config)
    return {"status": "success", "message": "Successfully connected to the external database!"}

@router.post("/connect", response_model=db_schema.DatabaseConfigResponse)
def connect_and_save_database(
    config: db_schema.DatabaseConfigCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user) # Protected!
):
    """
    Tests the connection, and if successful, saves the configuration 
    permanently linked to the logged-in user.
    """
    # 1. Verify it works first
    verify_external_connection(config)

    # 2. Map the configuration fields to our database model
    db_config = db_config_model.DatabaseConfig(
        user_id=current_user.id, # Securely pull ID from token, not user input!
        connection_name=config.connection_name,
        db_type=config.db_type,
        host=config.host,
        port=config.port,
        username=config.username,
        password=config.password,
        database_name=config.database_name
    )

    # 3. Save to our primary system database
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config