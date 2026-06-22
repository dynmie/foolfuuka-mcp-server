## MODIFIED Requirements

### Requirement: Full-text search across archived posts

The system SHALL provide an MCP tool `search_archive` that performs full-text search across a FoolFuuka archive's indexed posts.

#### Tool Description
"Full-text search across archived 4chan posts. Filter by board, text, date range, file type, and more. Returns matching posts with excerpts and metadata."

#### Input Schema
No change from main spec.

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

When searching multiple or all boards:
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

##### Scenario: Search across multiple boards
- **WHEN** user calls `search_archive` with `text="news"` and `boards="adv.trv"`
- **THEN** the system SHALL search across both `adv` and `trv` boards, with board shown in results

##### Scenario: Search across all boards
- **WHEN** user calls `search_archive` with `text="news"` and no `boards` parameter
- **THEN** the system SHALL search across all available boards and include the board column in results
