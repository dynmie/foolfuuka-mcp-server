## Why

There is currently no MCP server for querying 4chan archives (FoolFuuka-based sites like desuarchive, 4plebs, b4k, archived.moe). Existing 4chan MCP servers only support the live 4chan API (current threads only). This project fills that gap, enabling AI agents to search and retrieve historical archived posts from FoolFuuka instances via the Model Context Protocol.

## What Changes

- Create a new TypeScript npm project: `foolfuuka-mcp-server`
- Implement MCP tools to query the FoolFuuka REST API:
  - `search_archive` — full-text search across archived posts
  - `get_thread` — retrieve a complete thread by board and thread ID
  - `get_post` — retrieve a single post by board and post ID
  - `list_boards` — list available boards for a configured archive
- Package as an npm package with `npx` usage support
- Include README with setup and configuration docs

## Capabilities

### New Capabilities
- `search-archive`: Full-text search across FoolFuuka archives with filters (board, text query, date range)
- `get-thread`: Retrieve a complete thread with all its posts from a FoolFuuka archive
- `get-post`: Retrieve a single post by its ID from a FoolFuuka archive
- `list-boards`: List all available boards for a configured FoolFuuka archive instance

### Modified Capabilities
<!-- No existing capabilities to modify; this is a new project. -->

## Impact

- New npm package: `foolfuuka-mcp-server`
- Runtime: Node.js 18+ (TypeScript)
- Dependencies: MCP SDK (`@modelcontextprotocol/sdk`), a lightweight HTTP client (no heavy framework)
- Configuration: Archive base URL via `FOOLFUUKA_BASE_URL` env var (default: `https://desuarchive.org`)
- No breaking changes to existing code (standalone new project)
