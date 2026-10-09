#!/usr/bin/env bash
# link_deps.sh <backend|mobile> <worktree>: symlink the shared node_modules into your worktree (waits for READY).
set -e; r=$1; wt=$2; d=/home/user/workspace/deps/$r
[ -f $d/READY ] || { echo "deps/$r not READY yet (install running); read code and rely on PR CI meanwhile"; exit 3; }
[ -e $wt/node_modules ] || ln -s $d/node_modules $wt/node_modules; echo "linked $d/node_modules -> $wt/node_modules"
