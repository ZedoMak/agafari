"""Prepare the database, then exit. Run this before starting the API.

The schema has two owners: the tables that predate Alembic are declared on the
models and created with `create_all`, while later changes ship as migrations.
That works locally, where the database grew alongside the code, but a fresh
deploy has no such history — running migrations first fails because they alter
tables nobody created, and running `create_all` first fails the migrations
because their tables already exist.

So decide once, here, based on what the database actually contains:

  empty database      create every table at its current shape, then mark all
                      migrations as already applied
  pre-Alembic schema  fill in missing tables, mark the baseline as applied, then
                      run the migrations that came after it
  managed by Alembic  migrate up to head, then create any table no migration
                      covers

Every branch is idempotent, so this is safe to re-run on each deploy.
"""

from __future__ import annotations

import sys
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

from app.config.settings import settings
from app.database.session import Base
import app.models  # noqa: F401  - registers every table on Base.metadata

BACKEND_DIR = Path(__file__).resolve().parent
# The first migration; everything the models created before Alembic existed.
BASELINE_REVISION = "5a9b0c7a4897"


def alembic_config() -> Config:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    # alembic.ini goes through ConfigParser interpolation, so a percent sign in
    # a URL-encoded password would be read as a broken placeholder.
    config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("%", "%%"))
    return config


def main() -> int:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    print("pgvector ready")

    tables = set(inspect(engine).get_table_names())
    config = alembic_config()

    if "alembic_version" in tables:
        print("running migrations")
        command.upgrade(config, "head")
        Base.metadata.create_all(engine)
    elif "agencies" in tables:
        print("adopting a database that predates migrations")
        Base.metadata.create_all(engine)
        command.stamp(config, BASELINE_REVISION)
        command.upgrade(config, "head")
    else:
        print("building a new schema")
        Base.metadata.create_all(engine)
        command.stamp(config, "head")

    engine.dispose()
    print("database ready")
    return 0


if __name__ == "__main__":
    sys.exit(main())
