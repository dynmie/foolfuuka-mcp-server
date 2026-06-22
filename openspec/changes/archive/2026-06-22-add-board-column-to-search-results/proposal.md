## Why

The `search_archive` tool conditionally hides the Board column when searching a single board, creating inconsistent output. Users always benefit from seeing which board a post belongs to, even in single-board searches — it confirms context and keeps table output uniform across all search modes.

## What Changes

- `search_archive` will always include the **Board** column in its markdown table output, regardless of whether the search targets one board or multiple boards.
- The `isMultiBoard` branching logic for table headers and data rows will be removed in favor of always rendering with the Board column.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities
- `search-archive`: The output table now always includes a Board column, regardless of whether the search targets one board or multiple boards

## Impact

- **Files:** `src/index.ts` (~6 lines removed, 2 simplified), `tests/integration.test.ts` (1 assertion updated), `README.md` (1 example updated)
- No new dependencies, no API or schema changes.
