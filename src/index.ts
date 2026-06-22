#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  searchPosts,
  getThread,
  getPost,
  listBoards,
} from "./foolfuuka.js";
import {
  formatSuccess,
  formatError,
  sanitizeTableCell,
  formatPostContent,
  formatMediaLine,
  formatTimestamp,
  formatAuthorLine,
  formatPostMeta,
} from "./format.js";

const server = new McpServer(
  { name: "foolfuuka-mcp-server", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.registerTool("search_archive", {
  description: "Full-text search across archived 4chan posts. Parameters: text (comment search), boards (dot-delimited, e.g. \"a\" or \"adv.trv\"), subject, username, tripcode, capcode, filename, image (MD5 hash), uid, country, deleted, ghost, filter (image/text), type (sticky/op/posts), start/end (YYYY-MM-DD), results (thread to group), order (asc/desc), page. Returns a markdown table with Board, Thread, Post, Date, Author, Excerpt columns.",
  inputSchema: {
    text: z.string().optional().describe("Comment text to search for"),
    boards: z.string().optional().describe("Dot-delimited board shortnames, e.g. \"a\" or \"adv.trv\". Omit to search all boards"),
    subject: z.string().optional().describe("OP subject line search"),
    username: z.string().optional().describe("Poster name match"),
    tripcode: z.string().optional().describe("Tripcode match"),
    capcode: z.string().optional().describe("One of: user, mod, admin, dev, manager, founder"),
    filename: z.string().optional().describe("Original filename search"),
    image: z.string().optional().describe("Base64 MD5 hash of media"),
    uid: z.string().optional().describe("4chan Pass UID"),
    country: z.string().optional().describe("2-letter ISO 3166 country code"),
    deleted: z.string().optional().describe("deleted or not-deleted"),
    ghost: z.string().optional().describe("only or none"),
    filter: z.string().optional().describe("image or text"),
    type: z.string().optional().describe("sticky, op, or posts"),
    start: z.string().optional().describe("Start date in YYYY-MM-DD format"),
    end: z.string().optional().describe("End date in YYYY-MM-DD format"),
    results: z.string().optional().describe("thread to group by thread, otherwise flat"),
    order: z.string().default("desc").describe("asc or desc"),
    page: z.number().default(1).describe("Page number (1-indexed, 25 posts per page)"),
  },
}, async (args) => {
  try {
    const result = await searchPosts(args);
    if (result.posts.length === 0) {
      return formatSuccess(`No posts found matching "${args.text ?? ""}".`);
    }

    const isMultiBoard = !args.boards || args.boards.includes(".");
    const totalFound = result.meta?.total_found ?? result.posts.length;
    const maxResults = result.meta?.max_results ?? 0;
    const totalPages = maxResults > 0 ? Math.ceil(maxResults / 25) : 1;

    let md = `## Search: "${args.text ?? ""}"${args.boards ? ` on /${args.boards}/` : " (all boards)"}\n\n`;
    md += `Found ${result.posts.length} of ${totalFound.toLocaleString()} matching posts (page ${args.page} of ${totalPages}, 25 per page)\n\n`;

    if (isMultiBoard) {
      md += "| Board | Thread | Post | Date | Author | Excerpt |\n|-------|--------|------|------|--------|---------|\n";
    } else {
      md += "| Thread | Post | Date | Author | Excerpt |\n|--------|------|------|--------|---------|\n";
    }

    for (const post of result.posts) {
      const boardShort = post.board?.shortname ? `/${post.board.shortname}/` : "";
      const excerpt = sanitizeTableCell(post.comment_sanitized || "");
      const date = formatTimestamp(post.timestamp, true);
      const author = sanitizeTableCell(post.name, 40);
      const postDisplay = `#${post.num}${post.op === "1" ? " (OP)" : ""}`;
      const threadDisplay = `#${post.thread_num}`;
      if (isMultiBoard) {
        md += `| ${boardShort} | ${threadDisplay} | ${postDisplay} | ${date} | ${author} | ${excerpt} |\n`;
      } else {
        md += `| ${threadDisplay} | ${postDisplay} | ${date} | ${author} | ${excerpt} |\n`;
      }
    }

    md += `\n*Use \`get_thread\` to view a full thread or \`get_post\` for a single post.*`;
    return formatSuccess(md);
  } catch (err) {
    return formatError(err instanceof Error ? err.message : String(err));
  }
});

server.registerTool("get_thread", {
  description: "Retrieve all posts in a thread from a 4chan archive. Parameters: board (shortname), num (thread OP post number), latest_doc_id (incremental fetch, returns only newer posts), last_limit (max posts to return, default 100, pass 0 for all). Returns formatted thread with OP and replies including author, timestamp, subject, content, and media attachments.",
  inputSchema: {
    board: z.string().describe("Board shortname, e.g. \"a\""),
    num: z.number().describe("Thread OP post number"),
    latest_doc_id: z.number().optional().describe("For incremental fetch; returns only posts after this internal doc_id"),
    last_limit: z.number().default(100).describe("Only return the last N posts. Default 100. Pass 0 for all."),
  },
}, async (args) => {
  try {
    const { op, posts } = await getThread(args.board, args.num, args.latest_doc_id, args.last_limit);
    const postEntries = Object.entries(posts);

    let md = `## Thread #${args.num} on /${args.board}/\n\n`;

    if (args.latest_doc_id) {
      md += `Showing ${postEntries.length} new posts since doc_id ${args.latest_doc_id}\n\n`;
    } else if (args.last_limit > 0) {
      md += `Showing last ${Math.min(args.last_limit, postEntries.length)} of ${postEntries.length} posts\n\n`;
    }

    const postToMd = (post: typeof op, isOp: boolean) => {
      const ghost = post.subnum !== "0" ? " (ghost)" : "";
      const lineStart = isOp ? "**OP**" : `**#${post.num}**${ghost}`;
      md += `${lineStart} by ${formatAuthorLine(post.name, post.trip, post.capcode)} — ${formatTimestamp(post.timestamp)}\n`;
      for (const meta of formatPostMeta(post)) {
        md += `${meta}\n`;
      }
      md += `${formatPostContent(post.comment_sanitized)}\n`;
      const mediaLine = formatMediaLine(post.media, false);
      if (mediaLine) md += `${mediaLine}\n`;
    };

    postToMd(op, true);
    md += `\n---\n\n`;
    for (const [, post] of postEntries) {
      postToMd(post, false);
      md += `\n---\n\n`;
    }

    return formatSuccess(md.trim());
  } catch (err) {
    return formatError(err instanceof Error ? err.message : String(err));
  }
});

server.registerTool("get_post", {
  description: "Retrieve a single post from a 4chan archive by board and post number. Parameters: board (shortname), num (post number, can include _ suffix for ghost posts, e.g. \"676_1\"). Returns post details including author, date, board, thread number, subject, content, and media (filename, dimensions, size) with image link.",
  inputSchema: {
    board: z.string().describe("Board shortname, e.g. \"a\""),
    num: z.string().describe("Post number. Can include _ suffix for ghost posts, e.g. \"676_1\""),
  },
}, async (args) => {
  try {
    const post = await getPost(args.board, args.num);

    const ghost = post.subnum !== "0" ? " (ghost)" : "";
    let md = `## Post #${args.num}${ghost} on /${args.board}/\n\n`;
    md += `**Author:** ${formatAuthorLine(post.name, post.trip, post.capcode)} | **Date:** ${formatTimestamp(post.timestamp)}\n`;
    md += `**Board:** /${args.board}/ | **Thread:** #${post.thread_num}\n`;
    for (const meta of formatPostMeta(post)) {
      md += `${meta}\n`;
    }
    md += `\n${formatPostContent(post.comment_sanitized)}\n`;
    const mediaLine = formatMediaLine(post.media, true);
    if (mediaLine) md += `\n${mediaLine}\n`;

    return formatSuccess(md.trim());
  } catch (err) {
    return formatError(err instanceof Error ? err.message : String(err));
  }
});

server.registerTool("list_boards", {
  description: "List all available boards on the configured 4chan archive. No parameters required. Returns a markdown table with Board and Name columns, plus site name and search-enabled board count.",
  inputSchema: {},
}, async () => {
  try {
    const { site, boards } = await listBoards();

    let md = `## ${site.name}\n\nAvailable boards:\n\n`;
    md += "| Board | Name |\n|-------|------|\n";
    for (const b of boards) {
      md += `| /${b.shortname}/ | ${b.name} |\n`;
    }

    const searchEnabled = boards.filter((b) => b.search_enabled).length;
    md += `\n*Search enabled on ${searchEnabled} of ${boards.length} boards.*`;
    return formatSuccess(md);
  } catch (err) {
    return formatError(err instanceof Error ? err.message : String(err));
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
