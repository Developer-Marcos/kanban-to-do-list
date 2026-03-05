from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessaoLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def pegar_db():
      db = SessaoLocal()
      
      try:
            yield db
      finally:
            db.close()