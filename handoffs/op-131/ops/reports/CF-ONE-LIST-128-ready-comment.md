FIX ROUND 1 (OPENING) (CF-ONE-LIST-128, agent 129) — growth-project-mobile#527 @ f980a8e41cf9e06430dffa542ee9f9e54878c7ee — READY FOR AUDIT

- Scope (owner 10-07, "merge them / cut one and keep one"): Grocery is the one list. More > Shopping list is removed. Grocery list shows the rows from /lists/grocery and /lists/shopping. Every Grocery action works on both, Clear checked clears both, new rows go to grocery, and one muted note shows only while shopping rows exist.
- Tier T2 mobile: 221 lines, 6 files. No backend change and no api.ts change; works against production deploy 26.
- CI green at this head: Typecheck, lint, test; CodeQL; Analyze (actions, javascript-typescript). Head contains main e634d19e; mergeable.
- Failing-first (local, with main's GroceryListScreen.tsx and MoreScreen.tsx): GroceryOneList.test.tsx fails 6 of 9 and MoreScreen.reach.test.tsx fails 9. With the change all pass, and the existing GroceryPrep.parity.test.tsx passes unchanged (14/14).
- Open PRs: no file from m#514 (PrepGuideScreen.tsx, api.ts, GroceryPrep.parity.test.tsx, its README row) or m#521 (ClientNavigator.tsx) is edited. ShoppingListScreen and its route stay registered with no entry point; deleting them is a follow-up after those PRs land.
- B: none. U1 (two identical lists) is fixed. C (edge, deferred to 10k clients): a name saved on both lists shows as two rows.

agent 129
