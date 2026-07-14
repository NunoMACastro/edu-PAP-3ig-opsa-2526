#!/bin/sh
# Cria o role aplicacional mínimo em cada instância PostgreSQL local.

set -eu

: "${POSTGRES_USER:?POSTGRES_USER em falta}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD em falta}"
: "${OPSA_APP_DATABASE:?OPSA_APP_DATABASE em falta}"
: "${OPSA_APP_USER:?OPSA_APP_USER em falta}"
: "${OPSA_APP_PASSWORD:?OPSA_APP_PASSWORD em falta}"

# O segredo segue apenas por variável psql. Nunca é interpolado pelo shell nem
# escrito em stdout. password_encryption está fixado em SCRAM no compose.
export PGPASSWORD="$POSTGRES_PASSWORD"
psql \
  --username "$POSTGRES_USER" \
  --dbname "$OPSA_APP_DATABASE" \
  --set=ON_ERROR_STOP=1 \
  --set=app_database="$OPSA_APP_DATABASE" \
  --set=app_user="$OPSA_APP_USER" \
  --set=app_password="$OPSA_APP_PASSWORD" <<'SQL'
SELECT format(
  'CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION',
  :'app_user',
  :'app_password'
)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = :'app_user'
) \gexec

SELECT format(
  'ALTER ROLE %I WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION',
  :'app_user',
  :'app_password'
) \gexec

SELECT format(
  'ALTER DATABASE %I OWNER TO %I',
  :'app_database',
  :'app_user'
) \gexec

SELECT format(
  'GRANT CONNECT ON DATABASE %I TO %I',
  :'app_database',
  :'app_user'
) \gexec

SELECT format('GRANT USAGE, CREATE ON SCHEMA public TO %I', :'app_user') \gexec
SELECT format(
  'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I',
  :'app_user'
) \gexec
SELECT format(
  'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO %I',
  :'app_user'
) \gexec
SQL
