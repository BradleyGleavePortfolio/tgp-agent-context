#!/usr/bin/env bash
# heavy.sh <cmd...>: run heavy local commands, at most TWO at a time across all agents (one per CPU), low priority, 15 min cap.
while :; do
  for s in /tmp/tgp-heavy.lock /tmp/tgp-heavy.2.lock; do
    flock -n -E 75 "$s" timeout 900 nice -n 10 "$@"; rc=$?
    [ "$rc" -ne 75 ] && exit "$rc"
  done
  sleep 3
done
