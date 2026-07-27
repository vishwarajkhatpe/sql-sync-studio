from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager

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
from app.models import sync_log as sync_log_model # Registering the Sync Log Model

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(
    title="SQL Sync Studio API",
    description="Backend for the SaaS Sandbox Platform",
    lifespan=lifespan
)

raw_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS") or "http://localhost:5173,https://sql-sync-studio.vercel.app"
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Restrict origins based on environment
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:.*", # Accept any Vercel preview branch
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