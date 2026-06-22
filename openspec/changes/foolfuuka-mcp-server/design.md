## Context

Build a TypeScript MCP server that wraps the FoolFuuka REST API (used by desuarchive, 4plebs, b4k, archived.moe). The server exposes MCP tools for AI agents to search and retrieve historical archived 4chan posts.

The FoolFuuka API is documented at https://4plebs.org/docs/foolfuuka/ and the source is at https://github.com/FoolCode/FoolFuuka. All responses are JSON. Key endpoints:
- `GET /_/api/chan/search/` — full-text search (params: `boards`, `text`, `start`, `end`, `page`, `order`, etc.)
- `GET /_/api/chan/thread/` — thread by board+num (params: `board`, `num`, optional `latest_doc_id`, `last_limit`)
- `GET /_/api/chan/post/` — single post (params: `board`, `num`)
- `GET /_/api/chan/boards/` — list boards and site info (implementation target)

## Goals / Non-Goals

**Goals:**
- Provide MCP tools: `search_archive`, `get_thread`, `get_post`, `list_boards`
- Support any FoolFuuka archive via configurable base URL
- Package as npm with `npx foolfuuka-mcp-server` usage
- Correctly handle the FoolFuuka API's quirks (all-numeric fields as strings, `media` nullable, composite ghost post IDs)

**Non-Goals:**
- Authentication/authorization (FoolFuuka API is public)
- Aggressive retry or backoff strategies (single retry on 429, then surface error)
- Support for non-FoolFuuka archives
- Caching or persistence layer
- 4plebs-specific extensions (gallery, statistics, intel) — future scope

## Decisions

1. **Runtime: Node.js 18+ with TypeScript**
   - TypeScript: type safety for API responses and MCP tool schemas
   - Node.js 18+: native `fetch` avoids an extra HTTP dependency

2. **MCP Protocol: `@modelcontextprotocol/sdk`**
   - Official MCP SDK for TypeScript provides `Server`, `StdioServerTransport`, and tool registration
   - Handles JSON-RPC message framing and transport

3. **Configuration: `FOOLFUUKA_BASE_URL` env var (default: `https://desuarchive.org`)**
   - Single env var is simplest; users point it at any FoolFuuka instance
   - Default to desuarchive.org (no Cloudflare, directly accessible)
   - URL constructed with `new URL(path, baseUrl)` — handles trailing slash correctly
   - No CLI args (MCP stdio transport has no clean way to pass them)

4. **Architecture: Single module with tool functions**
   - No framework (Express, etc.) — MCP uses stdio transport
   - One entry point (`src/index.ts`) registers tools and starts server
   - One API client module (`src/foolfuuka.ts`) handles HTTP calls and response parsing

5. **Publishing: npm package with `bin` entry**
   - `package.json` `"bin"` field enables `npx foolfuuka-mcp-server`
   - Users configure env var in their MCP client config (Claude Desktop, etc.)

6. **HTTP Client: native `fetch` with configurable User-Agent**
   - Configurable via `FOOLFUUKA_USER_AGENT` env var
   - Default: `foolfuuka-mcp-server/1.0`
   - Respect `Retry-After` on 429 responses
    - Accept `If-Modified-Since` for conditional requests — [future]

7. **MCP response format: markdown, not raw JSON**
   - All tool handlers SHALL return `{ content: [{ type: "text", text: "..." }] }` with human-readable markdown
   - Error: a concise markdown error message with `**Error:**` prefix
   - Success: formatted data (tables for lists, headings + sections for single items)
   - The LLM consuming the MCP reads markdown naturally — raw JSON would waste tokens and be harder to parse for the model
   - Timestamps SHALL be formatted as UTC `YYYY-MM-DD HH:MM:SS` for full post views, `YYYY-MM-DD` for table summaries

8. **Markdown sanitization**
   - **Table cells** (search_archive excerpt): strip newlines, truncate to 120 chars with `...`, replace `|` with `\|`
   - **Post content** (get_thread, get_post): use `comment_sanitized` field (strips HTML, preserves greentext), prefix every line with `> ` to form a blockquote (this naturally neuters inline markdown like `#`, `*`, `_`)
   - **Media info**: format as `📎 filename.ext (W×H, SIZE)` where SIZE is human-readable (bytes if <1KB, KB with 0 decimals if <1MB, MB with 1 decimal otherwise). Include `[View](url)` link for get_post only (get_thread omits URLs to save tokens)

9. **Defensive type parsing**
   - FoolFuuka returns many numeric fields as strings (`"123"`)
   - `timestamp` can be `number` or `string`
   - `media` can be `null` (text-only posts)
   - All field access on `media` must be null-guarded
   - `media_size` is bytes as string — convert to human-readable format
   - `capcode`: `"N"` = normal user (omit display), `"M"` = Mod, `"A"` = Admin, `"D"` = Developer
   - Ghost posts: the API uses separate `num` and `subnum` fields. The client splits `num` on `_` to extract both

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| FoolFuuka API changes | Pin tested archive URL; monitor upstream |
| Large thread responses (thousands of posts) | Default `last_limit` of 100 posts. User can override or omit for full thread. Search paginates in pages of 25 |
| Archive rate limits (search: ~5 req/min on 4plebs) | Document in README; respect Retry-After headers |
| Cloudflare-protected archives (4plebs, archived.moe) | Default to desuarchive.org (no Cloudflare). Document Cloudflare issues for other instances |
| API responses inconsistent between instances | Only rely on base FoolFuuka fields; note 4plebs-only extras separately |
