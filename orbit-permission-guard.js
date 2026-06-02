(() => {
  const CONTROL_HASH = "#/cultivation/control";
  const ALLOW_ROLE_RE = /(\u7ba1\u7406\u8005|super\s*admin|admin|env_control|\u74b0\u63a7|\u74b0\u5883\u63a7\u5236|\u74b0\u5883\u5236\u5fa1)/i;
  const DENY_ROLE_RE = /(viewer|logger|finance|\u67e5\u770b|\u89c0\u770b|\u8a18\u9304|\u8ca1\u52d9|\u95b2\u89a7|\u8a18\u9332|\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19)/i;
  document.documentElement.setAttribute("data-orbit-permission-guard-active", "env-control-v1");
  const clean = (text) => (text || "").replace(/\s+/g, " ").trim();

  const getHeaderRoleText = () => {
    const header = document.querySelector(".header-right, .app-header, header");
    return clean(header && header.textContent);
  };

  const canUseControl = () => {
    const roleText = getHeaderRoleText();
    if (!roleText) return null;
    if (ALLOW_ROLE_RE.test(roleText)) return true;
    if (DENY_ROLE_RE.test(roleText)) return false;
    return false;
  };

  const hideControlNav = () => {
    const allowed = canUseControl();
    document.querySelectorAll(".nav-item, a, button, [role='menuitem']").forEach((node) => {
      const text = clean(node.textContent);
      const href = node.getAttribute && (node.getAttribute("href") || node.getAttribute("to") || "");
      const isControl = text === "\u74b0\u63a7\u8a2d\u7f6e" || text === "\u74b0\u5883\u5236\u5fa1" || /cultivation\/control/.test(href);
      if (!isControl) return;
      node.setAttribute("data-orbit-permission-target", "env-control");
      if (allowed === false) {
        node.setAttribute("data-orbit-permission-hidden", "true");
        node.style.display = "none";
      } else if (allowed === true) {
        node.removeAttribute("data-orbit-permission-hidden");
        node.style.display = "";
      }
    });
  };

  const guardControlRoute = () => {
    const allowed = canUseControl();
    hideControlNav();
    if (allowed === false && location.hash.startsWith(CONTROL_HASH)) {
      location.hash = "#/monitoring";
    }
  };

  window.__orbitPermissionGuard = { canUseControl, guardControlRoute };
  window.addEventListener("hashchange", guardControlRoute);

  const start = () => {
    guardControlRoute();
    new MutationObserver(guardControlRoute).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  };

  if (document.body) {
    start();
  } else {
    window.addEventListener("DOMContentLoaded", start);
  }
})();
