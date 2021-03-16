#curl --location --request POST 'http://save_metrics:3001/' \
curl  --request POST 'http://localhost:3000/save_metrics' \
--header 'Content-Type: application/json' \
--data-raw '{
  "metricstimestamp": 1611324826295,
  "appversion": "999",
  "appos": "ios",
  "bar": "baz"
  "payload": [{
          "identifier": "installed",
          "region": "CALVIN",
          "timestamp": 1613751687616
      }
    ]
}
'
