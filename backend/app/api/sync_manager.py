from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text, desc
from decimal import Decimal
from datetime import date, datetime

from app.db.database import get_db
from app.schemas import sync_rule as schema
from app.models import sync_rule as model
from app.models import db_config as db_model
from app.models import extracted_payload as payload_model
from app.models import sync_log as log_model
from app.schemas import sync_log as log_schema
from app.api.deps import get_current_user
from app.models import user as user_model
from app.core.security import encrypt_db_password, decrypt_db_password
from sqlalchemy.sql import func

router = APIRouter(prefix="/sync", tags=["Sync Pipeline Manager"])

def sanitize_record(record: dict) -> dict:
    """Converts non-JSON serializable types into native JSON types."""
    sanitized = {}
    for key, value in record.items():
        if isinstance(value, Decimal):
            sanitized[key] = float(value)
        elif isinstance(value, (datetime, date)):
            sanitized[key] = value.isoformat()
        else:
            sanitized[key] = value
    return sanitized

@router.post("/{config_id}/rules", response_model=schema.SyncRuleResponse)
def create_sync_rule(
    config_id: int,
    rule_data: schema.SyncRuleCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Saves a specific synchronization orchestrator rule for an external database table."""
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    existing_rule = db.query(model.SyncRule).filter(
        model.SyncRule.config_id == config_id,
        model.SyncRule.table_name == rule_data.table_name
    ).first()

    if existing_rule:
        existing_rule.sync_frequency = rule_data.sync_frequency
        existing_rule.sync_strategy = rule_data.sync_strategy
        existing_rule.is_active = rule_data.is_active
        existing_rule.selected_columns = rule_data.selected_columns
        db.commit()
        db.refresh(existing_rule)
        return existing_rule

    new_rule = model.SyncRule(
        config_id=config_id,
        table_name=rule_data.table_name,
        sync_frequency=rule_data.sync_frequency,
        sync_strategy=rule_data.sync_strategy,
        is_active=rule_data.is_active,
        selected_columns=rule_data.selected_columns
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
    """Fetches all synchronization rules defined under a specific active database profile."""
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    rules = db.query(model.SyncRule).filter(model.SyncRule.config_id == config_id).all()
    return rules

@router.post("/{config_id}/extract/{table_name}")
def extract_table_data(
    config_id: int,
    table_name: str,
    page: int = 1,
    page_size: int = 100,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Core Extraction & Ingestion Engine: Connects to external database,
    downloads records into JSON, sanitizes Decimal types, SAVES a snapshot 
    to the internal Data Lake, and returns the payload.
    """
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    # ---> NEW: SECURE TWO-WAY DECRYPTION IN MEMORY <---
    try:
        real_password = decrypt_db_password(config.password)
    except ValueError as e:
        raise HTTPException(status_code=500, detail="Security Fault: Unable to decrypt database credentials.")

    # Use the decrypted password for the connection URI
    if config.db_type.lower() == "mysql":
        uri = f"mysql+pymysql://{config.username}:{real_password}@{config.host}:{config.port}/{config.database_name}"
    elif config.db_type.lower() == "postgresql":
        uri = f"postgresql+psycopg2://{config.username}:{real_password}@{config.host}:{config.port}/{config.database_name}"
    else:
        raise HTTPException(status_code=400, detail="Unsupported database engine architecture.")

    rule = db.query(model.SyncRule).filter(
        model.SyncRule.config_id == config_id,
        model.SyncRule.table_name == table_name
    ).first()
    rule_id = rule.id if rule else None

    log_entry = log_model.SyncLog(
        rule_id=rule_id,
        config_id=config_id,
        table_name=table_name,
        status="started"
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    try:
        # 1. EXTRACT: Pull the raw data
        temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
        with temp_engine.connect() as conn:
            col_clause = "*"
            if rule and rule.selected_columns:
                if config.db_type.lower() == "mysql":
                    col_clause = ", ".join([f"`{c}`" for c in rule.selected_columns])
                else:
                    col_clause = ", ".join([f'"{c}"' for c in rule.selected_columns])
                    
            if config.db_type.lower() == "mysql":
                query_str = f"SELECT {col_clause} FROM `{table_name}` LIMIT :limit OFFSET :offset"
                count_query = text(f"SELECT COUNT(*) FROM `{table_name}`")
            else:
                query_str = f'SELECT {col_clause} FROM "{table_name}" LIMIT :limit OFFSET :offset'
                count_query = text(f'SELECT COUNT(*) FROM "{table_name}"')
                
            query = text(query_str)
            result = conn.execute(query, {"limit": page_size, "offset": (page - 1) * page_size})
            columns = result.keys()
            raw_records = [dict(zip(columns, row)) for row in result]
            
            total_count = conn.execute(count_query).scalar()
        temp_engine.dispose()
        
        # ---> SANITIZE THE RECORDS FOR JSON <---
        clean_records = [sanitize_record(record) for record in raw_records]
        
        # 2. INGEST: Save the snapshot to our Data Lake Vault
        snapshot = payload_model.ExtractedPayload(
            config_id=config_id,
            table_name=table_name,
            raw_data={"records": clean_records} 
        )
        db.add(snapshot)
        
        log_entry.status = "success"
        log_entry.record_count = len(clean_records)
        log_entry.completed_at = func.now()
        db.commit()
        db.refresh(snapshot)
        
        # 3. RESPOND: Send success metric back to the UI
        return {
            "status": "success",
            "snapshot_id": snapshot.id,
            "table": table_name,
            "record_count": len(clean_records),
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size,
            "data": clean_records
        }
        
    except Exception as e:
        db.rollback()
        log_entry.status = "failed"
        log_entry.error_message = str(e)
        log_entry.completed_at = func.now()
        db.commit()
        raise HTTPException(status_code=400, detail=f"Extraction & Ingestion failed: {str(e)}")

@router.get("/{config_id}/history")
def get_extraction_history(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Fetches the 10 most recent sync snapshots from the Data Lake."""
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    recent_logs = db.query(log_model.SyncLog)\
        .filter(log_model.SyncLog.config_id == config_id)\
        .order_by(desc(log_model.SyncLog.started_at))\
        .limit(10).all()

    history = []
    for log in recent_logs:
        history.append({
            "id": log.id,
            "table_name": log.table_name,
            "record_count": log.record_count,
            "extracted_at": log.started_at,
            "status": log.status
        })

    return {"status": "success", "history": history}

@router.get("/{config_id}/logs", response_model=list[log_schema.SyncLogResponse])
def get_sync_logs(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Fetches all sync logs."""
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    logs = db.query(log_model.SyncLog).filter(
        log_model.SyncLog.config_id == config_id
    ).order_by(desc(log_model.SyncLog.started_at)).limit(50).all()
    return logs

@router.delete("/{config_id}/rules/{rule_id}")
def delete_sync_rule(
    config_id: int,
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Deletes a synchronization rule."""
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    rule = db.query(model.SyncRule).filter(
        model.SyncRule.id == rule_id,
        model.SyncRule.config_id == config_id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Sync rule not found.")
        
    db.delete(rule)
    db.commit()
    return {"status": "success", "message": "Sync rule deleted."}