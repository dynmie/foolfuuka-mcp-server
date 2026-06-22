# Board List Override

## Purpose

Allow users to control which boards appear in `list_boards()` output, with archive-aware defaults for desuarchive.org and fallback to the API for other archives.

## Requirements

### Requirement: Board list override via environment variable

The system SHALL allow users to override the `listBoards()` output by setting `FOOLFUUKA_BOARDS` to a comma-separated list of board shortnames.

#### Scenario: Env var override filters board list
- **WHEN** `FOOLFUUKA_BOARDS` is set to `"a,aco,an"`
- **THEN** `listBoards()` returns exactly three boards: `a`, `aco`, `an` with their full names from the 4chan board mapping

#### Scenario: Env var with whitespace is trimmed
- **WHEN** `FOOLFUUKA_BOARDS` is set to `" a , aco , an "`
- **THEN** whitespace is trimmed and result is identical to `"a,aco,an"`

#### Scenario: Env var board not in 4chan mapping uses shortname as name
- **WHEN** `FOOLFUUKA_BOARDS` includes `"nonexistent"`
- **THEN** the returned board has `shortname: "nonexistent"` and `name: "nonexistent"`

### Requirement: Desuarchive default board subset

When `FOOLFUUKA_BOARDS` is not set and the base URL contains `desuarchive.org`, the system SHALL return a curated subset of boards matching desuarchive's actual mirrors.

#### Scenario: Desuarchive boards returned by default
- **WHEN** `FOOLFUUKA_BASE_URL` is `https://desuarchive.org` (default) and `FOOLFUUKA_BOARDS` is unset
- **THEN** `listBoards()` returns: `a, aco, an, c, cgl, co, d, fit, g, his, int, k, m, mlp, mu, q, qa, r9k, tg, trash, vr, wsg`

#### Scenario: Env var overrides desuarchive default
- **WHEN** `FOOLFUUKA_BASE_URL` is `https://desuarchive.org` and `FOOLFUUKA_BOARDS` is set to `"a,b"`
- **THEN** only boards `a` and `b` are returned (override takes priority)

### Requirement: Non-desuarchive fallback to API

When `FOOLFUUKA_BOARDS` is not set and the base URL is NOT desuarchive.org, the system SHALL attempt the API `/boards/` endpoint, falling back to the full hardcoded 4chan board list.

#### Scenario: Non-desuarchive API success
- **WHEN** `FOOLFUUKA_BASE_URL` is `https://some-other-archive.org` and the API returns boards
- **THEN** `listBoards()` returns the API-provided boards

#### Scenario: Non-desuarchive API failure
- **WHEN** `FOOLFUUKA_BASE_URL` is `https://some-other-archive.org` and the API fails
- **THEN** `listBoards()` falls back to the full hardcoded 4chan board list

### Requirement: All returned boards have search_enabled true

Every board returned by `listBoards()` SHALL have `search_enabled: true`.

#### Scenario: All boards searchable
- **WHEN** `listBoards()` returns boards via any code path
- **THEN** every board entry has `search_enabled: true`
