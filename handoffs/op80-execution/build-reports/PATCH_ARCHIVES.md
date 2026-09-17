# Exact Patch Archive Custody

The original C1 and pagination patch bytes are preserved in deterministic gzip archives, not reformatted. Ordinary blank context lines in a unified patch have a required leading space; treating the patch as newly added document text incorrectly flags those spaces as trailing whitespace.

- **C1:** `c1/C1_FINAL.patch.gz` decompresses to the exact original `C1_FINAL.patch`, SHA256 `851eb12eefa459409e6b38717a2e971ac2dff4bfde3e728a1d042d88bf9ba603`.
- **Pagination input-relative:** `pagination-fix-r3/pagination-fix-r3.patch.gz` preserves the original input-relative patch.
- **Pagination main-relative:** `pagination-fix-r3/pagination-cumulative-main.patch.gz` preserves the original cumulative patch.

Each archive was decompressed and compared byte-for-byte with its source before publication. Original plain patches remain in the execution workspace; historical builder reports retain their original filenames and links rather than being rewritten as new verdicts. The pagination report's `DELIVERABLE_SHA256.txt` retains the original uncompressed checksums.
