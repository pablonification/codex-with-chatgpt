import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(repoRoot, "bin", "c2c.js");

function run(args: string[], env: Record<string, string>, cwd: string) {
  const r = spawnSync("node", [bin, ...args], { encoding: "utf8", cwd: repoRoot, env: { ...process.env, ...env } });
  return r;
}

describe("CLI --json contract (must remain stable for Codex Skill)", () => {
  const tmp = path.join(repoRoot, ".tooling", "test-tmp", `json-${randomBytes(4).toString("hex")}`);
  const ws = path.join(tmp, "ws");
  const stateDir = path.join(tmp, "state");
  const env: Record<string, string> = {};

  beforeAll(() => {
    fs.mkdirSync(ws, { recursive: true });
    fs.mkdirSync(stateDir, { recursive: true });
    env.C2C_STATE_DIR = stateDir;
    fs.writeFileSync(path.join(ws, "hello.txt"), "hello\n");
    // init git so workspace tools work
    const g = (a: string[]) => spawnSync("git", a, { cwd: ws, env: { ...process.env, GIT_AUTHOR_NAME: "test", GIT_AUTHOR_EMAIL: "test@c2c", GIT_COMMITTER_NAME: "test", GIT_COMMITTER_EMAIL: "test@c2c" } });
    g(["init", "-b", "main"]);
    g(["add", "."]);
    g(["commit", "-m", "init"]);
  });

  afterAll(() => {
    run(["stop", "-w", ws], env, ws);
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  });

  it("c2c setup --json returns stable keys", () => {
    const r = run(["setup", "-w", ws, "--no-tunnel", "--json"], env, ws);
    expect(r.status, r.stderr || r.stdout).toBe(0);
    const j = JSON.parse(r.stdout.trim());
    expect(j.ok).toBe(true);
    for (const k of ["workspaceId", "workspaceName", "mcpUrl", "pairingCode", "pairingExpiresAt"]) {
      expect(j, `missing ${k}`).toHaveProperty(k);
    }
    expect(typeof j.pairingCode).toBe("string");
    expect(j.pairingCode.length).toBeGreaterThanOrEqual(8);
    expect(j.mcpUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/mcp$/);
  });

  it("c2c status --json returns stable shape", () => {
    const r = run(["status", "-w", ws, "--json"], env, ws);
    expect(r.status).toBe(0);
    const j = JSON.parse(r.stdout.trim());
    expect(j.running).toBe(true);
    expect(j).toHaveProperty("port");
    expect(j).toHaveProperty("workspaceId");
    expect(j).toHaveProperty("tunnel");
  });

  it("c2c pair --json returns pairingCode + expiresAt", () => {
    const r = run(["pair", "-w", ws, "--json"], env, ws);
    expect(r.status).toBe(0);
    const j = JSON.parse(r.stdout.trim());
    expect(j.ok).toBe(true);
    expect(j.pairingCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(typeof j.expiresAt).toBe("number");
  });

  it("c2c doctor --json returns report with expected keys", () => {
    const r = run(["doctor", "-w", ws, "--json"], env, ws);
    expect(r.status).toBe(0);
    const j = JSON.parse(r.stdout.trim());
    expect(j.report).toBeDefined();
    for (const k of ["node", "workspace", "bridge", "mcp"]) {
      expect(j.report).toHaveProperty(k);
    }
  });

  it("c2c workspace --json returns workspaceId/name/root", () => {
    const r = run(["workspace", "-w", ws, "--json"], env, ws);
    expect(r.status).toBe(0);
    const j = JSON.parse(r.stdout.trim());
    for (const k of ["workspaceId", "name", "root", "projectType"]) {
      expect(j).toHaveProperty(k);
    }
  });

  it("human output stays English (no CJK) even on success paths", () => {
    const r = run(["status", "-w", ws], env, ws);
    expect(r.stdout).not.toMatch(/[\u4e00-\u9fff]/);
  });

  it("error JSON always has { ok:false, error:string } for invalid workspace", () => {
    const badWs = path.join(tmp, "nope-" + randomBytes(2).toString("hex"));
    const r = run(["pair", "-w", badWs, "--json"], env, ws);
    expect(r.status).not.toBe(0);
    const j = JSON.parse(r.stdout.trim());
    expect(j.ok).toBe(false);
    expect(typeof j.error).toBe("string");
    expect(j.error).not.toMatch(/[\u4e00-\u9fff]/);
  });
});
