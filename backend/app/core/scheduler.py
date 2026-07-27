import logging
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import create_engine, text
from decimal import Decimal
from datetime import date, datetime, timedelta, timezone
from app.db.database import SessionLocal
from app.models import sync_rule, db_config, extracted_payload, sync_log
from app.core.security import decrypt_db_password
from sqlalchemy.sql import func

def sanitize_record(record: dict) -> dict:
    sanitized = {}
    for key, value in record.items():
        if isinstance(value, Decimal):
            sanitized[key] = float(value)
        elif isinstance(value, (datetime, date)):
            sanitized[key] = value.isoformat()
        else:
            sanitized[key] = value
    return sanitized

# Set up logging so we can see the ghost worker in the terminal!
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def execute_automated_pipeline():
    """
    This function is our Ghost Worker. It wakes up, finds active sync rules,
    connects to external databases, and saves snapshots automatically.
    """
    logger.info("Ghost Worker Waking Up: Checking for active sync rules...")
    
    # Open a private database session for the background thread
    db = SessionLocal()
    try:
        # Find all rules where the user turned on the sync pipeline
        active_rules = db.query(sync_rule.SyncRule).filter(
            sync_rule.SyncRule.is_active == True,
            sync_rule.SyncRule.sync_frequency != "manual"
        ).all()
        
        if not active_rules:
            logger.info("No active rules found. Going back to sleep.")
            return

        for rule in active_rules:
            # Look up the database credentials for this specific rule
            config = db.query(db_config.DatabaseConfig).filter(db_config.DatabaseConfig.id == rule.config_id).first()
            if not config:
                continue

            last_log = db.query(sync_log.SyncLog).filter(
                sync_log.SyncLog.rule_id == rule.id,
                sync_log.SyncLog.status == "success"
            ).order_by(sync_log.SyncLog.started_at.desc()).first()

            now = datetime.now(timezone.utc)
            if last_log and last_log.started_at:
                last_time = last_log.started_at
                if last_time.tzinfo is None:
                    last_time = last_time.replace(tzinfo=timezone.utc)
                if rule.sync_frequency == "hourly" and (now - last_time) < timedelta(hours=1):
                    continue
                if rule.sync_frequency == "daily" and (now - last_time) < timedelta(days=1):
                    continue

            logger.info(f"Starting automated sync for table: {rule.table_name}")
            
            log_entry = sync_log.SyncLog(
                rule_id=rule.id,
                config_id=config.id,
                table_name=rule.table_name,
                status="started"
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)

            # Build the dynamic connection URI
            try:
                real_password = decrypt_db_password(config.password)
            except Exception as e:
                logger.error(f"Failed to decrypt password for config {config.id}: {e}")
                log_entry.status = "failed"
                log_entry.error_message = str(e)
                log_entry.completed_at = func.now()
                db.commit()
                continue

            if config.db_type.lower() == "mysql":
                uri = f"mysql+pymysql://{config.username}:{real_password}@{config.host}:{config.port}/{config.database_name}"
            else:
                uri = f"postgresql+psycopg2://{config.username}:{real_password}@{config.host}:{config.port}/{config.database_name}"

            try:
                # 1. EXTRACT
                temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
                with temp_engine.connect() as conn:
                    query = text(f"SELECT * FROM `{rule.table_name}`" if config.db_type.lower() == "mysql" else f'SELECT * FROM "{rule.table_name}"')
                    result = conn.execute(query)
                    columns = result.keys()
                    extracted_records = [dict(zip(columns, row)) for row in result]
                temp_engine.dispose()
                
                clean_records = [sanitize_record(record) for record in extracted_records]

                # 2. INGEST
                snapshot = extracted_payload.ExtractedPayload(
                    config_id=config.id,
                    table_name=rule.table_name,
                    raw_data={"records": clean_records}
                )
                db.add(snapshot)
                
                log_entry.status = "success"
                log_entry.record_count = len(extracted_records)
                log_entry.completed_at = func.now()
                db.commit()
                
                logger.info(f"SUCCESS: Saved {len(extracted_records)} records from '{rule.table_name}' to the Data Lake.")
            
            except Exception as e:
                db.rollback()
                log_entry.status = "failed"
                log_entry.error_message = str(e)
                log_entry.completed_at = func.now()
                db.commit()
                logger.error(f"FAILED to sync '{rule.table_name}': {str(e)}")

    finally:
        # Always securely close the database session when the worker is done
        db.close()

def start_scheduler():
    """Starts the APScheduler background thread."""
    scheduler = BackgroundScheduler()
    
    # For Phase 6 testing, we are forcing it to run every 1 MINUTE.
    # In production, this would read the rule.sync_frequency (hourly/daily).
    scheduler.add_job(execute_automated_pipeline, 'interval', minutes=1)
    
    scheduler.start()
    logger.info("Background Scheduler Engine Initialized!")