#!/usr/bin/env bash
set -euo pipefail

DB=/opt/newraj/storage/uptime-kuma/kuma.db
SCRIPT=/opt/newraj/scripts/push-system-metrics-to-kuma.sh
CRON=/etc/cron.d/newraj-kuma-system-metrics
BACKUP_DIR=/opt/newraj/backups/uptime-kuma

mkdir -p "$BACKUP_DIR"
cp "$DB" "$BACKUP_DIR/kuma.db.before-resource-monitors-$(date +%Y%m%d-%H%M%S)"

token() {
  tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20
}

ensure_push_monitor() {
  local name="$1"
  local description="$2"
  local existing
  existing=$(sqlite3 "$DB" "select push_token from monitor where name='$name' and type='push' limit 1;")
  if [ -n "$existing" ]; then
    echo "$existing"
    return
  fi

  local push_token
  push_token=$(token)
  sqlite3 "$DB" "insert into monitor (name,type,user_id,interval,retry_interval,maxretries,timeout,active,push_token,description) values ('$name','push',1,60,60,2,30,1,'$push_token','$description');"
  echo "$push_token"
}

CPU_TOKEN=$(ensure_push_monitor "Resource - CPU Usage" "Push monitor for host CPU usage threshold")
RAM_TOKEN=$(ensure_push_monitor "Resource - RAM Usage" "Push monitor for host memory usage threshold")
DISK_TOKEN=$(ensure_push_monitor "Resource - Disk Usage" "Push monitor for root disk usage threshold")
LOAD_TOKEN=$(ensure_push_monitor "Resource - Load Average" "Push monitor for host load average threshold")

cat > "$SCRIPT" <<SCRIPT
#!/usr/bin/env bash
set -euo pipefail

KUMA_BASE="http://127.0.0.1:3001/api/push"
CPU_TOKEN="$CPU_TOKEN"
RAM_TOKEN="$RAM_TOKEN"
DISK_TOKEN="$DISK_TOKEN"
LOAD_TOKEN="$LOAD_TOKEN"

CPU_WARN=85
RAM_WARN=90
DISK_WARN=85
LOAD_WARN=6

push() {
  local token="\$1"
  local status="\$2"
  local msg="\$3"
  curl -fsS --get "\$KUMA_BASE/\$token" \
    --data-urlencode "status=\$status" \
    --data-urlencode "msg=\$msg" \
    --data-urlencode "ping=0" >/dev/null
}

cpu_usage() {
  awk '/^cpu / {
    idle1=\$5; total1=0;
    for (i=2; i<=NF; i++) total1+=\$i;
    getline < "/proc/stat";
  } END {}' /proc/stat >/dev/null
  read -r _ u1 n1 s1 i1 w1 irq1 sirq1 steal1 _ < /proc/stat
  t1=\$((u1+n1+s1+i1+w1+irq1+sirq1+steal1))
  sleep 1
  read -r _ u2 n2 s2 i2 w2 irq2 sirq2 steal2 _ < /proc/stat
  t2=\$((u2+n2+s2+i2+w2+irq2+sirq2+steal2))
  idle=\$((i2-i1))
  total=\$((t2-t1))
  awk -v idle="\$idle" -v total="\$total" 'BEGIN { if (total <= 0) print 0; else printf "%.0f", (100 * (total - idle) / total) }'
}

CPU=\$(cpu_usage)
RAM=\$(free | awk '/Mem:/ { printf "%.0f", (\$3/\$2)*100 }')
DISK=\$(df -P / | awk 'NR==2 { gsub(/%/,"",\$5); print \$5 }')
LOAD=\$(awk '{print \$1}' /proc/loadavg)
LOAD_INT=\$(awk -v load="\$LOAD" 'BEGIN { printf "%.0f", load }')

if [ "\$CPU" -ge "\$CPU_WARN" ]; then
  push "\$CPU_TOKEN" down "CPU usage \$CPU% >= \$CPU_WARN%"
else
  push "\$CPU_TOKEN" up "CPU usage \$CPU%"
fi

if [ "\$RAM" -ge "\$RAM_WARN" ]; then
  push "\$RAM_TOKEN" down "RAM usage \$RAM% >= \$RAM_WARN%"
else
  push "\$RAM_TOKEN" up "RAM usage \$RAM%"
fi

if [ "\$DISK" -ge "\$DISK_WARN" ]; then
  push "\$DISK_TOKEN" down "Disk usage \$DISK% >= \$DISK_WARN%"
else
  push "\$DISK_TOKEN" up "Disk usage \$DISK%"
fi

if [ "\$LOAD_INT" -ge "\$LOAD_WARN" ]; then
  push "\$LOAD_TOKEN" down "Load average \$LOAD >= \$LOAD_WARN"
else
  push "\$LOAD_TOKEN" up "Load average \$LOAD"
fi
SCRIPT

chmod 700 "$SCRIPT"

cat > "$CRON" <<CRON
* * * * * root $SCRIPT
CRON
chmod 644 "$CRON"

"$SCRIPT"
docker restart newraj_uptime_kuma >/dev/null
sleep 8
sqlite3 "$DB" "select id,name,type,user_id,push_token from monitor where name like 'Resource - %' order by id;"
