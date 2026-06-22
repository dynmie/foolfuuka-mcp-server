## Context

The `listBoards()` function in `src/foolfuuka.ts:190` currently ignores the API `/boards/` response and always returns a hardcoded list of ~70 4chan boards. The comment on line 110 explains this is because desuarchive's API returns incomplete listings. However, desuarchive only actually mirrors a subset (~22 boards). Users of other archives may also want control over which boards appear.

## Goals / Non-Goals

**Goals:**
- Allow overriding the returned board list via `FOOLFUUKA_BOARDS` env var (comma-separated shortnames)
- When unset and `FOOLFUUKA_BASE_URL` contains `desuarchive.org`, return a curated desuarchive-specific subset
- When unset and base URL is NOT desuarchive, call the API `/boards/` endpoint, falling back to the full hardcoded list

**Non-Goals:**
- Modifying the FoolFuuka API fetching layer itself
- Adding per-board search_enabled logic beyond `true`

## Decisions

1. **Env var name: `FOOLFUUKA_BOARDS`** — consistent with existing `FOOLFUUKA_BASE_URL` and `FOOLFUUKA_USER_AGENT` naming convention.

2. **Desuarchive detection: check if `getBaseUrl()` includes `desuarchive.org`** — simple string containment, matches how the FOOLFUUKA_BASE_URL default and overrides work.

3. **Desuarchive board list: curated subset matching desuarchive's actual mirrors** — `a, aco, an, c, cgl, co, d, fit, g, his, int, k, m, mlp, mu, q, qa, r9k, tg, trash, vr, wsg`. Each shortname is matched against the existing `FOURCHAN_BOARDS` array to get full name/search_enabled data.

4. **Env var format: comma-separated with optional whitespace** — `"a,aco,an"` or `"a, aco, an"`. Trivially split/trimmed.

5. **API fallback retained as last resort** — for non-desuarchive non-override cases, the old behavior (hardcoded list) continues, but we attempt the API first.

## Risks / Trade-offs

- Desuarchive may add/remove boards over time. The hardcoded subset could drift. Mitigation: the env var allows users to override without waiting for a release.
- The API `/boards/` response is documented as unreliable for desuarchive, but may be fine for other archives. We only skip it for desuarchive.
