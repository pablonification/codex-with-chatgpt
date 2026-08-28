import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cjkRe = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

describe("i18n contract — English-only canonical (ADR 0001)", () => {
  it("src/cli/index.ts contains no CJK", () => {
    const text = fs.readFileSync(path.join(repoRoot, "src/cli/index.ts"), "utf8");
    expect(text).not.toMatch(cjkRe);
  });

  it("skill/SKILL.md is English-only and has no Chinese triggers", () => {
    const text = fs.readFileSync(path.join(repoRoot, "skill", "SKILL.md"), "utf8");
    expect(text).not.toMatch(cjkRe);
    // Use unicode escapes so this test file itself stays CJK-free
    expect(text).not.toContain("\u4f7f\u7528 Codex with ChatGPT");
    expect(text).not.toContain("\u7528 ChatGPT \u89c4\u5212");
    expect(text).toContain("Set up Codex with ChatGPT");
    expect(text).toContain("Use Codex with ChatGPT");
  });

  it("docs/troubleshooting.md is English-only", () => {
    const text = fs.readFileSync(path.join(repoRoot, "docs/troubleshooting.md"), "utf8");
    expect(text).not.toMatch(cjkRe);
    expect(text).toContain("Invalid/expired pairing code");
    expect(text).not.toContain("\u914d\u5bf9\u7801");
  });

  it("README.md is English-only and README.zh-CN.md is deleted", () => {
    const text = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
    expect(text).not.toMatch(cjkRe);
    expect(text).not.toContain("\u8be6\u7ec6\u4e2d\u6587\u6587\u6863");
    expect(fs.existsSync(path.join(repoRoot, "README.zh-CN.md"))).toBe(false);
  });

  it("CLI contains required English strings (Q9)", () => {
    const cli = fs.readFileSync(path.join(repoRoot, "src/cli/index.ts"), "utf8");
    for (const s of [
      "Workspace detected",
      "Workspace Bridge started",
      "Secure connection established",
      "Connecting to ChatGPT",
      "Connection URL:",
      "Pairing code:",
      "Bridge not running",
      "Bridge: running",
      "Secure connection:",
      "Authorized connection:",
      "Bridge stopped",
      "No running Bridge",
      "Bridge restarted",
      "Execution summary recorded",
      "Revoked ChatGPT access",
      "No logs yet",
      "Action required:",
      "cloudflared is not installed",
    ]) {
      expect(cli, `missing English string: ${s}`).toContain(s);
    }
  });

  it("CONTEXT.md exists and defines core glossary terms", () => {
    const text = fs.readFileSync(path.join(repoRoot, "CONTEXT.md"), "utf8");
    for (const term of ["**Workspace**", "**C2C Bridge**", "**Control plane**", "**Data plane**", "**Pairing Code**", "**Connector**", "**ChatGPT web**", "**Codex harness**"]) {
      expect(text).toContain(term);
    }
  });
});
