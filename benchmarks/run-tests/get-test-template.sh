#!/bin/bash

JMX_FILE="$1"
BASE_URL="$2"
PORT_NUMBER="$3"
RAMP_UP_IN_SECONDS="$4"
LOOP_COUNT="$5"
THREAD_COUNT="$6"
DBMS="$7"
shift 7
ENDPOINTS=("$@") 

RESULTS_DIR="${DBMS}_Get-Requests_${THREAD_COUNT}-threads_${LOOP_COUNT}-repeats/results"
REPORTS_BASE="${DBMS}_Get-Requests_${THREAD_COUNT}-threads_${LOOP_COUNT}-repeats/reports"
HDR_BASE="${DBMS}_Get-Requests_${THREAD_COUNT}-threads_${LOOP_COUNT}-repeats/hdrhistograms"
mkdir -p "$RESULTS_DIR" "$REPORTS_BASE" "$HDR_BASE"

# Save config
CONFIG_DIR="$RESULTS_DIR/test-config"
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_DIR/test-config.txt" << EOF
DBMS=$DBMS
BASE_URL=$BASE_URL
PORT_NUMBER=$PORT_NUMBER
RAMP_UP_IN_SECONDS=$RAMP_UP_IN_SECONDS
LOOP_COUNT=$LOOP_COUNT
THREAD_COUNT=$THREAD_COUNT
JMeter Test Plan: $JMX_FILE
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

for endpoint in "${ENDPOINTS[@]}"; do
  CLEAN_NAME=$(echo "$endpoint" | sed 's|/|_|g' | sed 's|^_||')
  RAW_JTL="$RESULTS_DIR/${CLEAN_NAME}.jtl"
  HDR_OUT="$HDR_BASE/${CLEAN_NAME}"
  REPORT_DIR="$REPORTS_BASE/${CLEAN_NAME}"
  mkdir -p "$REPORT_DIR"

  echo "Running test for endpoint: $endpoint"
  jmeter -n -t "$JMX_FILE" \
    -JBASE_URL="$BASE_URL" \
    -JPORT_NUMBER="$PORT_NUMBER" \
    -JRAMP_UP_IN_SECONDS="$RAMP_UP_IN_SECONDS" \
    -JLOOP_COUNT="$LOOP_COUNT" \
    -JTHREAD_COUNT="$THREAD_COUNT" \
    -JENDPOINT_PATH="$endpoint" \
    -l "$RAW_JTL" \
    -j "$RESULTS_DIR/${CLEAN_NAME}.log" \
    -Jjmeter.save.saveservice.output_format=csv \
    -Jjmeter.save.saveservice.timestamp_format=ms \
    -Jjmeter.save.saveservice.latency=true \
    -Jjmeter.save.saveservice.connect_time=true \
    -Jjmeter.save.saveservice.time=true \
    -Jjmeter.save.saveservice.successful=true \
    -Jjmeter.save.saveservice.thread_name=true \
    -Jjmeter.save.saveservice.label=true \
    -Jhdrhistogram.fileoutput=true \
    -Jhdrhistogram.output.path="$HDR_OUT"

  jmeter -g "$RAW_JTL" -o "$REPORT_DIR"
  echo "Report generated at: $REPORT_DIR/index.html"
done