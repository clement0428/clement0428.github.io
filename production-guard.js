(function () {
  const build = window.__WEGROW_ORBIT_BUILD__ || { commit: "unknown", deployed_at: "unknown" };
  const GITHUB_BRANCH_API = "https://api.github.com/repos/clement0428/clement0428.github.io/commits/main";
  const STORAGE_KEY = "wegrow_orbit_seen_build";

  function shortCommit(value) {
    return String(value || "unknown").slice(0, 7);
  }

  function injectStyles() {
    if (document.getElementById("wegrow-production-guard-style")) return;
    const style = document.createElement("style");
    style.id = "wegrow-production-guard-style";
    style.textContent = `
      .wegrow-build-stamp {
        position: fixed;
        right: 12px;
        bottom: 10px;
        z-index: 2147483000;
        border: 1px solid rgba(15, 35, 42, 0.18);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.94);
        color: #23343a;
        padding: 5px 8px;
        font: 700 11px/1.35 Consolas, "SFMono-Regular", monospace;
        box-shadow: 0 4px 16px rgba(15, 35, 42, 0.12);
      }
      .wegrow-update-banner {
        position: fixed;
        left: 50%;
        bottom: 44px;
        z-index: 2147483001;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: min(560px, calc(100vw - 24px));
        border: 1px solid #d9c31d;
        border-radius: 8px;
        background: #fff9c8;
        color: #29250a;
        padding: 9px 12px;
        font: 800 14px/1.35 system-ui, -apple-system, "Microsoft JhengHei", sans-serif;
        box-shadow: 0 10px 28px rgba(15, 35, 42, 0.18);
      }
      .wegrow-update-banner button {
        border: 0;
        border-radius: 6px;
        background: #142327;
        color: #fff;
        padding: 7px 10px;
        font: inherit;
        cursor: pointer;
        white-space: nowrap;
      }
      .kengyi-visible-title {
        display: inline-flex;
        align-items: center;
        margin: 0 0 10px;
        border: 1px solid rgba(226, 207, 53, 0.55);
        border-radius: 6px;
        background: rgba(255, 249, 200, 0.92);
        color: #23343a;
        padding: 6px 10px;
        font: 800 14px/1.4 system-ui, -apple-system, "Microsoft JhengHei", sans-serif;
      }
      @media (max-width: 640px) {
        .wegrow-build-stamp {
          right: 8px;
          bottom: 8px;
          font-size: 10px;
        }
        .wegrow-update-banner {
          left: 8px;
          right: 8px;
          bottom: 40px;
          transform: none;
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderBuildStamp() {
    let stamp = document.querySelector("[data-testid='wegrow-build-stamp']");
    if (!stamp) {
      stamp = document.createElement("div");
      stamp.className = "wegrow-build-stamp";
      stamp.setAttribute("data-testid", "wegrow-build-stamp");
      document.body.appendChild(stamp);
    }
    if (stamp.getAttribute("data-build-source") === "github") return;
    stamp.textContent = `build: ${shortCommit(build.commit)} / deployed_at: ${build.deployed_at}`;
    stamp.setAttribute("data-build-commit", build.commit || "unknown");
    stamp.setAttribute("data-build-deployed-at", build.deployed_at || "unknown");
    stamp.setAttribute("data-build-source", "build-meta");
  }

  function renderUpdateBanner(latest) {
    if (document.querySelector("[data-testid='wegrow-update-banner']")) return;
    const banner = document.createElement("div");
    banner.className = "wegrow-update-banner";
    banner.setAttribute("data-testid", "wegrow-update-banner");
    banner.innerHTML = `
      <span>偵測到新版，請重新載入</span>
      <button type="button">重新載入新版</button>
    `;
    banner.textContent = "";
    const message = document.createElement("span");
    message.textContent = "偵測到新版，請重新載入";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "重新載入新版";
    banner.append(message, button);
    banner.querySelector("button").addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEY, latest.commit || "");
      location.reload();
    });
    document.body.appendChild(banner);
  }

  function removeUpdateBanner() {
    document.querySelectorAll("[data-testid='wegrow-update-banner']").forEach((node) => node.remove());
  }

  function markSentinels() {
    document.querySelectorAll("[data-testid='kengyi-decision-workbench']").forEach((node) => {
      node.setAttribute("data-legacy-testid", "kengyi-decision-workbench");
      node.setAttribute("data-testid", "kengyi-decision-island");
      if (!node.querySelector("[data-testid='kengyi-decision-island-title']")) {
        const title = document.createElement("div");
        title.className = "kengyi-visible-title";
        title.setAttribute("data-testid", "kengyi-decision-island-title");
        title.textContent = "AI 驅動智慧溫室：耕譯決策島";
        node.prepend(title);
      }
    });
  }

  async function checkForNewBuild() {
    try {
      const githubResponse = await fetch(`${GITHUB_BRANCH_API}?check=${Date.now()}`, { cache: "no-store" });
      if (githubResponse.ok) {
        const github = await githubResponse.json();
        if (github?.sha) {
          const latestAt = github?.commit?.committer?.date || github?.commit?.author?.date || build.deployed_at;
          const stamp = document.querySelector("[data-testid='wegrow-build-stamp']");
          if (stamp) {
            stamp.textContent = `build: ${shortCommit(github.sha)} / deployed_at: ${latestAt}`;
            stamp.setAttribute("data-build-commit", github.sha);
            stamp.setAttribute("data-build-deployed-at", latestAt);
            stamp.setAttribute("data-build-source", "github");
          }
        }
      }
      const response = await fetch(`/build-meta.js?check=${Date.now()}`, { cache: "no-store" });
      const text = await response.text();
      const match = text.match(/commit:\s*"([^"]+)"/);
      const latestCommit = match ? match[1] : "";
      if (latestCommit && build.commit && latestCommit !== build.commit) {
        renderUpdateBanner({ commit: latestCommit });
      } else {
        removeUpdateBanner();
      }
    } catch {
      // Build refresh hints should never break the app.
    }
  }

  function boot() {
    if (!document.body) return;
    injectStyles();
    removeUpdateBanner();
    renderBuildStamp();
    markSentinels();
    if (build.commit) localStorage.setItem(STORAGE_KEY, build.commit);
  }

  window.addEventListener("DOMContentLoaded", () => {
    boot();
    checkForNewBuild();
    setInterval(checkForNewBuild, 60000);
    new MutationObserver(markSentinels).observe(document.body, { childList: true, subtree: true });
  });
  setTimeout(boot, 800);
})();
