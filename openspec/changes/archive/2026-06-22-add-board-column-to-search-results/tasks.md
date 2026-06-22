## 1. Update search_archive table output

- [x] 1.1 Remove `isMultiBoard` variable (line 58) and both `if (isMultiBoard)` branching blocks — always render "Board | Thread | Post | Date | Author | Excerpt" header and data rows
- [x] 1.2 Update `tests/integration.test.ts:110` assertion to match new always-Board-column format
- [x] 1.3 Update `README.md` single-board example table (lines 95-100) — add Board column to header, separator, and all data rows
- [x] 1.4 Verify with `npm run build` and `npm test`
