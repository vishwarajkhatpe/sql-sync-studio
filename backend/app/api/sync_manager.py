from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text

from app.db.database import get_db
from app.schemas import sync_rule as schema
from app.models import sync_rule as model
from app.models import db_config as db_model
from app.api.deps import get_current_user
from app.models import user as user_model

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
    Core Extraction Engine: Connects to a user's isolated external database,
    downloads all records from the specified table, and formats them into JSON.
    """
    # 1. Look up the database workspace configuration credentials
    config = db.query(db_model.DatabaseConfig).filter(db_model.DatabaseConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Database workspace profile not found.")

    # 2. Enforce strict user multi-tenant isolation
    if config.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You do not have permission to extract data from this workspace."
        )

    # 3. Formulate the dynamic target URI connection string
    if config.db_type.lower() == "mysql":
        uri = f"mysql+pymysql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    elif config.db_type.lower() == "postgresql":
        uri = f"postgresql+psycopg2://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
    else:
        raise HTTPException(status_code=400, detail="Unsupported database engine architecture.")

    # 4. Connect directly to the external database and pull records
    try:
        temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
        
        with temp_engine.connect() as conn:
            # We use text() to execute a safe, isolated select statement on the target table
            # NOTE: In a later phase, we will add pagination limit clauses to handle massive tables!
            query = text(f"SELECT * FROM `{table_name}`" if config.db_type.lower() == "mysql" else f'SELECT * FROM "{table_name}"')
            result = conn.execute(query)
            
            # Map the raw SQL tuples dynamically into clean, readable JSON dictionaries
            # result.keys() provides the column headers (e.g. ['id', 'name', 'amount'])
            columns = result.keys()
            extracted_records = [dict(zip(columns, row)) for row in result]
            
        temp_engine.dispose()
        
        return {
            "status": "success",
            "table": table_name,
            "record_count": len(extracted_records),
            "data": extracted_records
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Data extraction sequence failed: {str(e)}"
        )