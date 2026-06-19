# Paste-able first prompt for a fresh Perplexity Computer instance

Copy everything below the line into your first message to a new instance.

---

Resume the Wave H endgame.

First action: read `/home/user/workspace/START_HERE.md` and follow it top to bottom. Then check in with me with the current SHAs, CI status, next planned action, and estimated credit cost before dispatching anything.

State-write obligation (MANDATORY): before any of these, write `/home/user/workspace/current-state.json` per the schema in `HANDOFF_NEXT_OPERATOR.md`, then mention `state-write: confirmed` in your reply:
- before `wait_for_subagents` on the last in-flight subagent
- before `pause_and_wait`
- before any message containing "stopping", "saving budget", "handing off", or "session over"
- before answering with no tool calls when subagents are still in flight
- after any subagent returns with a new PR head (update that PR's entry immediately, do not batch)

If you don't see `state-write: confirmed` in your own reply when stopping, you failed. Re-run the write.

Mechanics are yours. Decisions are mine.
