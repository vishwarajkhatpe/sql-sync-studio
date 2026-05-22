import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
# Grab the URL from Render (or use localhost fallback)
raw_url = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:admin@127.0.0.1:3306/saas_platform" 
)

clean_url = raw_url
connect_args = {}

# Intercept Aiven's strict SSL requirement and translate it for PyMySQL
if "?ssl-mode=REQUIRED" in raw_url:
    clean_url = raw_url.replace("?ssl-mode=REQUIRED", "")
    connect_args["ssl"] = {}  # This natively tells PyMySQL to activate SSL

# Boot the engine with the cleaned URL and proper SSL arguments
engine = create_engine(clean_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()