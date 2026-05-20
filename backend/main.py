from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

# Import database and routers
from app.db.database import get_db, engine, Base
from app.api import auth  # IMPORT THE AUTH ROUTER
from app.api import db_manager  # IMPORT THE NEW ROUTER
from app.api import sync_manager  # NEW MANAGER
from app.core.scheduler import start_scheduler # START THE BACKGROUND SCHEDULER ON APP LAUNCH

# ---> UPDATED THIS SECTION TO IMPORT BOTH MODELS <---
from app.models import user as user_model 
from app.models import db_config as db_config_model
from app.models import sync_rule as sync_rule_model # Registering the Sync Rule Model
from app.models import extracted_payload as payload_model # Registering the Extracted Payload Model

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SQL Sync Studio API",
    description="Backend for the SaaS Sandbox Platform"
)

@app.on_event("startup")
def startup_event():
    start_scheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INCLUDE THE ROUTER
app.include_router(auth.router)
app.include_router(db_manager.router) # REGISTER THE NEW ROUTER
app.include_router(sync_manager.router) # MOUNTED THE ROUTER ENGINE BLOCK
@app.get("/")
def read_root():
    return {"message": "Welcome to the SQL Sync Studio Backend!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected successfully to MySQL!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")