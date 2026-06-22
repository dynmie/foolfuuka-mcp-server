import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "child_process";
import { resolve } from "path";

function sendRequest(proc: ChildProcess, method: string, params?: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";

    const onData = (data: Buffer) => {
      try {
        const lines = data.toString().trim().split("\n");
        for (const line of lines) {
          const resp = JSON.parse(line);
          if (resp.id === id) {
            proc.stdout?.off("data", onData);
            resolve(resp);
          }
        }
      } catch { /* incomplete buffer */ }
    };

    const onTimeout = () => {
      proc.stdout?.off("data", onData);
      reject(new Error("Timeout waiting for response"));
    };

    const timer = setTimeout(onTimeout, 10000);
    const originalOnData = onData;
    const wrappedOnData = (data: Buffer) => {
      clearTimeout(timer);
      originalOnData(data);
    };

    proc.stdout?.on("data", wrappedOnData);
    proc.stdin?.write(msg);
  });
}

async function initialize(proc: ChildProcess): Promise<void> {
  const resp = await sendRequest(proc, "initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "test", version: "1.0" },
  });
  expect(resp).toHaveProperty("result");
  await sendRequest(proc, "notifications/initialized");
}

describe("Integration: MCP server", () => {
  let proc: ChildProcess;

  beforeAll(async () => {
    proc = spawn("node", [resolve("dist/index.js")], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, FOOLFUUKA_BASE_URL: "https://desuarchive.org" },
    });

    proc.stderr?.on("data", (data: Buffer) => {
      console.error("[server]", data.toString().trim());
    });

    await initialize(proc);
  }, 15000);

  afterAll(() => {
    proc.kill();
  });

  it("6.4.1 lists 4 tools with descriptions", async () => {
    const resp = await sendRequest(proc, "tools/list");
    const result = (resp as { result: { tools: unknown[] } }).result;
    expect(result.tools).toHaveLength(4);

    const names = result.tools.map((t) => (t as { name: string }).name);
    expect(names).toContain("search_archive");
    expect(names).toContain("get_thread");
    expect(names).toContain("get_post");
    expect(names).toContain("list_boards");

    for (const tool of result.tools) {
      expect(tool).toHaveProperty("description");
      expect(tool).toHaveProperty("inputSchema");
    }
  }, 15000);

  it("6.4.2 list_boards returns markdown with site name and boards table", async () => {
    const resp = await sendRequest(proc, "tools/call", {
      name: "list_boards",
      arguments: {},
    });
    const result = (resp as { result: { content: { text: string }[] } }).result;
    const text = result.content[0].text;

    expect(text).toMatch(/^## .+\n\nAvailable boards:\n\n\| Board \| Name \|/);
    expect(text).toContain("| /a/ | Anime & Manga |");
    expect(text).toContain("| /co/ | Comics & Cartoons |");
    expect(text).toContain("| /tg/ | Traditional Games |");
  }, 30000);

  it("6.4.3 search_archive returns markdown table", async () => {
    const resp = await sendRequest(proc, "tools/call", {
      name: "search_archive",
      arguments: { boards: "a", text: "hello", page: 1 },
    });
    const result = (resp as { result: { content: { text: string }[] } }).result;
    const text = result.content[0].text;

    expect(text).toMatch(/^## Search: "hello" on \/a\//);
    expect(text).toMatch(/\| Thread \| Post \| Date \| Author \| Excerpt \|/);
  }, 30000);

  it("6.4.4 get_post returns markdown post details", async () => {
    const resp = await sendRequest(proc, "tools/call", {
      name: "get_post",
      arguments: { board: "a", num: "112766871" },
    });
    const result = (resp as { result: { content: { text: string }[] } }).result;
    const text = result.content[0].text;

    expect(text).toMatch(/^## Post #112766871 on \/a\//);
    expect(text).toMatch(/\*\*Author:\*\*/);
    expect(text).toMatch(/\*\*Date:\*\*/);
  }, 30000);

  it("6.4.5 get_thread with invalid num returns error", async () => {
    const resp = await sendRequest(proc, "tools/call", {
      name: "get_thread",
      arguments: { board: "a", num: 99999999999 },
    });
    const result = (resp as { result: { content: { text: string }[] } }).result;
    const text = result.content[0].text;

    expect(text).toMatch(/\*\*Error:\*\* Thread not found/);
  }, 30000);
});
