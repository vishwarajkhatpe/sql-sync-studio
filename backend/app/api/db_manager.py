from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text

from app.db.database import get_db
from app.schemas import db_config as db_schema
from app.models import db_config as db_config_model
from app.api.deps import get_current_user  
from app.models import user as user_model

# ---> NEW: Import Security Utilities <---
from app.core.security import encrypt_db_password, decrypt_db_password

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
    current_user: user_model.User = Depends(get_current_user) 
):
    """Verifies connection configurations. (Requires authorization token)"""
    verify_external_connection(config)
    return {"status": "success", "message": "Successfully connected to the external database!"}

@router.post("/connect", response_model=db_schema.DatabaseConfigResponse)
def connect_and_save_database(
    config: db_schema.DatabaseConfigCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user) 
):
    """
    Tests the connection, and if successful, saves the configuration 
    permanently linked to the logged-in user.
    """
    # 1. Verify it works first (Uses the raw frontend password temporarily)
    verify_external_connection(config)

    # 2. Map the configuration fields to our database model
    db_config = db_config_model.DatabaseConfig(
        user_id=current_user.id, 
        connection_name=config.connection_name,
        db_type=config.db_type,
        host=config.host,
        port=config.port,
        username=config.username,
        # ---> NEW: ENCRYPT BEFORE SAVING <---
        password=encrypt_db_password(config.password),
        database_name=config.database_name
    )

    # 3. Save to our primary system database
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

#Metadata Lister Route
@router.get("/{config_id}/tables", response_model=list[str])
def list_external_tables(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Fetches a saved database configuration, verifies ownership, 
    and returns a clean list of all tables present in that external database.
    """
    # 1. Fetch the stored database configuration from our primary app db
    config = db.query(db_config_model.DatabaseConfig).filter(
        db_config_model.DatabaseConfig.id == config_id
    ).first()

    if not config:
        raise HTTPException(status_code=404, detail="Database configuration not found.")

    # 2. Security Check: Ensure the logged-in user actually owns this configuration!
    if config.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You do not have permission to access this database configuration."
        )

    # ---> NEW: DECRYPT THE PASSWORD IN MEMORY <---
    try:
        real_password = decrypt_db_password(config.password)
    except ValueError:
        raise HTTPException(status_code=500, detail="Security Fault: Unable to decrypt database credentials.")

    # 3. Build the connection string based on the decrypted data
    if config.db_type.lower() == "mysql":
        uri = f"mysql+pymysql://{config.username}:{real_password}@{config.host}:{config.port}/{config.database_name}"
        query = text("SHOW TABLES")
    elif config.db_type.lower() == "postgresql":
        uri = f"postgresql+psycopg2://{config.username}:{real_password}@{config.host}:{config.port}/{config.database_name}"
        query = text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    else:
        raise HTTPException(status_code=400, detail="Unsupported database type.")

    # 4. Connect to the client's external database dynamically and extract table names
    try:
        temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
        with temp_engine.connect() as conn:
            result = conn.execute(query)
            tables = [row[0] for row in result]
        temp_engine.dispose()
        return tables
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to fetch external tables: {str(e)}"
        )