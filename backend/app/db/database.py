import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
# Grab the URL from Render / Aiven (or use localhost fallback)
raw_url = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:admin@127.0.0.1:3306/saas_platform" 
)

clean_url = raw_url
connect_args = {}

# Fix driver dialect prefixes for SQLAlchemy 2.0
if clean_url.startswith("mysql://"):
    clean_url = clean_url.replace("mysql://", "mysql+pymysql://", 1)
elif clean_url.startswith("postgres://"):
    clean_url = clean_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif clean_url.startswith("postgresql://") and not clean_url.startswith("postgresql+psycopg2://"):
    clean_url = clean_url.replace("postgresql://", "postgresql+psycopg2://", 1)

# Intercept Aiven's strict SSL requirement and translate it for PyMySQL
if "?ssl-mode=REQUIRED" in clean_url or "&ssl-mode=REQUIRED" in clean_url:
    clean_url = clean_url.replace("?ssl-mode=REQUIRED", "").replace("&ssl-mode=REQUIRED", "")
    connect_args["ssl"] = {}  # This natively tells PyMySQL to activate SSL
elif "?sslmode=require" in clean_url or "&sslmode=require" in clean_url:
    clean_url = clean_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
    connect_args["ssl"] = {}

if clean_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Boot the engine with the cleaned URL and proper SSL arguments
engine = create_engine(clean_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()