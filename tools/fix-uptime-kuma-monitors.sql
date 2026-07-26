BEGIN;
UPDATE monitor
SET accepted_statuscodes_json='["200-599"]'
WHERE name IN ('Domain - crm.newrajinterior.xyz','Domain - api.newrajinterior.xyz');

UPDATE monitor
SET url='http://newraj_minio:9000/minio/health/ready',
    accepted_statuscodes_json='["200-499"]'
WHERE name='Docker - MinIO';

UPDATE monitor
SET hostname='139.99.88.38'
WHERE name IN ('Caddy - HTTP Port','Caddy - HTTPS Port','DNS - TCP 53');

UPDATE monitor
SET dns_resolve_server='139.99.88.38'
WHERE name IN ('DNS - A newrajinterior.xyz','DNS - MX newrajinterior.xyz','DNS - NS newrajinterior.xyz');

UPDATE monitor
SET url='http://newraj_roundcube',
    accepted_statuscodes_json='["200-399"]'
WHERE name='Domain - mail.newrajinterior.xyz';
COMMIT;
