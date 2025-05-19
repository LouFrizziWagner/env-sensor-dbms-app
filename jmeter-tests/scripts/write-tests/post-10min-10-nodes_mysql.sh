#!/bin/bash

ENDPOINTS=(
"/mysql/single-observation-insert"
)

# Read JMX file path from first script argument
JMX_FILE="$1"

# Validate that the file exists
if [[ ! -f "$JMX_FILE" ]]; then
  echo "Error: The JMX file '$JMX_FILE' does not exist."
  exit 1
fi

# Create results directory 
RESULTS_DIR="post-10min-10-nodes_mysql/results"
mkdir -p "$RESULTS_DIR"

for endpoint in "${ENDPOINTS[@]}"; do
  # Replaces slash with underscore for clean filename 
  CLEAN_NAME=$(echo "$endpoint" | sed 's|/|_|g' | sed 's|^_||')
  
  echo "Running test for endpoint: $endpoint"
  
  jmeter -n -t "$JMX_FILE" \
    -JDURATION_IN_SECONDS=600 \
    -JTHREAD_DELAY_IN_MS=60000 \
    -JBASE_URL=localhost \
    -JPORT_NUMBER=4000 \
    -JRAMP_UP_IN_SECONDS=10 \
    -JTHREAD_COUNT=10 \
    -JENDPOINT_PATH="$endpoint" \
    -l "$RESULTS_DIR/${CLEAN_NAME}.jtl"

  # Generate reports
  REPORT_DIR="post-10min-10-nodes_mysql/reports/${CLEAN_NAME}"
  mkdir -p "$REPORT_DIR"
  jmeter -g "$RESULTS_DIR/${CLEAN_NAME}.jtl" -o "$REPORT_DIR"

  echo "Report generated at: $REPORT_DIR/index.html"
done