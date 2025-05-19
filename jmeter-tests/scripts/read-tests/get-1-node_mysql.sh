#!/bin/bash

ENDPOINTS=(
"/mysql/hive-sensors"
"/mysql/time-between-observations/14-days"
"/mysql/bulk-read-1000"
"/mysql/bulk-read-10000"
"/mysql/bulk-read-100000"
"/mysql/average-monthly-temperature/summer-2020"
"/mysql/average-humidity/june-2021"
"/mysql/max-humidity/year-2020-2021"
"/mysql/hourly-hive-power-trend"
"/mysql/temperature-variance-per-hive"
"/mysql/temperature-humidity-correlation"
"/mysql/hourly-hive-power-trend/2020-2023"
"/mysql/humidity-daily-range/2020-2023"
)

# Read JMX file path from first script argument
JMX_FILE="$1"

# Validate that the file exists
if [[ ! -f "$JMX_FILE" ]]; then
  echo "Error: The JMX file '$JMX_FILE' does not exist."
  exit 1
fi

# Create results directory 
RESULTS_DIR="get-1-node_mysql/results"
mkdir -p "$RESULTS_DIR"

for endpoint in "${ENDPOINTS[@]}"; do
  # Replaces slash with underscore for clean filename 
  CLEAN_NAME=$(echo "$endpoint" | sed 's|/|_|g' | sed 's|^_||')
  
  echo "Running test for endpoint: $endpoint"
  
  jmeter -n -t "$JMX_FILE" \
    -JBASE_URL=localhost \
    -JPORT_NUMBER=4000 \
    -JRAMP_UP_IN_SECONDS=1\
    -JLOOP_COUNT=10 \
    -JTHREAD_COUNT=1 \
    -JENDPOINT_PATH="$endpoint" \
    -l "$RESULTS_DIR/${CLEAN_NAME}.jtl"

  # Generate reports
  REPORT_DIR="get-1-node_mysql/reports/${CLEAN_NAME}"
  mkdir -p "$REPORT_DIR"
  jmeter -g "$RESULTS_DIR/${CLEAN_NAME}.jtl" -o "$REPORT_DIR"

  echo "Report generated at: $REPORT_DIR/index.html"
done