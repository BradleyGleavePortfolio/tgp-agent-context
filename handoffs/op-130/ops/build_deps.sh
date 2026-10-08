#!/usr/bin/env bash
# build_deps.sh <backend|mobile>: shared node_modules for every worktree (main's lockfile), then READY.
set -uo pipefail
r=$1; d=/home/user/workspace/deps/$r; src=/home/user/workspace/wt/RO-$r
rm -f $d/READY; mkdir -p $d
cp $src/package.json $src/package-lock.json $d/
[ -f $src/.npmrc ] && cp $src/.npmrc $d/
if [ "$r" = backend ]; then rm -rf $d/prisma; cp -r $src/prisma $d/prisma; git init -q $d 2>/dev/null; fi  # agent 130: lefthook prepare needs a git dir
if [ "$r" = mobile ]; then mkdir -p $d/scripts; cp $src/scripts/patch-react-native-health.js $d/scripts/; fi
cd $d
start=$(date +%s)
nice -n 5 npm ci --no-audit --no-fund --loglevel=error > $d/install.log 2>&1; rc=$?
echo "npm ci rc=$rc in $(( $(date +%s) - start ))s" >> $d/install.log
[ $rc -eq 0 ] && date -u +%FT%TZ > $d/READY && echo "READY $(cat $d/READY)" >> $d/install.log
