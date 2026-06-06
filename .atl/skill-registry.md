# Skill Registry

**Delegator use only.** Sub-agents do NOT read this file — they receive pre-resolved compact rules injected into their launch prompts.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Cloudflare Workers, Wrangler, Durable Objects | cloudflare | `~/.config/opencode/skills/cloudflare/SKILL.md` |
| wrangler commands, deploy, dev | wrangler | `~/.config/opencode/skills/wrangler/SKILL.md` |
| Workers best practices, patterns | workers-best-practices | `~/.config/opencode/skills/workers-best-practices/SKILL.md` |
| Durable Objects, DO, storage | durable-objects | `~/.config/opencode/skills/durable-objects/SKILL.md` |
| Web performance, Core Web Vitals | web-perf | `~/.config/opencode/skills/web-perf/SKILL.md` |
| Cloudflare Email, email routing | cloudflare-email-service | `~/.config/opencode/skills/cloudflare-email-service/SKILL.md` |
| Turnstile, CAPTCHA | turnstile-spin | `~/.config/opencode/skills/turnstile-spin/SKILL.md` |
| Agent SDK, AI agents | agents-sdk | `~/.config/opencode/skills/agents-sdk/SKILL.md` |
| Sandbox SDK, Workers AI | sandbox-sdk | `~/.config/opencode/skills/sandbox-sdk/SKILL.md` |
| Go tests, Bubbletea TUI testing | go-testing | `~/.config/opencode/skills/go-testing/SKILL.md` |
| Creating new AI skills | skill-creator | `~/.config/opencode/skills/skill-creator/SKILL.md` |
| Creating pull requests | branch-pr | `~/.config/opencode/skills/branch-pr/SKILL.md` |
| Creating GitHub issues | issue-creation | `~/.config/opencode/skills/issue-creation/SKILL.md` |
| Adversarial code review | judgment-day | `~/.config/opencode/skills/judgment-day/SKILL.md` |

## Compact Rules

### cloudflare
- Use `caches.open()` for cache API, not `fetch` cache
- `context.waitUntil()` for background tasks after response
- Export default `{ fetch }` for Workers, `{ scheduled }` for Cron Triggers
- Max 128 fetch calls per request chain (Tail Workers count separately)
- Use `Headers` constructor, not plain objects
- Environment variables via `env.BINDING` in module syntax

### wrangler
- `wrangler dev --remote` to test with real resources (not local)
- `wrangler deploy` to deploy, `wrangler publish` also works (deprecated alias)
- `wrangler secret put KEY` for secrets — never hardcode
- `wrangler.toml` at project root, `main = "src/index.js"` for module syntax

### go-testing
- Use `testing.T` helpers: `t.Run("name", fn)` for sub-tests
- Golden files in `testdata/` for expected output
- Bubbletea: use `teatest.NewModel` and `teatest.WaitFor(t, timeout, condition)`
- Table-driven tests: `tests := []struct{ ... }` with named cases
- Use `t.Cleanup()` for resource cleanup, not defer

### judgment-day
- Launches TWO independent blind judge agents to review same target
- Each judge reviews: architecture, correctness, patterns, edge cases, testing
- Synthesizes findings, applies fixes, re-judges until both pass (max 2 iterations)
- Escalates if consensus not reached after 2 iterations

### skill-creator
- SKILL.md in a dedicated directory (skill name as dir name)
- Frontmatter: name, description (with Trigger: line), directory
- Structure: Purpose → What to Do (numbered steps) → Rules (actionable)
- Include concrete examples in steps, not abstract descriptions
- Add `_examples/` dir for real-world example invocations when relevant

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| (none yet) | — | New project — no conventions defined |

## Project Context

**Intended Stack**: Next.js + Supabase (typed SQL + RLS) + Groq API (AI) + Web Speech API (TTS) + Free Dictionary API (phonetics)

**Target Users**: Children 6-10 years old learning English (Spanish native speakers)

**Budget**: Zero — all services on free tier

**Visual Identity**: Academy/school/wizard theme with child-friendly UI (to be defined in Change 1)
