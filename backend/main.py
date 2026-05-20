from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

# Import our database setup
from app.db.database import get_db, engine, Base

# This line tells SQLAlchemy to create all tables defined in our models
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI(
    title="SQL Sync Studio API",
    description="Backend for the SaaS Sandbox Platform"
)

# CORS (Cross-Origin Resource Sharing) Configuration
# This is CRITICAL. Without this, our React frontend (running on a different port)
# will be blocked by the browser from talking to our FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the SQL Sync Studio Backend!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    This endpoint tests if the backend can successfully talk to MySQL.
    """
    try:
        # We run a dummy query just to see if the database responds
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy", 
            "database": "connected successfully to MySQL!"
        }
    except Exception as e:
        # If the password in .env is wrong, it will fail and show here
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")