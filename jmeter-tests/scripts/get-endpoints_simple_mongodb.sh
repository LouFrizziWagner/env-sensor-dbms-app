#!/bin/bash

ENDPOINTS=(
"/mongodb/get-first-observations"
"/mongodb/get-last-observations"
"/mongodb/bulk-read-1000"
"/mongodb/bulk-read-10000"
"/mongodb/average-monthly-temperature/summer-2020"
"/mongodb/average-humidity/june-2021"
)

# Read JMX file path from first script argument
JMX_FILE="$1"

# Validate that the file exists
if [[ ! -f "$JMX_FILE" ]]; then
  echo "Error: The JMX file '$JMX_FILE' does not exist."
  exit 1
fi

# Create results directory 
RESULTS_DIR="get-simple-100-nodes_mongodb/results"
mkdir -p "$RESULTS_DIR"

for endpoint in "${ENDPOINTS[@]}"; do
  # Replaces slash with underscore for clean filename 
  CLEAN_NAME=$(echo "$endpoint" | sed 's|/|_|g' | sed 's|^_||')
  
  echo "Running test for endpoint: $endpoint"
  
  jmeter -n -t "$JMX_FILE" \
    -JBASE_URL=localhost \
    -JPORT_NUMBER=3000 \
    -JRAMP_UP_IN_SECONDS=100 \
    -JLOOP_COUNT=10 \
    -JTHREAD_COUNT=100 \
    -JENDPOINT_PATH="$endpoint" \
    -l "$RESULTS_DIR/${CLEAN_NAME}.jtl"

  # Generate reports
  REPORT_DIR="get-simple-100-nodes_mongodb/reports/${CLEAN_NAME}"
  mkdir -p "$REPORT_DIR"
  jmeter -g "$RESULTS_DIR/${CLEAN_NAME}.jtl" -o "$REPORT_DIR"

  echo "Report generated at: $REPORT_DIR/index.html"
done