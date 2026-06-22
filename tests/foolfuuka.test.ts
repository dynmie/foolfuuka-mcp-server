import { describe, it, expect } from "vitest";
import { parseGhostNum } from "../src/foolfuuka.js";
import { formatTimestamp, formatMediaLine, sanitizeTableCell, formatPostContent, formatAuthorLine, formatHumanSize } from "../src/format.js";
import type { Media, Post } from "../src/types.js";

describe("parseGhostNum", () => {
  it("splits normal post num", () => {
    const result = parseGhostNum("676");
    expect(result).toEqual({ postNum: "676", subnum: "0" });
  });

  it("splits ghost post num", () => {
    const result = parseGhostNum("676_1");
    expect(result).toEqual({ postNum: "676", subnum: "1" });
  });
});

describe("formatTimestamp", () => {
  it("formats Unix timestamp as UTC datetime", () => {
    const ts = 1705329121;
    expect(formatTimestamp(ts)).toBe("2024-01-15 14:32:01 UTC");
  });

  it("formats short version", () => {
    const ts = 1705336321;
    expect(formatTimestamp(ts, true)).toBe("2024-01-15");
  });

  it("handles string timestamp", () => {
    expect(formatTimestamp("1705329121")).toBe("2024-01-15 14:32:01 UTC");
  });
});

describe("sanitizeTableCell", () => {
  it("escapes pipe characters", () => {
    expect(sanitizeTableCell("a | b")).toBe("a \\| b");
  });

  it("strips newlines", () => {
    expect(sanitizeTableCell("hello\nworld")).toBe("hello world");
  });

  it("truncates long text", () => {
    const long = "x".repeat(200);
    const result = sanitizeTableCell(long, 120);
    expect(result.length).toBe(123);
    expect(result.endsWith("...")).toBe(true);
  });

  it("trims whitespace", () => {
    expect(sanitizeTableCell("  hello  ")).toBe("hello");
  });
});

describe("formatPostContent", () => {
  it("prefixes lines with > ", () => {
    expect(formatPostContent("hello\nworld")).toBe("> hello\n> world");
  });

  it("preserves greentext", () => {
    expect(formatPostContent(">>be me\n>be green")).toBe("> >>be me\n> >be green");
  });

  it("returns placeholder for null", () => {
    expect(formatPostContent(null)).toBe("> *[no content]*");
  });

  it("returns placeholder for empty string", () => {
    expect(formatPostContent("")).toBe("> *[no content]*");
  });
});

describe("formatMediaLine", () => {
  const baseMedia: Media = {
    media_id: "1",
    spoiler: "0",
    preview_orig: null,
    media: null,
    preview_op: null,
    preview_reply: null,
    preview_w: null,
    preview_h: null,
    media_filename: "cat.jpg",
    media_w: "250",
    media_h: "200",
    media_size: "254755",
    media_hash: null,
    media_orig: null,
    total: "1",
    banned: "0",
    media_status: "normal",
    remote_media_link: null,
    media_link: "https://example.com/cat.jpg",
    thumb_link: null,
    media_filename_processed: null,
  };

  it("formats media with filename, dimensions, and size", () => {
    const result = formatMediaLine(baseMedia, false);
    expect(result).toBe("📎 cat.jpg (250×200, 249 KB)");
  });

  it("includes URL when requested", () => {
    const result = formatMediaLine(baseMedia, true);
    expect(result).toContain("[View image](https://example.com/cat.jpg)");
  });

  it("returns empty string for null media", () => {
    expect(formatMediaLine(null)).toBe("");
  });

  it("returns empty string when filename is missing", () => {
    const noFile = { ...baseMedia, media_filename: null };
    expect(formatMediaLine(noFile)).toBe("");
  });
});

describe("formatAuthorLine", () => {
  it("shows name only", () => {
    expect(formatAuthorLine("Anonymous", null, "N")).toBe("Anonymous");
  });

  it("shows name with tripcode", () => {
    expect(formatAuthorLine("Name", "trip123", "N")).toBe("Name !!trip123");
  });

  it("shows name with capcode label", () => {
    expect(formatAuthorLine("Admin", null, "A")).toBe("Admin (Admin)");
  });

  it("shows name with tripcode and capcode", () => {
    expect(formatAuthorLine("Mod", "modtrip", "M")).toBe("Mod !!modtrip (Mod)");
  });
});

describe("formatHumanSize", () => {
  it("shows bytes for < 1KB", () => {
    expect(formatHumanSize("500")).toBe("500 B");
  });

  it("shows KB for < 1MB", () => {
    expect(formatHumanSize("254755")).toBe("249 KB");
  });

  it("shows MB for >= 1MB", () => {
    expect(formatHumanSize("2097152")).toBe("2.0 MB");
  });

  it("returns empty for null", () => {
    expect(formatHumanSize(null)).toBe("");
  });
});

describe("error body detection", () => {
  it("detects error key in response body", () => {
    const errBody = { error: "Thread not found." };
    expect("error" in errBody).toBe(true);
    expect(errBody.error).toBe("Thread not found.");
  });
});

describe("numeric field parsing", () => {
  it("parses numeric string", () => {
    expect(Number("216")).toBe(216);
  });

  it("parses string timestamp", () => {
    expect(Number("1782083116")).toBe(1782083116);
  });

  it("handles numeric timestamp", () => {
    expect(Number(1782083116)).toBe(1782083116);
  });
});

describe("nullable media", () => {
  it("post with media has non-null media", () => {
    const post: Post = {
      doc_id: "1",
      num: "123456",
      subnum: "0",
      thread_num: "123456",
      op: "1",
      timestamp: 1705329121,
      capcode: "N",
      email: null,
      name: "Anonymous",
      trip: null,
      title: null,
      comment: null,
      comment_sanitized: "hello",
      comment_processed: "hello",
      poster_hash: null,
      poster_country: null,
      sticky: "0",
      locked: "0",
      deleted: "0",
      nreplies: null,
      nimages: null,
      fourchan_date: "",
      formatted: false,
      media: {
        media_id: "1",
        spoiler: "0",
        preview_orig: null,
        media: null,
        preview_op: null,
        preview_reply: null,
        preview_w: null,
        preview_h: null,
        media_filename: "img.jpg",
        media_w: "100",
        media_h: "100",
        media_size: "1000",
        media_hash: null,
        media_orig: null,
        total: "1",
        banned: "0",
        media_status: "normal",
        remote_media_link: null,
        media_link: null,
        thumb_link: null,
        media_filename_processed: null,
      },
    };
    expect(post.media).not.toBeNull();
    expect(post.media?.media_filename).toBe("img.jpg");
  });

  it("text-only post has null media", () => {
    const post: Post = {
      doc_id: "2",
      num: "123457",
      subnum: "0",
      thread_num: "123456",
      op: "0",
      timestamp: 1705336322,
      capcode: "N",
      email: null,
      name: "Anonymous",
      trip: null,
      title: null,
      comment: null,
      comment_sanitized: "text only",
      comment_processed: "text only",
      poster_hash: null,
      poster_country: null,
      sticky: "0",
      locked: "0",
      deleted: "0",
      nreplies: null,
      nimages: null,
      fourchan_date: "",
      formatted: false,
      media: null,
    };
    expect(post.media).toBeNull();
  });
});
