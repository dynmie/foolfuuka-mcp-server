import type {
  SearchResponse,
  ThreadResponse,
  BoardsResponse,
  Post,
  SearchParams,
} from "./types.js";

function getBaseUrl(): string {
  return process.env.FOOLFUUKA_BASE_URL || "https://desuarchive.org";
}

function getUserAgent(): string {
  return process.env.FOOLFUUKA_USER_AGENT || "foolfuuka-mcp-server/1.0";
}

function getBoardsEnv(): string | null {
  const val = process.env.FOOLFUUKA_BOARDS;
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = getBaseUrl().replace(/\/+$/, "");
  const url = new URL(`${base}/_/api/chan${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function apiFetch(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": getUserAgent() },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const msg = retryAfter
      ? `Rate limited. Retry after ${retryAfter} seconds.`
      : "Rate limited. Try again later.";
    throw new Error(msg);
  }

  if (res.status === 204) {
    return null;
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = await res.json() as Record<string, unknown>;
      if (errBody?.error) detail = String(errBody.error);
    } catch { /* ignore parse failures */ }
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }

  const body: unknown = await res.json();

  if (body && typeof body === "object" && "error" in (body as Record<string, unknown>)) {
    throw new Error(String((body as Record<string, string>).error));
  }

  return body;
}

export async function searchPosts(params: SearchParams): Promise<{ posts: Post[]; meta?: { total_found: number; max_results: number } }> {
  const queryParams: Record<string, string | number | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      queryParams[key] = value;
    }
  }

  const url = buildUrl("/search/", queryParams);
  const body = await apiFetch(url) as SearchResponse | null;

  if (!body) return { posts: [], meta: { total_found: 0, max_results: 0 } };

  const posts = body["0"]?.posts ?? [];
  const meta = body.meta
    ? { total_found: body.meta.total_found, max_results: body.meta.max_results }
    : undefined;

  return { posts, meta };
}

export async function getThread(
  board: string,
  num: number,
  latest_doc_id?: number,
  last_limit?: number,
): Promise<{ op: Post; posts: Record<string, Post> }> {
  const url = buildUrl("/thread/", { board, num, latest_doc_id, last_limit });
  const body = await apiFetch(url) as ThreadResponse | null;

  if (!body) return { op: {} as Post, posts: {} };

  const threadKey = String(num);
  const thread = body[threadKey];
  if (!thread) throw new Error("Thread not found.");

  return { op: thread.op, posts: thread.posts };
}

export async function getPost(board: string, num: string): Promise<Post> {
  const url = buildUrl("/post/", { board, num });
  const body = await apiFetch(url) as Post;
  return body;
}

// Hardcoded because desuarchive's /_/api/chan/boards/ returns incomplete/wrong board
// listings. The API still accepts and works with these boards for search/post lookups.
const FOURCHAN_BOARDS: Array<{ shortname: string; name: string }> = [
  { shortname: "a", name: "Anime & Manga" },
  { shortname: "b", name: "Random" },
  { shortname: "c", name: "Anime/Cute" },
  { shortname: "d", name: "Hentai/Alternative" },
  { shortname: "e", name: "Mecha" },
  { shortname: "f", name: "Flash" },
  { shortname: "g", name: "Technology" },
  { shortname: "gif", name: "GIF" },
  { shortname: "h", name: "Hentai" },
  { shortname: "hr", name: "High Resolution" },
  { shortname: "k", name: "Weapons" },
  { shortname: "m", name: "Mecha" },
  { shortname: "o", name: "Auto" },
  { shortname: "p", name: "Photography" },
  { shortname: "s", name: "Sexy Beautiful Women" },
  { shortname: "t", name: "Torrents" },
  { shortname: "u", name: "Yuri" },
  { shortname: "v", name: "Video Games" },
  { shortname: "vg", name: "Video Game Generals" },
  { shortname: "vm", name: "Video Games/Mecha" },
  { shortname: "vmg", name: "Video Games/Mobile" },
  { shortname: "vr", name: "Retro Games" },
  { shortname: "vrpg", name: "Video Games/RPG" },
  { shortname: "vst", name: "Video Games/Strategy" },
  { shortname: "w", name: "Wallpapers" },
  { shortname: "wg", name: "Wallpapers/General" },
  { shortname: "i", name: "Oekaki" },
  { shortname: "ic", name: "Artwork/Critique" },
  { shortname: "r9k", name: "ROBOT9001" },
  { shortname: "s4s", name: "Shit 4chan Says" },
  { shortname: "vip", name: "Very Important Posts" },
  { shortname: "cm", name: "Cute/Male" },
  { shortname: "hm", name: "Handsome Men" },
  { shortname: "lgbt", name: "LGBT" },
  { shortname: "y", name: "Yaoi" },
  { shortname: "3", name: "3DCG" },
  { shortname: "aco", name: "Adult Cartoons" },
  { shortname: "adv", name: "Advice" },
  { shortname: "an", name: "Animals & Nature" },
  { shortname: "bant", name: "Banned" },
  { shortname: "biz", name: "Business & Finance" },
  { shortname: "cgl", name: "Cosplay & EGL" },
  { shortname: "ck", name: "Food & Cooking" },
  { shortname: "co", name: "Comics & Cartoons" },
  { shortname: "diy", name: "Do It Yourself" },
  { shortname: "fa", name: "Fashion" },
  { shortname: "fit", name: "Fitness" },
  { shortname: "gd", name: "Graphic Design" },
  { shortname: "hc", name: "Hardcore" },
  { shortname: "his", name: "History & Humanities" },
  { shortname: "int", name: "International" },
  { shortname: "jp", name: "Otaku Culture" },
  { shortname: "lit", name: "Literature" },
  { shortname: "mlp", name: "My Little Pony" },
  { shortname: "mu", name: "Music" },
  { shortname: "n", name: "Transportation" },
  { shortname: "news", name: "Current News" },
  { shortname: "out", name: "Outdoors" },
  { shortname: "po", name: "Papercraft & Origami" },
  { shortname: "pol", name: "Politically Incorrect" },
  { shortname: "pw", name: "Professional Wrestling" },
  { shortname: "qst", name: "Quest" },
  { shortname: "sci", name: "Science & Math" },
  { shortname: "soc", name: "Social" },
  { shortname: "sp", name: "Sports" },
  { shortname: "tg", name: "Traditional Games" },
  { shortname: "toy", name: "Toys" },
  { shortname: "trv", name: "Travel" },
  { shortname: "tv", name: "Television & Film" },
  { shortname: "vp", name: "Veteran Posts" },
  { shortname: "vt", name: "Virtual YouTubers" },
  { shortname: "wsg", name: "Worksafe GIF" },
  { shortname: "wsr", name: "Worksafe Requests" },
  { shortname: "x", name: "Paranormal" },
  { shortname: "xs", name: "Extreme Sports" },
];

const DESUARCHIVE_BOARDS = [
  "a", "aco", "an", "c", "cgl", "co", "d", "fit", "g", "his",
  "int", "k", "m", "mlp", "mu", "q", "qa", "r9k", "tg", "trash", "vr", "wsg",
];

function isDesuArchive(): boolean {
  return getBaseUrl().includes("desuarchive.org");
}

function parseBoardsEnvVar(): string[] | null {
  const raw = getBoardsEnv();
  if (!raw) return null;
  const boards = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return boards.length > 0 ? [...new Set(boards)] : null;
}

function resolveBoards(
  shortnames: string[],
): Array<{ shortname: string; name: string; search_enabled: boolean }> {
  const lookup = new Map(FOURCHAN_BOARDS.map((b) => [b.shortname, b.name]));
  return shortnames.map((s) => ({
    shortname: s,
    name: lookup.get(s) ?? s,
    search_enabled: true,
  }));
}

export async function listBoards(): Promise<{
  site: { url: string; name: string; title: string; global_search_enabled: boolean };
  boards: Array<{ shortname: string; name: string; search_enabled: boolean }>;
}> {
  // 1. Env var override takes highest priority
  const envBoards = parseBoardsEnvVar();
  if (envBoards) {
    let site: { url: string; name: string; title: string; global_search_enabled: boolean };
    try {
      const url = buildUrl("/boards/");
      const body = await apiFetch(url) as BoardsResponse;
      site = body.site ?? { url: getBaseUrl(), name: "4chan", title: "4chan", global_search_enabled: true };
    } catch {
      site = { url: getBaseUrl(), name: "4chan", title: "4chan", global_search_enabled: true };
    }
    return { site, boards: resolveBoards(envBoards) };
  }

  // 2. Desuarchive default subset
  if (isDesuArchive()) {
    let site: { url: string; name: string; title: string; global_search_enabled: boolean };
    try {
      const url = buildUrl("/boards/");
      const body = await apiFetch(url) as BoardsResponse;
      site = body.site ?? { url: getBaseUrl(), name: "Desuarchive", title: "Desuarchive", global_search_enabled: true };
    } catch {
      site = { url: getBaseUrl(), name: "Desuarchive", title: "Desuarchive", global_search_enabled: true };
    }
    return { site, boards: resolveBoards(DESUARCHIVE_BOARDS) };
  }

  // 3. Non-desuarchive: try API, fall back to full hardcoded list
  try {
    const url = buildUrl("/boards/");
    const body = await apiFetch(url) as BoardsResponse;
    const site = body.site ?? { url: getBaseUrl(), name: "4chan", title: "4chan", global_search_enabled: true };

    if (body?.boards && typeof body.boards === "object") {
      const apiBoards = Object.values(body.boards).map((b) => ({
        shortname: b.shortname,
        name: b.name,
        search_enabled: true,
      }));
      if (apiBoards.length > 0) {
        return { site, boards: apiBoards };
      }
    }

    return { site, boards: resolveBoards(FOURCHAN_BOARDS.map((b) => b.shortname)) };
  } catch {
    return {
      site: { url: getBaseUrl(), name: "4chan", title: "4chan", global_search_enabled: true },
      boards: resolveBoards(FOURCHAN_BOARDS.map((b) => b.shortname)),
    };
  }
}

export function parseGhostNum(num: string): { postNum: string; subnum: string } {
  const parts = num.split("_");
  return { postNum: parts[0], subnum: parts[1] || "0" };
}
