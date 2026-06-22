## Why

The `listBoards` function currently returns a hardcoded list of ~70 4chan boards regardless of which archive is configured. This is inaccurate for desuarchive.org (which only mirrors a subset of boards) and doesn't allow users of other archives to customize which boards appear.

## What Changes

- Add `FOOLFUUKA_BOARDS` env var (comma-separated board shortnames) to override the returned board list
- When unset and archive is desuarchive.org, return a curated subset matching what desuarchive actually mirrors
- When unset and archive is NOT desuarchive.org, attempt the API `/boards/` endpoint and fall back to the current hardcoded list

## Capabilities

### New Capabilities
- `board-list-override`: Allow users to override the board list via env var, with archive-aware defaults

### Modified Capabilities

*(None — no existing specs to modify)*

## Impact

- **`src/foolfuuka.ts`**: Rewrite `listBoards()` and the `FOURCHAN_BOARDS` constant; add desuarchive-specific subset; add env var parsing
- **Env config**: Document `FOOLFUUKA_BOARDS` alongside existing `FOOLFUUKA_BASE_URL` and `FOOLFUUKA_USER_AGENT`
