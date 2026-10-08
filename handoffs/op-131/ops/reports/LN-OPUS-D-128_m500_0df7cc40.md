AUDIT Claude Opus 5.5 (LN-OPUS-D-128) — growth-project-mobile#500 @ 0df7cc40c6a755e7f1585cd923564bcbc7f4399e — VERDICT: APPROVE

Scope: full review (first Opus review). 376 changed lines (+288 / -88, 5 files), under the cap. Checks at head: Typecheck, lint, test / CodeQL / Analyze all SUCCESS.

**Bs: none.**

Checked:
- Rule 1 (copy against data): "<n> to get." / "All items checked." come from the `unchecked` and `items` arrays and are hidden while loading, on error or when empty. "<n> recipe(s) for the week." comes from `data.recipes.length`. The coach-assuming prep empty line, the "fresh food for the whole week" promise and "Building..." (the call is a GET load) are replaced with neutral, true lines. On Grocery and Shopping the false "Pull down to try again." is replaced by a working Try again -> `refetch()`. That branch has no RefreshControl, so this is a real fix. On Prep the line is kept, which is correct there because the ScrollView carries a RefreshControl.
- Rules 2/4/6: back, add (fields + submit), check/uncheck, remove, clear checked with confirm/cancel, pull to refresh, week arrows, Add all with confirm, success OK / View List -> GroceryList all keep the same handlers and mutations. Add all is now disabled only when there are 0 ingredients (it did nothing before). Grocery and Shopping diffs are identical apart from the title and error noun. GroceryPrep.parity covers every action.
- Rule 7 / doctrine: the local colour adapters read `semanticColors` only (no `colors.*` legacy palette, no hex). The shared EmptyState is replaced by a theme-aware local one. Hairline rows; outline check glyph; 44 pt check, remove, back and week targets; Cormorant h1/h2 for title and summary; Inter body; tabular numerals on quantities; radius 4; one forest primary (Add / Add all).

Cs (one line each):
- C: The new Grocery/Shopping "Try again" TouchableOpacity has no accessibilityRole="button" or label (the other new controls have both); add them.
- C: The local `EmptyState` is duplicated in three files and ignores `icon`; fold it into src/ui later.
- C: "Recipes to Prep (n)" / "Aggregated Ingredients (n)" section titles stay in title case (sentence-case sweep).
