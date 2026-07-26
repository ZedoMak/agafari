#!/usr/bin/env bash
# Verify prestart.py against a throwaway Postgres, the way a deploy sees it:
# an empty database, then a redeploy, then a database that predates migrations.
#
#   docker run -d --name agafari-fresh-test -e POSTGRES_PASSWORD=test \
#     -e POSTGRES_DB=agafari -p 55432:5432 pgvector/pgvector:pg16
#   scripts/verify_bootstrap.sh
set -u

cd "$(dirname "$0")/.." || exit 1
PY=".venv/bin/python"
# Deliberately the unprefixed form a hosting dashboard hands out, so the
# driver-normalising validator is exercised too.
export DATABASE_URL="postgresql://postgres:test@127.0.0.1:55432/agafari"
export AUTO_CREATE_TABLES=false
export INDEX_ON_STARTUP=false

psql_q() { psql "postgresql://postgres:test@127.0.0.1:55432/agafari" -tAc "$1" 2>/dev/null; }

report() {
  echo "  tables:            $(psql_q "select count(*) from information_schema.tables where table_schema='public'")"
  echo "  alembic_version:   $(psql_q 'select version_num from alembic_version')"
  echo "  chunks.embedding:  $(psql_q "select udt_name from information_schema.columns where table_name='chunks' and column_name='embedding'")"
  echo "  services columns:  $(psql_q "select string_agg(column_name,',' order by column_name) from information_schema.columns where table_name='services' and column_name in ('is_published','procedure_steps')")"
  echo "  change_logs.title: $(psql_q "select is_nullable from information_schema.columns where table_name='change_logs' and column_name='title'")"
}

echo "== 1. empty database =="
$PY prestart.py || echo "  FAILED"
report

echo
echo "== 2. redeploy, nothing to do =="
$PY prestart.py || echo "  FAILED"
report

echo
echo "== 3. database that predates migrations =="
psql_q "drop table alembic_version" >/dev/null
psql_q "alter table services drop column is_published, drop column procedure_steps" >/dev/null
psql_q "alter table change_logs drop column agency_id, drop column title, drop column public_notice, drop column published_at, drop column effective_date, drop column origin" >/dev/null
echo "  stripped migration-era columns"
$PY prestart.py || echo "  FAILED"
report

echo
echo "== 4. API boots against it =="
$PY -c "
import asyncio
from app.main import app
from app.database.session import async_session
from sqlalchemy import text

async def main():
    async with async_session() as db:
        await db.execute(text('select 1 from services limit 1'))
    print('  app imports and queries the schema')

asyncio.run(main())
" || echo "  FAILED"
