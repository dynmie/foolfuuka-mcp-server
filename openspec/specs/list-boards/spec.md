## Purpose

List all available boards on the configured 4chan archive.

## Requirements

### Requirement: List available boards
The system SHALL provide an MCP tool `list_boards` that returns all available boards for the configured FoolFuuka archive.

#### Tool Description
"List all available boards on the configured 4chan archive. Returns board shortnames and full names, plus site metadata."

#### Input Schema
No parameters required.

#### Response Format
**Success:** markdown with site name heading and table of boards
**Error:** markdown error message

```
## Desuarchive

Available boards:

| Board | Name |
|-------|------|
| /a/ | Anime & Manga |
| /b/ | Random |
| /pol/ | Politically Incorrect |

*Search enabled on 3 of 3 boards.*
```

#### Implementation
The tool SHALL call `GET /_/api/chan/boards/` and extract the `site` and `boards` sections. The `boards` response is an object keyed by numeric ID; the tool SHALL transform it into a markdown table with `shortname` and `name` fields.

#### Scenarios

##### Scenario: List boards successfully
- **WHEN** user calls `list_boards` with no arguments
- **THEN** the system SHALL return markdown with the site name as a heading and a table of boards (`/shortname/` and full name)

##### Scenario: Boards response includes site metadata
- **WHEN** user calls `list_boards`
- **THEN** the heading SHALL be the site's `name` (e.g. `## Desuarchive`), and the table footer SHALL note search availability

##### Scenario: Error body from API
- **WHEN** the API returns HTTP 200 with `{"error":"..."}`
- **THEN** the system SHALL return: `**Error:** <error message>`

##### Scenario: Archive unreachable
- **WHEN** the archive is unreachable or returns an HTTP error
- **THEN** the system SHALL return: `**Error:** Could not connect to archive at <URL>. Check the FOOLFUUKA_BASE_URL setting.`
