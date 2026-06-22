## ADDED Requirements

### Requirement: Retrieve a single post
The system SHALL provide an MCP tool `get_post` that retrieves a single post by its ID from a FoolFuuka archive.

#### Tool Description
"Retrieve a single post from a 4chan archive by board and post number. Includes post content, author info, timestamps, and media if present."

#### Input Schema
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `board` | `string` | Yes | — | Board shortname, e.g. `"a"` |
| `num` | `string` | Yes | — | Post number. Can include `_` suffix for ghost posts, e.g. `"676_1"` |

#### Response Format
**Success:** markdown with post details
**Error:** markdown error message

```
## Post #112766871 on /a/

**Author:** Anonymous | **Date:** 2024-01-15 14:32:01 UTC
**Board:** /a/ | **Thread:** #112766870

> Post content here...

📎 cat.jpg (250×200, 45 KB)
[View image](https://desu-usergeneratedcontent.xyz/a/.../cat.jpg)
```

When author has tripcode or capcode:
```
**Author:** Name !!tripcode (Mod)
```

When reply has a subject:
```
**Subject:** re: important
```

#### Scenarios

##### Scenario: Get existing post
- **WHEN** user calls `get_post` with `board="a"` and `num="112766871"`
- **THEN** the system SHALL return markdown with post number heading, author, date, board, parent thread link, and content

##### Scenario: Post with file attachment
- **WHEN** user calls `get_post` with `board="a"` and `num="112766871"` and the post has an image
- **THEN** the markdown SHALL include the filename, dimensions, file size, and a clickable link to the image

##### Scenario: Text-only post (no media)
- **WHEN** user calls `get_post` with `board="a"` and `num="12345678"` and the post has no attachment
- **THEN** the markdown SHALL omit the media section entirely

##### Scenario: Ghost post
- **WHEN** user calls `get_post` with `board="a"` and `num="12345_1"`
- **THEN** the system SHALL return the ghost post's content, labeled with `(ghost)` in the heading

##### Scenario: Non-existent post
- **WHEN** user calls `get_post` with `board="a"` and `num="99999999999"`
- **THEN** the system SHALL return: `**Error:** Post not found.`
