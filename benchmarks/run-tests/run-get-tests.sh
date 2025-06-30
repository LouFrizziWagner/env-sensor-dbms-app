#!/bin/bash
chmod +x ./get-test-template.sh

BASE_URL="localhost"
PORT_NUMBER="3000"
DBMS="mongodb"

if [ "$DBMS" == "mongodb" ]; then
  MONITORED_CONTAINER="mongodb_container"
elif [ "$DBMS" == "mysql" ]; then
  MONITORED_CONTAINER="mysql_container"
else
  echo "No implementation of so called $DBMS"
  exit 1
fi


ENDPOINTS=(
"/${DBMS}/top-twenty-observations"
"/${DBMS}/bulk-read-1000"
"/${DBMS}/bulk-read-5000"
"/${DBMS}/bulk-read-10000"
"/${DBMS}/bulk-read-20000"
"/${DBMS}/average-monthly-temperature/summer-2020"
"/${DBMS}/average-humidity/june-2021"
"/${DBMS}/max-humidity/year-2020-2021"
"/${DBMS}/hive-sensors"
"/${DBMS}/time-between-observations/14-days"
"/${DBMS}/hourly-hive-power-trend"
"/${DBMS}/temperature-variance-per-hive"
"/${DBMS}/temperature-humidity-correlation"
)

JMX_FILE="./generic-get-testplan.jmx"

#ramp=x loop=10 thread=x
CONFIGS=(
  "1 100 1"
  "10 100 10"
)
# "20 500 20"

for config in "${CONFIGS[@]}"; do
  read -r RAMP LOOP THREAD <<< "$config"

  echo "----------------------------------------"
  echo "Running config: Threads=$THREAD, Loops=$LOOP, Ramp-Up=$RAMP"
  echo "----------------------------------------"

  METRIC_LOG_DIR="metrics_logs"
  mkdir -p "$METRIC_LOG_DIR"
  DATE=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
  METRIC_LOG_FILE="$METRIC_LOG_DIR/${MONITORED_CONTAINER}_${THREAD}threads_${LOOP}loops_${RAMP}ramp_${DATE}.log"

  # Start docker stats logging
  nohup bash -c "while true; do docker stats $MONITORED_CONTAINER --no-stream; sleep 1; done" > "$METRIC_LOG_FILE" &
  STATS_PID=$!

  if [ "$DBMS" == "mysql" ]; then
    MYSQL_STATS_FILE="$METRIC_LOG_DIR/${MONITORED_CONTAINER}_mysql-status_${THREAD}threads_${LOOP}loops_${RAMP}ramp_${DATE}.csv"
    echo "timestamp,Threads_connected,Max_used_connections" > "$MYSQL_STATS_FILE"

    nohup bash -c "
    while true; do
      ts=\$(date -u +\"%Y-%m-%dT%H:%M:%SZ\");
      values=\$(docker exec $MONITORED_CONTAINER mysql -uroot -padmin -e \"
        SHOW STATUS WHERE Variable_name IN ('Threads_connected','Max_used_connections');
      \" -s -N);
      c=\$(echo \"\$values\" | awk '\$1==\"Threads_connected\"{print \$2}');
      m=\$(echo \"\$values\" | awk '\$1==\"Max_used_connections\"{print \$2}');
      echo \"\$ts,\$c,\$m\" >> \"$MYSQL_STATS_FILE\";
      sleep 1;
    done
    " &
    MYSQL_STATS_PID=$!
  fi

  #mongodb
  if [ "$DBMS" == "mongodb" ]; then
    MONGODB_STATUS_FILE="$METRIC_LOG_DIR/${MONITORED_CONTAINER}_mongostatus_${THREAD}threads_${LOOP}loops_${RAMP}ramp_${DATE}.json"

    nohup bash -c "
    while true; do
      ts=\$(date -u +\"%Y-%m-%dT%H:%M:%SZ\")
      stats=\$(docker exec $MONITORED_CONTAINER mongosh -u root -p admin --authenticationDatabase admin --quiet --eval \"
        const s = db.serverStatus({
          mem: 1,
          connections: 1,
          opcounters: 1,
          network: 1,
          wiredTiger: 1
        });
        print(JSON.stringify(s));
      \")
      echo \"{\\\"timestamp\\\": \\\"\$ts\\\", \\\"metrics\\\": \$stats}\" >> \"$MONGODB_STATUS_FILE\"
      sleep 1
    done
    " &
    MONGODB_STATS_PID=$!
  fi

  # Run JMeter load test
  ./get-test-template.sh "$JMX_FILE" "$BASE_URL" "$PORT_NUMBER" "$RAMP" "$LOOP" "$THREAD" "$DBMS" "${ENDPOINTS[@]}"

  # Stop docker stats
  kill "$STATS_PID"
  wait "$STATS_PID" 2>/dev/null
  echo "Docker stats for $DBMS saved to $METRIC_LOG_FILE"

  # Stop monitoring 
  if [ "$DBMS" == "mysql" ]; then
    kill "$MYSQL_STATS_PID"
    wait "$MYSQL_STATS_PID" 2>/dev/null
    echo "MySQL stats saved to $MYSQL_STATS_FILE"
  fi

  if [ "$DBMS" == "mongodb" ]; then
    kill "$MONGODB_STATS_PID"
    wait "$MONGODB_STATS_PID" 2>/dev/null
    echo "MongoDB stats saved to $MONGODB_STATUS_FILE"
  fi

done