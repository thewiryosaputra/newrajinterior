BEGIN;
UPDATE monitor
SET type='port',
    url=NULL,
    hostname='newraj_minio',
    port=9000,
    accepted_statuscodes_json='["200-299"]',
    description='MinIO container internal TCP listener'
WHERE name='Docker - MinIO';

INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Docker - PostgreSQL','port','newraj_postgres',5432,60,60,3,30,1,'PostgreSQL container internal TCP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - PostgreSQL');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Docker - Redis','port','newraj_redis',6379,60,60,3,30,1,'Redis container internal TCP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - Redis');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Docker - Mailserver','port','newraj_mailserver',25,60,60,3,30,1,'Mailserver container SMTP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - Mailserver');
INSERT INTO monitor (name,type,url,interval,retry_interval,maxretries,timeout,active,accepted_statuscodes_json,description)
SELECT 'Docker - LiveKit','http','http://newraj_livekit:7880',60,60,3,30,1,'["200-499"]','LiveKit container HTTP listener'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - LiveKit');
INSERT INTO monitor (name,type,hostname,port,interval,retry_interval,maxretries,timeout,active,description)
SELECT 'Docker - Coturn','port','139.99.88.38',3478,60,60,3,30,1,'Coturn TURN listener on host network'
WHERE NOT EXISTS (SELECT 1 FROM monitor WHERE name='Docker - Coturn');
COMMIT;
