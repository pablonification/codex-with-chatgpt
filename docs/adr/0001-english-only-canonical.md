# English-only canonical (full cutover)

The repository shipped with bilingual docs, CLI output, and Skill triggers (English + Chinese). We decided to make English the sole canonical language and delete Chinese artifacts (`README.zh-CN.md`, Chinese blocks in `README.md`, Chinese trigger phrases in `skill/SKILL.md`, and all Chinese strings in `src/cli/index.ts` and `docs/troubleshooting.md`).

Alternatives considered: (a) keep bilingual as primary, (b) keep English primary with Chinese aliases, (c) introduce i18n framework. We chose full cutover because the product surface (Codex Skill marketplace, ChatGPT Connector, OAuth/tunnel docs) is English-first, bilingual doubles maintenance and fragments search/indexing, and existing Chinese content is preserved in git history. CLI i18n is deferred as YAGNI (12 strings) until demand is proven.
