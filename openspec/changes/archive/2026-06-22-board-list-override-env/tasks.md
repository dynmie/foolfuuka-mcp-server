## 1. Refactor board data in foolfuuka.ts

- [x] 1.1 Add `DESUARCHIVE_BOARDS` constant — the curated subset of shortnames: `a, aco, an, c, cgl, co, d, fit, g, his, int, k, m, mlp, mu, q, qa, r9k, tg, trash, vr, wsg`
- [x] 1.2 Add helper `parseBoardsEnvVar()` that reads `FOOLFUUKA_BOARDS`, splits by comma, trims whitespace, and returns an array of shortnames (or `null` if unset)
- [x] 1.3 Add helper `resolveBoards(shortnames: string[])` that maps shortnames to `{shortname, name, search_enabled}` objects, falling back to the shortname itself as the name if not found in `FOURCHAN_BOARDS`
- [x] 1.4 Add helper `isDesuArchive()` that checks if `getBaseUrl()` includes `"desuarchive.org"`

## 2. Rewrite listBoards() with new logic

- [x] 2.1 If `FOOLFUUKA_BOARDS` is set → parse and return those boards via `resolveBoards()`
- [x] 2.2 Else if desuarchive → return `DESUARCHIVE_BOARDS` via `resolveBoards()`
- [x] 2.3 Else → try API `/boards/` endpoint; on failure, return full `FOURCHAN_BOARDS`
- [x] 2.4 Ensure all returned boards have `search_enabled: true` and site info is populated

## 3. Verify and test

- [x] 3.1 Run `npm run build` to confirm TypeScript compiles
- [x] 3.2 Run `npm test` to confirm existing tests pass
