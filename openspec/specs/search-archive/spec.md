## Purpose

Provide full-text search across archived 4chan posts via a FoolFuuka archive, with filtering by board, text, date range, file type, and more.

## Requirements

### Requirement: Full-text search across archived posts
The system SHALL provide an MCP tool `search_archive` that performs full-text search across a FoolFuuka archive's indexed posts.

#### Tool Description
"Full-text search across archived 4chan posts. Filter by board, text, date range, file type, and more. Returns matching posts with excerpts and metadata."

#### Input Schema
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | `string` | No | — | Comment text to search for |
| `boards` | `string` | No | all boards | Dot-delimited board shortnames, e.g. `"a"` or `"adv.trv"` |
| `subject` | `string` | No | — | OP subject line search |
| `username` | `string` | No | — | Poster name match |
| `tripcode` | `string` | No | — | Tripcode match |
| `capcode` | `string` | No | — | One of: `user`, `mod`, `admin`, `dev`, `manager`, `founder` |
| `filename` | `string` | No | — | Original filename search |
| `image` | `string` | No | — | Base64 MD5 hash of media |
| `uid` | `string` | No | — | 4chan Pass UID |
| `country` | `string` | No | — | 2-letter ISO 3166 country code |
| `deleted` | `string` | No | — | `"deleted"` or `"not-deleted"` |
| `ghost` | `string` | No | — | `"only"` or `"none"` |
| `filter` | `string` | No | — | `"image"` or `"text"` |
| `type` | `string` | No | — | `"sticky"`, `"op"`, or `"posts"` |
| `start` | `string` | No | — | Start date in `YYYY-MM-DD` format |
| `end` | `string` | No | — | End date in `YYYY-MM-DD` format |
| `results` | `string` | No | flat | `"thread"` to group by thread |
| `order` | `string` | No | `"desc"` | `"asc"` or `"desc"` |
| `page` | `number` | No | `1` | Page number (1-indexed, 25 posts per page) |

#### Response Format
**Success:** markdown with heading, summary line, and table of matching posts
**Error:** markdown error message with `**Error:**` prefix

The Board column is always shown, regardless of whether the search targets one board or multiple boards:

```
## Search: "hello world" on /a/

Found 42 of 1,234 matching posts (page 1 of 50, 25 per page)

| Board | Thread | Post | Date | Author | Excerpt |
|-------|--------|------|------|--------|---------|
| /a/ | #112766871 | #112766871 | 2024-01-15 | Anonymous | >hello world this is an example... |
```

When searching multiple or all boards (same format):
```
| Board | Thread | Post | Date | Author | Excerpt |
|-------|--------|------|------|--------|---------|
| /a/ | #112766871 | #112766871 | 2024-01-15 | Anonymous | >hello world this is... |
| /b/ | #112766872 | #112766872 | 2024-01-15 | Anonymous | >reply to thread... |
```

Footer: `*Use \`get_thread\` to view a full thread or \`get_post\` for a single post.*`

#### Scenarios

##### Scenario: Basic text search
- **WHEN** user calls `search_archive` with `text="hello world"` and `boards="a"`
- **THEN** the system SHALL return a markdown table including Board, Thread, Post, Date, Author, and Excerpt columns, with `/a/` shown in the Board column for each row

##### Scenario: Search with date range filter
- **WHEN** user calls `search_archive` with `text="cat"`, `boards="a"`, `start="2024-01-01"`, `end="2024-01-31"`
- **THEN** the system SHALL only return posts within the specified date range

##### Scenario: Search across multiple boards
- **WHEN** user calls `search_archive` with `text="news"` and `boards="adv.trv"`
- **THEN** the system SHALL search across both `adv` and `trv` boards, with board shown in results

##### Scenario: Search across all boards
- **WHEN** user calls `search_archive` with `text="news"` and no `boards` parameter
- **THEN** the system SHALL search across all available boards and include the board column in results

##### Scenario: Pagination
- **WHEN** user calls `search_archive` with `text="cat"` and `page=2`
- **THEN** the system SHALL return posts from page 2 (25 posts per page) and include page info in the summary

##### Scenario: Error body from API
- **WHEN** the API returns HTTP 200 with body `{"error":"Invalid board supplied"}`
- **THEN** the system SHALL return a markdown error: `**Error:** Invalid board supplied`

##### Scenario: Empty search results
- **WHEN** user calls `search_archive` with `text="xyznonexistent12345"`
- **THEN** the system SHALL return: `No posts found matching "xyznonexistent12345".`

##### Scenario: Error on invalid board
- **WHEN** user calls `search_archive` with `boards="nonexistent"`
- **THEN** the system SHALL return a markdown error indicating the board is invalid
