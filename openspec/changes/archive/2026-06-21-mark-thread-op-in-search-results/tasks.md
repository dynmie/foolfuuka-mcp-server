## 1. Update Search Results Table Format

- [x] 1.1 Add "Thread" column header before "Post" in both single-board and multi-board table header strings in `src/index.ts`
- [x] 1.2 Add `#thread_num` column value before the Post cell in both table branches
- [x] 1.3 Append "(OP)" to the Post cell value when `post.op === "1"`

## 2. Enrich Tool Descriptions

- [x] 2.1 Update `search_archive` tool description to mention search parameters and markdown table output
- [x] 2.2 Update `get_thread` tool description to mention full thread retrieval and OP/reply format
- [x] 2.3 Update `get_post` tool description to mention single post details and metadata
- [x] 2.4 Update `list_boards` tool description to mention board list table output

## 3. Update Tests

- [x] 3.1 Update integration test 6.4.3 header assertion to expect the new "Thread" column
- [x] 3.2 Run tests to verify the change
