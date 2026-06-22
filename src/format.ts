import type { Post, Media } from "./types.js";

export function formatSuccess(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function formatError(text: string) {
  return { content: [{ type: "text" as const, text: `**Error:** ${text}` }] };
}

export function formatHumanSize(bytes: string | null): string {
  if (!bytes) return "";
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return bytes;
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function formatDimensions(w: string | null, h: string | null): string {
  if (!w || !h) return "";
  return `${parseInt(w, 10)}×${parseInt(h, 10)}`;
}

export function sanitizeTableCell(text: string, maxLen = 120): string {
  const withoutNewlines = text.replace(/\s+/g, " ").trim();
  const truncated = withoutNewlines.length > maxLen
    ? withoutNewlines.slice(0, maxLen) + "..."
    : withoutNewlines;
  return truncated.replace(/\|/g, "\\|");
}

export function formatPostContent(comment: string | null): string {
  if (!comment) return "> *[no content]*";
  return comment
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export function formatMediaLine(media: Media | null, includeUrl = false): string {
  if (!media || !media.media_filename) return "";
  const filename = media.media_filename;
  const dims = formatDimensions(media.media_w, media.media_h);
  const size = formatHumanSize(media.media_size);
  let line = `📎 ${filename} (${dims}${size ? `, ${size}` : ""})`;
  if (includeUrl && media.media_link) {
    line += `\n[View image](${media.media_link})`;
  }
  return line;
}

export function formatTimestamp(ts: number | string, short = false): string {
  const n = typeof ts === "string" ? parseInt(ts, 10) : ts;
  if (isNaN(n)) return String(ts);
  const d = new Date(n * 1000);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  if (short) return `${y}-${mo}-${day}`;
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${mi}:${s} UTC`;
}

const capcodeLabels: Record<string, string> = {
  M: "Mod",
  A: "Admin",
  D: "Developer",
  V: "Verified",
};

export function formatAuthorLine(name: string, trip: string | null, capcode: string): string {
  let result = name;
  if (trip) result += ` !!${trip}`;
  const label = capcodeLabels[capcode];
  if (label) result += ` (${label})`;
  return result;
}

export function formatPostMeta(post: Post): string[] {
  const lines: string[] = [];
  if (post.title) lines.push(`**Subject:** ${post.title}`);
  return lines;
}
