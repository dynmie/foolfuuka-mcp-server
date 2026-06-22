# foolfuuka-mcp-server

MCP server for querying 4chan archives (Desuarchive, 4plebs, b4k, archived.moe) via the [FoolFuuka](https://github.com/FoolCode/FoolFuuka) API. Enables AI agents to search and retrieve historical archived posts through the [Model Context Protocol](https://modelcontextprotocol.io).

## Quick start

```sh
# Run directly (no install needed)
npx foolfuuka-mcp-server

# Or install globally
npm install -g foolfuuka-mcp-server
foolfuuka-mcp-server
```

Add to your MCP client config (Claude Desktop, VS Code, etc.):

```json
{
  "mcpServers": {
    "foolfuuka": {
      "command": "npx",
      "args": ["foolfuuka-mcp-server"]
    }
  }
}
```

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `FOOLFUUKA_BASE_URL` | `https://desuarchive.org` | Root URL of a FoolFuuka archive |
| `FOOLFUUKA_USER_AGENT` | `foolfuuka-mcp-server/1.0` | User-Agent header sent with API requests |

> [!TIP]
> Desuarchive works out of the box. For Cloudflare-protected archives (4plebs, archived.moe), you may need to run the server on a machine with the archive whitelisted, or use a different base URL.

## Tools

### `search_archive`

Full-text search across archived posts with filters.

**Parameters:** `text`, `boards`, `subject`, `username`, `tripcode`, `capcode`, `filename`, `image`, `uid`, `country`, `deleted`, `ghost`, `filter`, `type`, `start`, `end`, `results`, `order`, `page`

Returns a markdown table of matching posts with excerpts.

### `get_thread`

Retrieve all posts in a thread.

**Parameters:** `board`, `num`, `latest_doc_id` (incremental), `last_limit` (default 100)

Returns the OP post and all replies in markdown with author, timestamp, content, and media.

### `get_post`

Retrieve a single post.

**Parameters:** `board`, `num` (supports `_` suffix for ghost posts)

Returns full post details including media link when present.

### `list_boards`

List available boards for the configured archive.

**Parameters:** none

Returns a markdown table of board shortnames and names.

## Examples

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_archive",
    "arguments": { "boards": "a", "text": "hello world", "page": 1 }
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_thread",
    "arguments": { "board": "a", "num": 112800651 }
  }
}
```

## How it works

The server runs over **stdio transport** — it reads JSON-RPC messages from stdin and writes responses to stdout. There is no HTTP server.

```
LLM  <--MCP stdio-->  foolfuuka-mcp-server  <--HTTP-->  FoolFuuka Archive
```

All responses are formatted as markdown rather than raw JSON, making them natural for LLMs to consume without extra parsing.

## Rate limits

FoolFuuka archives enforce rate limits (e.g., ~5 requests/minute on 4plebs). The server respects `Retry-After` headers on 429 responses and surfaces the wait time to the caller.

## Development

```sh
git clone <repo>
cd foolfuuka-mcp-server
npm install
npm run build
npm test
```

Tests are written with [Vitest](https://vitest.dev) and live in `tests/`.

## License

MIT
