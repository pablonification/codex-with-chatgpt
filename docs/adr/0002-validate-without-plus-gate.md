# Validation without Plus — automated local gate

Full validation of the C2C Bridge ideally includes a live ChatGPT web Connector flow (create Connector, OAuth pairing, MCP tool calls). Since ChatGPT Free does not expose Connectors reliably, we decided to make the CI gate fully local: `pnpm build && pnpm typecheck && pnpm test` plus a new `scripts/validate-codex.mjs` that exercises `c2c` JSON contracts and MCP/OAuth over loopback, and a PoC MCP client. The live ChatGPT Connector check remains a documented manual step, marked SKIPPED_ON_FREE, rather than a blocking CI requirement.

Alternatives considered: (a) require Plus/Pro for every PR, (b) mock the ChatGPT web UI. We rejected (a) as paywall-gated and (b) as brittle. The local OAuth + MCP loop already proves the same code path ChatGPT will use.
