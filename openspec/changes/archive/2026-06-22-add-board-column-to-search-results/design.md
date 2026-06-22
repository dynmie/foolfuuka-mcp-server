## Context

`search_archive` in `src/index.ts` currently renders a markdown table with two code paths depending on whether the search spans multiple boards (`isMultiBoard`). When `isMultiBoard` is true, the table includes a `Board` column; when false (single-board search), the Board column is omitted. The `board` field is available on every post object via `post.board.shortname`, so there's no data availability concern.

## Goals / Non-Goals

**Goals:**
- Always render the Board column in the search results table
- Remove the `isMultiBoard` conditional branching for table headers and data rows

**Non-Goals:**
- `isMultiBoard` removal is a side-effect, not a primary goal — the focus is on table output
- No change to search logic, API calls, or data fetching
- No change to other tools or output formats

## Decisions

- **Remove `isMultiBoard` entirely.** The heading line (`on /a/` vs `(all boards)`) uses `args.boards ? ... : ...` directly at line 63, not `isMultiBoard`. After table branching is unified, `isMultiBoard` is dead code.
- **Post.board is always available.** The API returns `board` info for every post in search results, so there's no need for a fallback or lookup.

## Risks / Trade-offs

- Minimal risk — purely a display change, no data transformation or new code paths. The Board column already exists and renders correctly in multi-board mode.
- Test assertion in `tests/integration.test.ts:110` expects the old single-board format — must be updated.
- `README.md` single-board example at line 95 shows old format — must be updated.
