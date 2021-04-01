#!/bin/bash
export AWS_ACCESS_KEY_ID='DUMMYIDEXAMPLE'
export AWS_SECRET_ACCESS_KEY='DUMMYEXAMPLEKEY'

raw_table=$(aws dynamodb list-tables \
  --endpoint-url http://localhost:8000 \
  --region ca-central-1 | jq '.TableNames | index("aggregate_metrics")')

if [ "$raw_table" = null ]; then 

  aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --cli-input-json file://aggregate_metrics.json \
    --region ca-central-1

  aws dynamodb list-tables \
    --endpoint-url http://localhost:8000 \
    --region ca-central-1

fi


sam local start-lambda \
  --template-file aggregate_template.yaml \
  --log-file agg_metric.log