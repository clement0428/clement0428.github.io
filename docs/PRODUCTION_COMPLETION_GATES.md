# Production Completion Gates

These gates override casual wording. Do not say "done" for WeGrow Orbit UI work unless the matching production state has been verified.

## Completion States

- 已本機完成: code or local artifact is ready, production not touched.
- 已推 Git: commit is pushed to `origin/main`, production may still be stale.
- 已部署到 production: GitHub Pages deployment is complete and `wegrow-orbit.com` serves the new bundle/build metadata.
- 已在你的 production 畫面驗證可見: Browser has verified the production DOM and screenshot evidence exists.

## Required Gates

O1 Production 可見性閘門:
For `/#!/analysis` or `/#/analysis` work, verify the real production DOM contains the target text `AI 驅動智慧溫室：耕譯決策島` or the agreed sentinel. If it is not visible in production, report only up to "已部署到 production".

O2 畫面版本章:
Every production page must show `build: <commit> / deployed_at: <timestamp>` via `data-testid="wegrow-build-stamp"`.

O3 部署狀態拆分:
Report frontend and photo storage separately:
`frontend bundle deployed: pass/fail`
`photo storage check: pass/fail`
Photo storage failure must not hide frontend deployment status.

O4 強制更新提示:
If the browser is on an old build and `build-meta.js` shows a newer commit, show `偵測到新版，請重新載入` and a `重新載入新版` button.

O5 截圖證據:
For UI changes, final evidence must include production URL, target text/sentinel check result, screenshot, and commit hash. Without screenshot, say "已推送" or "已部署", not "可見".

O6 視覺 Sentinel 測試:
Important UI blocks must have stable sentinels such as `data-testid="kengyi-decision-island"`. Tests should prefer sentinels over fuzzy text.

O7 完成定義:
Use one of the four completion states above. Avoid generic "做好了" unless it is immediately followed by the exact verified state.

