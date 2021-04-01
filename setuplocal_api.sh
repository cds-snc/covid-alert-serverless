#!/bin/bash
export AWS_ACCESS_KEY_ID='DUMMYIDEXAMPLE'
export AWS_SECRET_ACCESS_KEY='DUMMYEXAMPLEKEY'

raw_table=$(aws dynamodb list-tables \
  --endpoint-url http://localhost:8000 \
  --region ca-central-1 | jq '.TableNames | index("raw_metrics")')

echo "raw_table is $raw_table"
if [ "$raw_table" = null ]; then 

  echo "Creating Local Tables"

  aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --cli-input-json file://raw_metrics.json \
    --region ca-central-1

  aws dynamodb list-tables \
    --endpoint-url http://localhost:8000 \
    --region ca-central-1

fi


sam local start-api \
  --template-file api_template.yaml \
  --log-file create_metric.log