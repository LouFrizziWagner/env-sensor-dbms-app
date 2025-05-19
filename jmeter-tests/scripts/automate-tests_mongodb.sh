#!/bin/bash

# fail-fast mode
set -e

echo "...chmod +x on all shell scripts.."
chmod +x ./scripts/read-tests/*.sh
chmod +x ./scripts/write-tests/*.sh

# Predefined JMX files
READ_JMX_FILE="/Users/louwagner/Desktop/JMeter_Template_TestPlans/generic-get-testplan.jmx"
WRITE_JMX_FILE="/Users/louwagner/Desktop/JMeter_Template_TestPlans/Insert_Operations_Test.jmx"

# Validate JMX Files
if [[ ! -f "$READ_JMX_FILE" ]]; then
  echo "Error: Read JMX file '$READ_JMX_FILE' does not exist."
  exit 1
fi

if [[ ! -f "$WRITE_JMX_FILE" ]]; then
  echo "Error: Write JMX file '$WRITE_JMX_FILE' does not exist."
  exit 1
fi

echo "======================================"
echo "===        Starting READ Tests      ==="
echo "======================================"

echo "--- 1 Node ---"
./scripts/read-tests/get-1-node_mongodb.sh "$READ_JMX_FILE"

echo "--- 10 Nodes ---"
./scripts/read-tests/get-10-nodes_mongodb.sh "$READ_JMX_FILE"

echo "--- 50 Nodes ---"
./scripts/read-tests/get-50-nodes_mongodb.sh "$READ_JMX_FILE"

echo "--- Simple 100 Nodes ---"
./scripts/read-tests/get-simple-100-nodes_mongodb.sh "$READ_JMX_FILE"

echo "======================================"
echo "===       Starting WRITE Tests      ==="
echo "======================================"

echo "--- 5min 1 Node ---"
./scripts/write-tests/post-5min-1-node_mongodb.sh "$WRITE_JMX_FILE"

echo "--- 10min 10 Nodes ---"
./scripts/write-tests/post-10min-10-nodes_mongodb.sh "$WRITE_JMX_FILE"

echo "--- 30min 50 Nodes ---"
./scripts/write-tests/post-30min-50-nodes_mongodb.sh "$WRITE_JMX_FILE"

echo "--- 30min 100 Nodes ---"
./scripts/write-tests/post-30min-100-nodes_mongodb.sh "$WRITE_JMX_FILE"

echo "======================================"
echo "===         All Tests Completed     ==="
echo "======================================"