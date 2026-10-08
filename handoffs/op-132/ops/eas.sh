#!/usr/bin/env bash
# eas-cli with the Expo token injected by the sandbox proxy (only api.expo.dev goes through the proxy; fetch.js patched)
export EXPO_TOKEN=proxy-injected
export https_proxy="${HTTPS_PROXY:-}"
exec /home/user/workspace/tools/eas/node_modules/.bin/eas "$@"
