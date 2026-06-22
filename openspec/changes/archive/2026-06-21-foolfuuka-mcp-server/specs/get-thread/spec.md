## ADDED Requirements

### Requirement: Retrieve a complete thread
The system SHALL provide an MCP tool `get_thread` that retrieves all posts in a thread from a FoolFuuka archive.

#### Tool Description
"Retrieve all posts in a thread from a 4chan archive. Returns the OP post and all replies with full content, timestamps, and media attachments."

#### Input Schema
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `board` | `string` | Yes | — | Board shortname, e.g. `"a"` |
| `num` | `number` | Yes | — | Thread OP post number |
| `latest_doc_id` | `number` | No | — | For incremental fetch; returns only posts after this internal doc_id |
| `last_limit` | `number` | No | `100` | Only return the last N posts. Default 100 if omitted (pass `0` to get all) |

#### Response Format
**Success:** markdown with thread OP header, then post-by-post content
**Error:** markdown error message

```
## Thread #288843860 on /a/

**OP** by Anonymous — 2024-01-15 14:32:01 UTC
> Original post content here...
📎 cat.jpg (250×200, 45 KB)

---

**#288843893** by Anonymous — 2024-01-15 14:35:12 UTC
> Reply content...
```

When replies have subject lines:
```
**#288843894** by Anonymous — 2024-01-15 14:36:00 UTC
Subject: re: important
> Reply with subject...
```

When author has a tripcode or non-user capcode:
```
**#288843895** by Name!!tripcode (Mod) — 2024-01-15 14:37:00 UTC
> Moderated reply...
```

#### Scenarios

##### Scenario: Get existing thread
- **WHEN** user calls `get_thread` with `board="a"` and `num=112800651`
- **THEN** the system SHALL return markdown with the thread OP post as a heading, followed by each reply with post number, author, timestamp, content, and any media attachments

##### Scenario: Thread response format
- **WHEN** user calls `get_thread` with `board="a"` and `num=288843860`
- **THEN** the markdown SHALL start with `## Thread #288843860 on /a/`, show the OP with content, then list replies separated by `---`

##### Scenario: Thread with ghost posts
- **WHEN** a thread contains ghost posts
- **THEN** ghost posts SHALL be included in the markdown output, labeled as `(ghost)` in the post line

##### Scenario: Non-existent thread
- **WHEN** user calls `get_thread` with `board="a"` and `num=99999999999`
- **THEN** the system SHALL return: `**Error:** Thread not found.`

##### Scenario: Incremental fetch with latest_doc_id
- **WHEN** user calls `get_thread` with `board="a"`, `num=112800651`, and `latest_doc_id=5000`
- **THEN** the system SHALL return only posts after that doc_id, with a summary line: `Showing 3 new posts since doc_id 5000`

##### Scenario: Fetch last N posts
- **WHEN** user calls `get_thread` with `board="a"`, `num=112800651`, and `last_limit=5`
- **THEN** the system SHALL return only the last 5 posts, with a summary: `Showing last 5 of 142 posts`
