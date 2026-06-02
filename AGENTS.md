# WeGrow Orbit Deployment Rules

This repo is the production deployment artifact for `wegrow-orbit.com`.

Before starting work, read:

`C:\Users\cowle\Documents\Codex\WeGrow-Orbit-Total-Memory\START_HERE_EVERY_THREAD.md`

Permanent rules:

- Build from `C:\Users\cowle\orbit-src`; do not invent production-only source behavior here.
- Preserve production guard scripts, build stamp, O2+O3 feature flag, and visual sentinels.
- After every push, verify remote main with `git ls-remote origin refs/heads/main`.
- Do not say `已在你的 production 畫面驗證可見` without production DOM checks and screenshot.
- Record deployment mistakes in:

`C:\Users\cowle\Documents\Codex\WeGrow-Orbit-Total-Memory\ERROR_LEDGER.md`
