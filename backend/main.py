from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

# Import database and routers
from app.db.database import get_db, engine, Base
from app.api import auth  # IMPORT THE AUTH ROUTER

# ---> UPDATED THIS SECTION TO IMPORT BOTH MODELS <---
from app.models import user as user_model 
from app.models import db_config as db_config_model

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SQL Sync Studio API",
    description="Backend for the SaaS Sandbox Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INCLUDE THE ROUTER
app.include_router(auth.router)

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