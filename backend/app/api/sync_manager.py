from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text

from app.db.database import get_db
from app.schemas import sync_rule as schema
from app.models import sync_rule as model
from app.models import db_config as db_model
from app.api.deps import get_current_user
from app.models import user as user_model
from app.models import extracted_payload as payload_model # NEW MODEL FOR STORING EXTRACTED DATA SNAPSHOTS

router = APIRouter(prefix="/sync", tags=["Sync Pipeline Manager"])

@router.post("/{config_id}/rules", response_model=schema.SyncRuleResponse)
def create_sync_rule(
    config_id: int,
    rule_data: schema.SyncRuleCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Saves a specific synchronization orchestrator rule for an external database table.
    Verifies that the current logged-in user owns the targeted configuration space.
    """
    # 1. Verify that the targeted database configuration workspace exists
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Database workspace configuration not found.")

    # 2. Security isolation boundary check
    if config.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You do not own this database workspace profile."
        )

    # 3. Check if a rule already exists for this specific table in this config workspace
    existing_rule = db.query(model.SyncRule).filter(
        model.SyncRule.config_id == config_id,
        model.SyncRule.table_name == rule_data.table_name
    ).first()

    if existing_rule:
        # Update existing rule parameters instead of duplicating rows
        existing_rule.sync_frequency = rule_data.sync_frequency
        existing_rule.sync_strategy = rule_data.sync_strategy
        existing_rule.is_active = rule_data.is_active
        db.commit()
        db.refresh(existing_rule)
        return existing_rule

    # 4. Map schema data to internal persistence model and save
    new_rule = model.SyncRule(
        config_id=config_id,
        table_name=rule_data.table_name,
        sync_frequency=rule_data.sync_frequency,
        sync_strategy=rule_data.sync_strategy,
        is_active=rule_data.is_active
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule


@router.get("/{config_id}/rules", response_model=list[schema.SyncRuleResponse])
def get_workspace_sync_rules(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Fetches all synchronization rules defined under a specific active database profile.
    """
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Database profile workspace not found or inaccessible.")

    rules = db.query(model.SyncRule).filter(model.SyncRule.config_id == config_id).all()
    return rules

@router.post("/{config_id}/extract/{table_name}")
def extract_table_data(
    config_id: int,
    table_name: str,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Core Extraction & Ingestion Engine: Connects to external database,
    downloads records into JSON, SAVES a snapshot to the internal Data Lake,
    and returns the payload.
    """
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    if config.db_type.lower() == "mysql":
        uri = f"mysql+pymysql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    elif config.db_type.lower() == "postgresql":
        uri = f"postgresql+psycopg2://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    else:
        raise HTTPException(status_code=400, detail="Unsupported database engine architecture.")

    try:
        # 1. EXTRACT: Pull the raw data
        temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
        with temp_engine.connect() as conn:
            query = text(f"SELECT * FROM `{table_name}`" if config.db_type.lower() == "mysql" else f'SELECT * FROM "{table_name}"')
            result = conn.execute(query)
            columns = result.keys()
            extracted_records = [dict(zip(columns, row)) for row in result]
        temp_engine.dispose()
        
        # 2. INGEST: Save the snapshot to our Data Lake Vault
        # We wrap the records in a dictionary to ensure strict JSON formatting
        snapshot = payload_model.ExtractedPayload(
            config_id=config_id,
            table_name=table_name,
            raw_data={"records": extracted_records} 
        )
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        
        # 3. RESPOND: Send success metric back to the UI
        return {
            "status": "success",
            "snapshot_id": snapshot.id,
            "table": table_name,
            "record_count": len(extracted_records),
            "data": extracted_records
        }
        
    except Exception as e:
        db.rollback() # Safety net: undo changes if anything fails
        raise HTTPException(status_code=400, detail=f"Extraction & Ingestion failed: {str(e)}")