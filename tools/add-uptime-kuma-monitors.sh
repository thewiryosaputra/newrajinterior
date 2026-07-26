#!/usr/bin/env bash
set -euo pipefail

DB=/opt/newraj/storage/uptime-kuma/kuma.db
BACKUP_DIR=/opt/newraj/backups/uptime-kuma
SQL=/tmp/newraj-kuma-monitors.sql

mkdir -p "$BACKUP_DIR"
cp "$DB" "$BACKUP_DIR/kuma.db.before-point4-$(date +%Y%m%d-%H%M%S)"

set -a
. /opt/newraj/secrets/stack.env
set +a

cat > "$SQL" <<SQL
BEGIN TRANSACTION;

INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - newrajinterior.xyz','http','https://newrajinterior.xyz',60,60,3,30,1,'["200-399"]','Public primary domain HTTPS check'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - www.newrajinterior.xyz','http','https://www.newrajinterior.xyz',60,60,3,30,1,'["200-399"]','Public WWW HTTPS check'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - www.newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - crm.newrajinterior.xyz','http','https://crm.newrajinterior.xyz',60,60,3,30,1,'["200-499"]','Future CRM reverse proxy readiness'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - crm.newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - api.newrajinterior.xyz','http','https://api.newrajinterior.xyz',60,60,3,30,1,'["200-499"]','Future API reverse proxy readiness'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - api.newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - media.newrajinterior.xyz','http','https://media.newrajinterior.xyz/minio/health/live',60,60,3,30,1,'["200-399"]','MinIO public API health through Caddy'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - media.newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - wa.newrajinterior.xyz','http','https://wa.newrajinterior.xyz/api/server/version',60,60,3,30,1,'["200-499"]','WAHA public endpoint through Caddy'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - wa.newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - monitor.newrajinterior.xyz','http','https://monitor.newrajinterior.xyz',60,60,3,30,1,'["200-399"]','Uptime Kuma public UI through Caddy'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - monitor.newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - mail.newrajinterior.xyz','http','https://mail.newrajinterior.xyz',60,60,3,30,1,'["200-399"]','Roundcube webmail public UI through Caddy'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - mail.newrajinterior.xyz');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Domain - minio.newrajinterior.xyz','http','https://minio.newrajinterior.xyz',60,60,3,30,1,'["200-399"]','MinIO console public UI through Caddy'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Domain - minio.newrajinterior.xyz');

INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Caddy - HTTP Port','port','127.0.0.1',80,60,60,3,30,1,'Caddy HTTP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Caddy - HTTP Port');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Caddy - HTTPS Port','port','127.0.0.1',443,60,60,3,30,1,'Caddy HTTPS listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Caddy - HTTPS Port');

INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Docker - Uptime Kuma','http','http://newraj_uptime_kuma:3001',60,60,3,30,1,'["200-399"]','Uptime Kuma container HTTP health'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - Uptime Kuma');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Docker - MinIO','http','http://newraj_minio:9000/minio/health/live',60,60,3,30,1,'["200-399"]','MinIO container live health'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - MinIO');
INSERT INTO monitor (name,type,url,headers,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Docker - WAHA','http','http://newraj_waha:3000/api/server/version','{"X-Api-Key":"${WAHA_API_KEY}"}',60,60,3,30,1,'["200-399"]','WAHA container API health'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - WAHA');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Docker - Roundcube','http','http://newraj_roundcube',60,60,3,30,1,'["200-399"]','Roundcube container HTTP health'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - Roundcube');

INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'PostgreSQL - Internal TCP','port','newraj_postgres',5432,60,60,3,30,1,'PostgreSQL internal TCP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='PostgreSQL - Internal TCP');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Redis - Internal TCP','port','newraj_redis',6379,60,60,3,30,1,'Redis internal TCP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Redis - Internal TCP');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Mail - SMTP 25','port','mail.newrajinterior.xyz',25,60,60,3,30,1,'Public SMTP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Mail - SMTP 25');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Mail - Submission 587','port','mail.newrajinterior.xyz',587,60,60,3,30,1,'Public mail submission listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Mail - Submission 587');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Mail - IMAPS 993','port','mail.newrajinterior.xyz',993,60,60,3,30,1,'Public IMAPS listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Mail - IMAPS 993');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'DNS - TCP 53','port','127.0.0.1',53,60,60,3,30,1,'PowerDNS local DNS TCP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='DNS - TCP 53');
INSERT INTO monitor (name,type,hostname,dns_resolve_type,dns_resolve_server,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'DNS - A newrajinterior.xyz','dns','newrajinterior.xyz','A','127.0.0.1',60,60,3,30,1,'Authoritative A record check against local PowerDNS'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='DNS - A newrajinterior.xyz');
INSERT INTO monitor (name,type,hostname,dns_resolve_type,dns_resolve_server,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'DNS - MX newrajinterior.xyz','dns','newrajinterior.xyz','MX','127.0.0.1',60,60,3,30,1,'Authoritative MX record check against local PowerDNS'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='DNS - MX newrajinterior.xyz');
INSERT INTO monitor (name,type,hostname,dns_resolve_type,dns_resolve_server,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'DNS - NS newrajinterior.xyz','dns','newrajinterior.xyz','NS','127.0.0.1',60,60,3,30,1,'Authoritative NS record check against local PowerDNS'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='DNS - NS newrajinterior.xyz');

COMMIT;
SQL

sqlite3 "$DB" < "$SQL"
rm -f "$SQL"
docker restart newraj_uptime_kuma >/dev/null
sleep 8
sqlite3 "$DB" "select id,name,type,active from monitor order by id;"
