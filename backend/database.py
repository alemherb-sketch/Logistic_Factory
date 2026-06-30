import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# In production set DATABASE_URL (e.g. Render Postgres) so data survives restarts
# and redeploys. Falls back to a local SQLite file for development.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./logistic_factory.db")

# Render/Heroku expose "postgres://" but SQLAlchemy requires "postgresql://".
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

# check_same_thread is a SQLite-only flag; pool_pre_ping avoids stale Postgres
# connections that Render drops while the free instance is idle.
is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
