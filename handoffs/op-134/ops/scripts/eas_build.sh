#!/usr/bin/env bash
# read-only EAS build lookup by id (GraphQL), token injected by the sandbox proxy
for id in "$@"; do
q='query($id: ID!) { builds { byId(buildId: $id) { id status platform buildProfile appVersion appBuildVersion runtimeVersion gitCommitHash channel distribution createdAt updatedAt completedAt error { errorCode message } artifacts { buildUrl } } } }'
body=$(python3 -c 'import json,sys; print(json.dumps({"query": sys.argv[1], "variables": {"id": sys.argv[2]}}))' "$q" "$id")
curl -s -m 60 https://api.expo.dev/graphql -H 'Authorization: Bearer proxy-injected' -H 'Content-Type: application/json' -d "$body" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get("data",{}).get("builds",{}).get("byId") or d, indent=1)[:2500])'
echo -----; done
