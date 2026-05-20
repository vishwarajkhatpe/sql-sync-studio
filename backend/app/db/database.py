from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

# Load the variables from our .env file
load_dotenv()

# Get the URL from the environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy Engine. This is the core interface to the database.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a SessionLocal class. Each instance of this will be an actual database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models. We will inherit from this to create our database tables.
Base = declarative_base()

# Dependency function. This yields a database session for a single API request, 
# and automatically closes it when the request is finished.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()