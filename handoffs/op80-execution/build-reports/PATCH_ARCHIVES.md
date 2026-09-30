# Exact Patch Archive Custody

The original C1 and pagination patch bytes are preserved in deterministic gzip archives, not reformatted. Ordinary blank context lines in a unified patch have a required leading space; treating the patch as newly added document text incorrectly flags those spaces as trailing whitespace.

- **C1:** `c1/C1_FINAL.patch.gz` decompresses to the exact original `C1_FINAL.patch`, SHA256 `851eb12eefa459409e6b38717a2e971ac2dff4bfde3e728a1d042d88bf9ba603`.
- **Pagination input-relative:** `pagination-fix-r3/pagination-fix-r3.patch.gz` preserves the original input-relative patch.
- **Pagination main-relative:** `pagination-fix-r3/pagination-cumulative-main.patch.gz` preserves the original cumulative patch.
- **C1a, main-relative:** `c1-split/C1a.patch.gz` preserves SHA256 `5b429e2ffb0dea0d7c75f7ef4ecd46a7ea89f0e60a0894e92f3a5e7eb729aed5`, reconstructing tree `404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556` from backend `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`.
- **C1b, relative to C1a only:** `c1-split/C1b-relative.patch.gz` preserves SHA256 `2f50e35aa547df6249ffd4426a627d22e5944870edb814891d5bc3ecef8e029b`, reconstructing tree `660e436ecbf911b6984b40ed43d135e3dc308378` from the C1a tree.
- **Combined C1, main-relative review evidence only:** `c1-split/C1-cumulative.patch.gz` preserves SHA256 `eae14ef30495cf0870847695b83178e5d5bcfefd4d5c3c6791d23af13f1e25b9`, reconstructing the final B tree. Its 454 net workflow lines still exceed the cap; do not publish it as one product PR.

Each archive was decompressed and compared byte-for-byte with its source before publication. Original plain patches remain in the execution workspace; historical builder reports retain their original filenames and links rather than being rewritten as new verdicts. The pagination report's `DELIVERABLE_SHA256.txt` retains the original uncompressed checksums.

The split packet also preserves `C1a-focused.log` and `C1b-focused.log` as `.log.gz` archives. Their original Jest coverage tables contain trailing alignment spaces; compression retains those exact evidence bytes without modifying output to pass a documentation whitespace check. All other split logs are plain text, and the original uncompressed focused logs remain in the execution workspace.
