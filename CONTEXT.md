# Codex with ChatGPT Bridge

Single-context project that bridges the ChatGPT web UI and the local Codex harness so reasoning and execution stay separate but coordinated.

## Language

### Core

**Workspace**: The local project directory Codex edits and runs. One C2C Bridge instance is bound to exactly one Workspace via its canonical root path.
_Avoid_: project, repo, folder, checkout (when meaning the user's working directory)

**C2C Bridge**: Loopback-only HTTP server that hosts the read-only MCP server, OAuth authorization server, pairing manager, and tunnel manager for a single Workspace.
_Avoid_: server, backend, proxy, bridge (without C2C qualifier in docs)

**Control plane**: Tiny structured `[C2C]` messages (`INIT → PLAN → EXECUTED → REVIEW → DONE`) exchanged between Codex and ChatGPT through the ChatGPT web UI (Computer Use). Never carries file bodies, diffs, or logs.
_Avoid_: chat message, prompt, instruction (when meaning the protocol message)

**Data plane**: ChatGPT pulling exactly the lines it needs itself through the 8 read-only MCP tools over HTTPS.
_Avoid_: file upload, context injection, paste

**Pairing Code**: One-time CSPRNG credential (8 chars, ~40 bits, 5-minute TTL, 5 attempts, rate-limited) that bootstraps OAuth without exposing long-lived tokens to the browser.
_Avoid_: API key, password, token (when meaning the one-time code)

**Connector**: The MCP client configuration inside the ChatGPT web UI (name, Server URL, OAuth). The endpoint ChatGPT calls is the Bridge's `/mcp` via the tunnel.
_Avoid_: plugin, app, integration (when meaning the MCP connector)

### Hosts & Actors

**ChatGPT web**: The official ChatGPT web UI at chatgpt.com where the Connector is configured and control-plane messages are exchanged.
_Avoid_: ChatGPT app, ChatGPT API, ChatGPT model (when meaning the web host)

**Codex harness**: The local coding agent that owns execution — editing files, running shell/tests, managing git — and drives the C2C protocol.
_Avoid_: Codex app (when meaning the harness), agent (ambiguous)

**Tunnel**: The public HTTPS surface that exposes the loopback Bridge securely (currently Cloudflare Quick Tunnel). The URL alone grants nothing without OAuth.
_Avoid_: tunnel URL, public URL (when meaning the provider abstraction)

### Tooling

**c2c CLI**: The `c2c` command that manages the Bridge lifecycle (`setup`, `start`, `status`, `doctor`, `pair`, `unpair`, `record`, `logs`, `stop`).
_Avoid_: c2c bridge (when meaning the CLI), daemon (when meaning the CLI entry point)
