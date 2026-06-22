## Context

`search_archive` outputs a markdown table with columns: Board (multi-board only), Post, Date, Author, Excerpt. Each post's `thread_num` and `op` fields exist in the API response but are not surfaced. LLMs see bare post numbers and cannot distinguish replies from OPs or associate results with their threads.

## Goals / Non-Goals

**Goals:**
- Add a Thread column showing `#thread_num` before the Post column
- Append "(OP)" to Post cells where `post.op === "1"`
- Apply consistently across single-board and multi-board table formats
- Enrich all four tool descriptions with parameter details and return format hints
- Update integration test to match new header

**Non-Goals:**
- No changes to `get_thread`, `get_post`, or `list_boards` output
- No API/schema changes to the search endpoint
- No behavioral changes beyond table formatting

## Decisions

- **Thread column placement**: Before Post — keeps the logical grouping (thread contains post) left-to-right
- **OP marker inline in Post cell**: Simpler than a separate column; avoids widening the table for a binary flag
- **No change to single-board vs multi-board branching**: The existing `isMultiBoard` flag controls header/row construction; just add the Thread column in both paths
- **Description enrichment**: Each tool's description should mention its parameters (what they control) and the output format (markdown table vs structured text) so LLMs can make better tool-selection decisions

## Risks / Trade-offs

- Column width increase may cause wrapping in narrow terminals — acceptable for the clarity gain
- Existing tool-consuming clients that parse exact markdown headers will break — no known clients beyond this server itself
