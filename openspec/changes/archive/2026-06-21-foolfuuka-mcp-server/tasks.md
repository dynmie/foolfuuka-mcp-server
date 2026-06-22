## 1. Project Scaffold

- [x] 1.1 Initialize npm project with `package.json`, `tsconfig.json`, and `.gitignore`
- [x] 1.2 Install dependencies: `@modelcontextprotocol/sdk`, `typescript`, `@types/node`, `zod`
- [x] 1.3 Configure TypeScript (target ES2022, module NodeNext, strict mode)
- [x] 1.4 Add `bin` entry and `build`/`start` scripts to `package.json`
- [x] 1.5 Create `src/` directory structure
- [x] 1.6 Configure npm package hygiene: `files`, `engines` (>=18), `license`, `repository`, `keywords` fields

## 2. TypeScript Types

- [x] 2.1 Define `Post`, `Media`, `Board`, `Site` interfaces matching FoolFuuka response shapes
- [x] 2.2 Define `SearchMeta`, `SearchResponse`, `ThreadResponse`, `BoardsResponse` response wrappers
- [x] 2.3 Define helper to build markdown MCP responses: `formatSuccess(text: string)` and `formatError(text: string)` returning MCP `{ content: [{ type: "text", text }] }`
- [x] 2.4 Define input parameter types for each tool

## 3. FoolFuuka API Client

- [x] 3.1 Implement `src/foolfuuka.ts` with base URL normalization (strip trailing slash via `new URL(path, baseUrl)`)
- [x] 3.2 Implement `searchPosts()` function calling `/_/api/chan/search/` with all supported params
- [x] 3.3 Implement `getThread()` function calling `/_/api/chan/thread/` with `board`, `num`, `latest_doc_id`, `last_limit`
- [x] 3.4 Implement `getPost()` function calling `/_/api/chan/post/` with `board`, `num` (string type for ghost posts)
- [x] 3.5 Implement `listBoards()` function calling `/_/api/chan/boards/`
- [x] 3.6 Add configurable `User-Agent` via `FOOLFUUKA_USER_AGENT` env var (default: `foolfuuka-mcp-server/1.0`)
- [x] 3.7 Handle HTTP errors: detect `error` key in 200 response bodies, handle 429 with `Retry-After`, surface clear error messages
- [x] 3.8 Apply defensive type parsing: `Number()` on numeric strings, null-guard `media`, handle `timestamp` as number|string

## 4. MCP Server

- [x] 4.1 Implement `src/index.ts` entry point — create MCP `Server` with stdio transport
- [x] 4.2 Register `search_archive` tool with Zod input schema and description
- [x] 4.3 Register `get_thread` tool with Zod input schema and description
- [x] 4.4 Register `get_post` tool with Zod input schema and description
- [x] 4.5 Register `list_boards` tool with Zod input schema and description
- [x] 4.6 Implement markdown formatting helpers:
  - [x] 4.6a Table cell sanitizer (escape `|`, strip newlines, truncate excerpts to 120 chars)
  - [x] 4.6b Post content formatter (prefix lines with `> ` for blockquote, handle empty content)
  - [x] 4.6c Media info formatter (file icon, filename, dimensions, human-readable size, optional URL)
  - [x] 4.6d Timestamp formatter (Unix → UTC `YYYY-MM-DD HH:MM:SS` or `YYYY-MM-DD`)
  - [x] 4.6e Author line formatter (name, tripcode if present, capcode label if non-user)
- [x] 4.7 Wire each tool handler to the corresponding FoolFuuka client function, formatting output with markdown helpers
- [x] 4.7 Handle configuration via `FOOLFUUKA_BASE_URL` env var

## 5. Build & Package

- [x] 5.1 Verify TypeScript compilation with `tsc`
- [x] 5.2 Test with `npm pack --dry-run` (verify published files are correct)
- [x] 5.3 Write README with usage examples, configuration, rate-limit docs, and supported archives

## 6. Testing

- [x] 6.1 Set up Vitest with test script in `package.json`
- [x] 6.2 Unit tests for FoolFuuka API client:
  - [x] 6.2.1 Parse search response: verify posts extracted from `{"0": posts, "meta": ...}` shape
  - [x] 6.2.2 Parse thread response: verify `op` and `posts` (dict keyed by num) extracted correctly
  - [x] 6.2.3 Parse boards response: verify site + boards array from `{"site": ..., "boards": {id: ...}}` shape
  - [x] 6.2.4 Error detection: detect `{"error":"..."}` in 200 responses for all 4 endpoints
  - [x] 6.2.5 Defensive numeric types: `media.w` is `"216"` → parse as number, `timestamp` as `1782083116` or `"1782083116"` both work
  - [x] 6.2.6 Nullable media: post without attachment → `media` is `null`, code doesn't crash
  - [x] 6.2.7 Ghost post num: `"676_1"` split correctly into `num=676, subnum=1`
  - [x] 6.2.8 URL construction: trailing slash on base URL handled (base + path via `new URL()`)
  - [x] 6.2.9 HTTP 429 response: detect status, parse `Retry-After` header
- [x] 6.3 Unit tests for markdown formatting:
  - [x] 6.3.1 Table cell: pipe in excerpt gets escaped (`|` → `\|`)
  - [x] 6.3.2 Table cell: newlines stripped, truncated to 120 chars with `...`
  - [x] 6.3.3 Post content: every line prefixed with `> ` (including empty lines → `> `)
  - [x] 6.3.4 Post content: greentext (`>>`) preserved inside blockquote
  - [x] 6.3.5 Media line: `<1KB shows bytes`, `<1MB shows KB`, `>=1MB shows MB`
  - [x] 6.3.6 Author line: name only vs name+tripcode vs name+capcode formatting
  - [x] 6.3.7 Timestamp format: Unix → `YYYY-MM-DD HH:MM:SS UTC`
  - [x] 6.3.8 Board column: included when multi-board search, omitted for single board
- [x] 6.4 Integration tests (run against real desuarchive API):
  - [x] 6.4.1 MCP Inspector: connect to server, verify 4 tools registered with descriptions
  - [x] 6.4.2 Smoke test `list_boards` against desuarchive.org (real API call)
  - [x] 6.4.3 Smoke test `search_archive` with `boards="a"` and `text="test"` (real API call)
  - [x] 6.4.4 Smoke test `get_post` with known good post from board `a` (real API call)
  - [x] 6.4.5 Smoke test error: `get_thread` with invalid thread → `**Error:** Thread not found.`
