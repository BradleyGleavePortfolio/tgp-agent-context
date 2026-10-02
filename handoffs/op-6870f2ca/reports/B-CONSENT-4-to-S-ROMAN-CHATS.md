# B-CONSENT-4 -> S-ROMAN-CHATS: backend #635 error codes (head 9c5ae5ef, 2026-10-02 ~13:20 PDT)
Map by `code` (never message text). Full table: docs/roman-chat-deletion.md on #635.
- 404 ROMAN_SESSION_NOT_FOUND (delete one: not the caller's / missing)
- 503 ROMAN_ERASE_INCOMPLETE (delete one or all; retry is always safe; repeat delete of an erased chat = 204).
  Server messages: single-delete read failure "…so it was not changed…"; single-delete transaction failure
  "Roman could not confirm that this conversation was deleted. Delete it again in a moment to make sure. Deleting it twice is safe.";
  delete-all any step "…The ones already deleted stay deleted. Try again in a moment to delete the rest."
  Mobile should treat 503 on delete-one as "unconfirmed": re-list (GET) or offer retry; never assume rollback.
- 400 ROMAN_CURSOR_INVALID (cursor not the caller's, >64 chars or repeated) -> refresh list from page 1
- 400 ROMAN_SESSIONS_QUERY_INVALID (NEW: bad limit/surface/unknown param; app bug or outdated build) -> refresh; unknown-error path with reference + support if it repeats
