import logging
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import create_engine, text

from app.db.database import SessionLocal
from app.models import sync_rule, db_config, extracted_payload

# Set up logging so we can see the ghost worker in the terminal!
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def execute_automated_pipeline():
    """
    This function is our Ghost Worker. It wakes up, finds active sync rules,
    connects to external databases, and saves snapshots automatically.
    """
    logger.info("🤖 Ghost Worker Waking Up: Checking for active sync rules...")
    
    # Open a private database session for the background thread
    db = SessionLocal()
    try:
        # Find all rules where the user turned on the sync pipeline
        active_rules = db.query(sync_rule.SyncRule).filter(sync_rule.SyncRule.is_active == True).all()
        
        if not active_rules:
            logger.info("No active rules found. Going back to sleep.")
            return

        for rule in active_rules:
            # Look up the database credentials for this specific rule
            config = db.query(db_config.DatabaseConfig).filter(db_config.DatabaseConfig.id == rule.config_id).first()
            if not config:
                continue

            logger.info(f"⚡ Starting automated sync for table: {rule.table_name}")

            # Build the dynamic connection URI
            if config.db_type.lower() == "mysql":
                uri = f"mysql+pymysql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
            else:
                uri = f"postgresql+psycopg2://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"

            try:
                # 1. EXTRACT
                temp_engine = create_engine(uri, connect_args={"connect_timeout": 5} if config.db_type.lower() == "mysql" else {})
                with temp_engine.connect() as conn:
                    query = text(f"SELECT * FROM `{rule.table_name}`" if config.db_type.lower() == "mysql" else f'SELECT * FROM "{rule.table_name}"')
                    result = conn.execute(query)
                    columns = result.keys()
                    extracted_records = [dict(zip(columns, row)) for row in result]
                temp_engine.dispose()

                # 2. INGEST
                snapshot = extracted_payload.ExtractedPayload(
                    config_id=config.id,
                    table_name=rule.table_name,
                    raw_data={"records": extracted_records}
                )
                db.add(snapshot)
                db.commit()
                
                logger.info(f"✅ SUCCESS: Saved {len(extracted_records)} records from '{rule.table_name}' to the Data Lake.")
            
            except Exception as e:
                logger.error(f"❌ FAILED to sync '{rule.table_name}': {str(e)}")

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
    logger.info("⏱️ Background Scheduler Engine Initialized!")