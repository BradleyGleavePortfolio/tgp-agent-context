#!/usr/bin/env bash
# eas_q.sh '<graphql query>' '<variables json>': read-only Expo GraphQL query, token injected by the proxy
body=$(python3 -c 'import json,sys; print(json.dumps({"query": sys.argv[1], "variables": json.loads(sys.argv[2])}))' "$1" "${2:-{\}}")
curl -s -m 60 https://api.expo.dev/graphql -H 'Authorization: Bearer proxy-injected' -H 'Content-Type: application/json' -d "$body"
