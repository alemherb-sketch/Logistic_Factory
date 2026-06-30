import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# In production set DATABASE_URL (e.g. Neon Postgres) so data survives restarts
# and redeploys. An UNSET or EMPTY value falls back to local SQLite. The empty
# check matters on Render: a Blueprint can create DATABASE_URL with an empty
# value (sync:false), and os.getenv would then return "" and crash create_engine
# with "Could not parse SQLAlchemy URL".
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./logistic_factory.db"

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
