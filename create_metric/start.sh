#!/bin/bash
set -o errexit

BASEDIR="$1"
echo "Using $BASEDIR for docker-volume-basedir"
/usr/local/bin/sam local start-api \
  --docker-volume-basedir "${BASEDIR}" \
  --warm-containers "EAGER" \
  --region ca-central-1
