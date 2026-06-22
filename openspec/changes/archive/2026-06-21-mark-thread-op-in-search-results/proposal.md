## Why

LLMs often mistake individual search results for thread entries since the search_archive output only shows a "Post" column without thread context. Adding a "Thread" column and marking OP posts with "(OP)" makes the thread structure immediately clear, reducing errors when LLMs choose subsequent tools.

## What Changes

- Add a "Thread" column to search_archive table output, placed before the "Post" column, showing `#thread_num`
- Append "(OP)" to the Post cell value when a search result post is the thread original poster (`op === "1"`)
- Update both single-board and multi-board table formats
- Enrich all four tool descriptions (`search_archive`, `get_thread`, `get_post`, `list_boards`) with more specific detail about parameters and return format
- Update the integration test expectation for the table header

## Capabilities

### New Capabilities

- (none — this modifies existing output formatting only)

### Modified Capabilities

- (none — no existing capability specs to update)

## Impact

- `src/index.ts`: table header strings and row rendering in `search_archive` handler
- `tests/integration.test.ts`: test 6.4.3 table header assertion
