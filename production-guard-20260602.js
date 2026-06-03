(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }
  ready(function () {
    var build = window.__WEGROW_BUILD_META__ || window.__WEGROW_ORBIT_BUILD__ || {};
    var commit = build.commit || "unknown";
    var deployedAt = build.deployed_at || "unknown";
    var stamp = document.createElement("div");
    stamp.setAttribute("data-testid", "wegrow-build-stamp");
    stamp.textContent = "build: " + commit + " / deployed_at: " + deployedAt;
    stamp.style.cssText = "position:fixed;right:14px;bottom:10px;z-index:2147483646;background:rgba(255,255,255,.96);border:1px solid #d7dde2;border-radius:6px;padding:8px 12px;font:700 13px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;color:#1f2933;box-shadow:0 4px 16px rgba(15,23,42,.16);";
    document.body.appendChild(stamp);

    try {
      var key = "wegrow-orbit:last-seen-build";
      var previous = localStorage.getItem(key);
      if (previous && previous !== commit) {
        var banner = document.createElement("div");
        banner.setAttribute("data-testid", "wegrow-update-banner");
        banner.style.cssText = "position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483647;background:#111827;color:white;border-radius:8px;padding:10px 12px;display:flex;gap:10px;align-items:center;font:700 14px/1.2 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.28);";
        var text = document.createElement("span");
        text.textContent = "\u5075\u6e2c\u5230\u65b0\u7248\uff0c\u8acb\u91cd\u65b0\u8f09\u5165";
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = "\u91cd\u65b0\u8f09\u5165\u65b0\u7248";
        button.style.cssText = "border:0;border-radius:6px;background:#e2cf35;color:#1f2933;font-weight:900;padding:7px 10px;cursor:pointer;";
        button.onclick = function () { location.reload(); };
        banner.appendChild(text);
        banner.appendChild(button);
        document.body.appendChild(banner);
      }
      localStorage.setItem(key, commit);
    } catch (err) {}
  });
})();
