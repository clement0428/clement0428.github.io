(() => {
  const API_BASE = "https://api.wegrow-orbit.com";
  const EVENT_LOG_PATH = "/api/ai/event-logs";
  const EMAIL_RECIPIENTS = ["clement0428@gmail.com", "clement@wegrow.asia"];
  const PROPOSAL_KEY = "orbit_kengyi_control_proposals";
  const QUEUE_KEY = "orbit_kengyi_eventlog_queue";
  const BUILD_ID = "control-proposal-tabs";
  const DEPLOYED_AT = "2026-06-01T09:40:00+08:00";

  const activeProposal = {
    id: "kengyi-control-20260601-madou-v7-v10",
    proposal_id: "kengyi-control-20260601-001",
    source: "kengyi",
    event_type: "control_proposal",
    execution_mode: "recommendation_only",
    requires_human_confirmation: true,
    farm_id: localStorage.getItem("orbit_active_farm") || "madou-1",
    farm_name: "麻豆 1 場",
    zone_id: "L1-L21",
    zone_name: "麻豆 1 場 L1-L21 排液區",
    crop_id: "strawberry",
    issue_type: "drain_ec_imbalance",
    issue_summary: "L1-L21 排液 EC 不均，可能造成水肥使用錯配與品質損失",
    priority: "high",
    proposal_status: "pending_confirmation",
    status_flow: ["pending_confirmation", "notified", "rejected", "configured_in_hugreen", "verifying", "validated", "failed"],
    linked_memory_ids: [
      "madou-ec-uneven-root-cause-20260601",
      "madou-fertigation-coupled-risk-20260601"
    ],
    fertigation_context: "clear_water_day_only",
    affected_devices: ["V7", "V8", "V9", "V10"],
    suggested_action: "V7-V10 清水日短脈衝測試。這是人工確認建議，不是 Hugreen 控制指令。",
    suggested_setting: {
      V7: "清水日 5 次/天，每次 1:00，對應 L1-L6",
      V8: "清水日 5 次/天，每次 0:45，對應 L7-L11",
      V9: "清水日 5 次/天，每次 1:20，對應 L12-L16",
      V10: "清水日 5 次/天，每次 1:20，對應 L17-L21"
    },
    no_go_conditions: [
      "11:00 後不做大量灌溉",
      "給肥日不得解讀成單純補水",
      "不可 L1-L21 分開施肥"
    ],
    rollback_plan: "若排液率過高、作物勢下降或 EC 過度稀釋，回復前一版秒數。",
    email_required: true,
    email_recipients: EMAIL_RECIPIENTS,
    verification_due_at: "2026-06-03T08:20:00+08:00",
    validation_metrics: ["排液 EC 收斂", "排液率 15-20%", "Brix", "A級率", "病害率"],
    reason_brief: "只在清水日做短脈衝測試，避免給肥日加水同步增加肥分；先看 V7-V10 是否讓排液 EC 收斂。",
    simple_explanation: "麻豆場 EC 不均不是單點缺水。先在清水日用短脈衝驗證 V7-V10 是否能改善排液 EC 均勻度。",
    validation_plan: {
      next_check: "24-48h 後比對排液 EC、排液率、Brix、A級率與病害率。",
      metrics: ["排液 EC", "排液率", "Brix", "A級率", "病害率"],
      stop_condition: "若排液率過高、作物勢下降或 EC 過度稀釋，回復前一版秒數。"
    },
    sensor_snapshot: readSensorSnapshot(),
    created_at: "2026-06-01T08:20:00+08:00"
  };

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readSensorSnapshot() {
    return {
      active_farm: localStorage.getItem("orbit_active_farm"),
      has_hugreen_token: Boolean(localStorage.getItem("hugreen_token")),
      batches_count: readJson("orbit_batches", []).length,
      captured_at: new Date().toISOString()
    };
  }

  function toast(message) {
    const existing = document.querySelector(".kengyi-mvp-toast");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.className = "kengyi-mvp-toast";
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function isControlPage() {
    const text = document.body?.innerText || "";
    return location.hash.includes("/cultivation/control") || text.includes("\u74b0\u63a7\u8a2d\u7f6e");
  }

  function proposalPayload() {
    return {
      ...activeProposal,
      sensor_snapshot: readSensorSnapshot(),
      email_subject: "WeGrow Orbit \u8015\u8b6f\u74b0\u63a7\u5efa\u8b70\uff1a\u9ebb\u8c46 V7-V10 \u6e05\u6c34\u65e5\u77ed\u8108\u885d\u9a57\u8b49",
      email_body: [
        "Clement \u60a8\u597d\uff0c",
        "",
        "\u8015\u8b6f\u7522\u751f\u4e00\u7b46\u74b0\u63a7\u5efa\u8b70\uff0c\u5c1a\u672a\u63a7\u5236 Hugreen\uff0c\u7b49\u5f85\u4eba\u5de5\u78ba\u8a8d\u3002",
        "",
        "\u5efa\u8b70\uff1a\u6e05\u6c34\u65e5\u5148\u505a V7-V10 \u5206\u5340\u77ed\u8108\u885d\u9a57\u8b49\u3002",
        "\u8a2d\u5b9a\uff1aV7 \u6bcf\u6b211\u5206\u9418\uff1bV8 \u6bcf\u6b2145\u79d2\uff1bV9/V10 \u6bcf\u6b211\u520620\u79d2\uff1b\u6bcf\u59295\u6b21\u3002",
        "\u539f\u56e0\uff1a\u9ebb\u8c46 L1-L21 EC \u4e0d\u5747\u662f\u9762\u72c0\u6c34\u80a5\u554f\u984c\uff0c\u4e0d\u5b9c\u7528\u55ae\u9ede\u88dc\u6c34\u89e3\u91cb\u3002",
        "\u9650\u5236\uff1a\u7d66\u80a5\u65e5\u52a0\u6c34\u7b49\u65bc\u52a0\u80a5\uff1b11:00 \u5f8c\u4e0d\u5927\u91cf\u704c\u6e89\u3002",
        "\u9a57\u8b49\uff1a\u4e0b\u4e00\u6b21\u6392\u6db2 EC\u3001\u6392\u6db2\u7387\u3001VPD\u3001\u571f\u6eab\u3001\u5149\u7167\u8207\u65bd\u80a5\u65e5\u72c0\u614b\u3002",
        "",
        "\u6536\u4ef6\u4eba\uff1aclement0428@gmail.com, clement@wegrow.asia"
      ].join("\n")
    };
  }

  function saveLocalProposal(status = "pending_confirmation") {
    const proposals = readJson(PROPOSAL_KEY, []);
    const payload = { ...proposalPayload(), proposal_status: status, status_updated_at: new Date().toISOString() };
    const next = [payload, ...proposals.filter((item) => item.id !== payload.id)].slice(0, 50);
    writeJson(PROPOSAL_KEY, next);
    return payload;
  }

  async function postEventLog() {
    const payload = saveLocalProposal("notified");
    const token = localStorage.getItem("orbit_token");
    if (!token || token.startsWith("demo-token-")) {
      queueEventLog(payload, "missing_or_demo_token");
      toast("\u5df2\u5148\u5b58\u6210\u672c\u6a5f\u8015\u8b6f\u5019\u9078\u3002\u5c1a\u672a\u767b\u5165\u6b63\u5f0f Orbit\uff0c\u7121\u6cd5\u5beb\u5165\u5f8c\u7aef\u3002");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}${EVENT_LOG_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      toast("\u5df2\u5beb\u5165 operation_event_logs\uff0c\u4e26\u9644\u4e0a email \u63d0\u9192\u9700\u6c42\u3002");
      return true;
    } catch (error) {
      queueEventLog(payload, error.message);
      toast("\u5f8c\u7aef\u66ab\u6642\u7121\u6cd5\u5beb\u5165\uff0c\u5df2\u6392\u5165\u672c\u6a5f\u4f47\u5217\u3002");
      return false;
    }
  }

  function queueEventLog(payload, reason) {
    const queue = readJson(QUEUE_KEY, []);
    writeJson(QUEUE_KEY, [
      { payload, reason, queued_at: new Date().toISOString() },
      ...queue
    ].slice(0, 50));
  }

  async function copySuggestion() {
    const payload = proposalPayload();
    const text = [
      "\u8015\u8b6f\u74b0\u63a7\u5efa\u8b70",
      "",
      payload.suggested_action,
      "",
      "\u5efa\u8b70\u8a2d\u5b9a\uff1a",
      ...Object.entries(payload.suggested_setting).map(([key, value]) => `${key}: ${value}`),
      "",
      `\u539f\u56e0\uff1a${payload.simple_explanation}`,
      "",
      `\u63d0\u9192\u6536\u4ef6\u4eba\uff1a${EMAIL_RECIPIENTS.join(", ")}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      toast("\u5df2\u8907\u88fd\u5efa\u8b70\uff0c\u53ef\u8cbc\u5230 Hugreen APP \u6216 email\u3002");
    } catch {
      toast("\u700f\u89bd\u5668\u4e0d\u5141\u8a31\u8907\u88fd\uff0c\u8acb\u624b\u52d5\u9078\u53d6\u5efa\u8b70\u6587\u5b57\u3002");
    }
  }

  function renderPanel() {
    if (!isControlPage() || document.querySelector(".kengyi-mvp-system")) return;
    const target =
      document.querySelector(".page-header") ||
      document.querySelector(".farms-page") ||
      document.querySelector("#app");
    if (!target || !target.parentNode) return;

    const panel = document.createElement("section");
    panel.className = "kengyi-mvp-system";
    panel.setAttribute("data-testid", "kengyi-control-proposal");
    panel.innerHTML = `
      <div class="kengyi-mvp-head">
        <div>
          <div class="kengyi-mvp-title">今日環控建議</div>
          <div class="kengyi-mvp-subtitle">此頁只接收耕譯已篩選的 control_proposal，供人工確認、通知、設定、驗證與回寫。</div>
        </div>
        <div class="kengyi-mvp-status">pending_confirmation · 等待人工確認</div>
      </div>

      <div class="kengyi-control-tabs" data-testid="kengyi-control-tabs">
        <button class="active" type="button" data-kengyi-tab="proposal">耕譯建議</button>
        <button type="button" data-kengyi-tab="legacy">舊版環控</button>
      </div>
      <div class="kengyi-legacy-note" data-testid="legacy-control-tab">
        舊版環控功能保留在下方原頁面。切回「耕譯建議」時，只顯示已由耕譯篩選的環控候選。
      </div>
      <div class="kengyi-new-content" data-testid="kengyi-control-proposal-content">

      <div class="kengyi-workbench">
        <div class="kengyi-section-title">待處理環控建議</div>
        <div class="kengyi-queue-card active">
          <div class="kengyi-queue-main">
            <div class="kengyi-queue-time">2026/06/01 08:20 · 來源：耕譯 · recommendation_only</div>
            <div class="kengyi-queue-title">麻豆 1 場 · L1-L21 排液 EC 不均</div>
            <div class="kengyi-queue-desc">V7-V10 清水日短脈衝測試。這是候選建議，不是 Hugreen 控制指令。</div>
          </div>
          <div class="kengyi-queue-meta">
            <span>影響設備：電磁閥 7-10</span>
            <span>驗證期限：2026/06/03 08:20</span>
            <span>狀態：pending_confirmation</span>
          </div>
        </div>

        <div class="kengyi-lifecycle">
          <div class="kengyi-life-step current"><b>pending_confirmation</b><span>耕譯已提出候選，等待人工確認。</span></div>
          <div class="kengyi-life-step"><b>notified</b><span>Email 已通知 Clement，保留通知內容。</span></div>
          <div class="kengyi-life-step"><b>configured_in_hugreen</b><span>人工已在 Hugreen 設定，不是 AI 直控。</span></div>
          <div class="kengyi-life-step"><b>verifying</b><span>追蹤 24-48h 指標。</span></div>
          <div class="kengyi-life-step"><b>validated / failed</b><span>結果回寫耕譯，作為下次判斷依據。</span></div>
        </div>
      </div>

      <div class="kengyi-outcome-strip">
        <div class="kengyi-outcome-main">
          <div class="kengyi-outcome-kicker">現場價值</div>
          <div class="kengyi-outcome-title">讓 L1-L21 排液 EC 更均勻，降低水肥錯配造成的產量與品質風險</div>
          <div class="kengyi-outcome-desc">目前只建議 Clement 在清水日測試 V7-V10 短脈衝；給肥日不得當成單純補水。</div>
        </div>
        <div class="kengyi-outcome-metric">
          <b>驗證指標</b>
          <span>排液 EC 收斂 / 排液率 15-20% / Brix / A級率 / 病害率</span>
        </div>
      </div>

      <div class="kengyi-operational-grid">
        <div class="kengyi-setting-panel">
          <div class="kengyi-section-title">建議設定</div>
          <div class="kengyi-setting-list">
            <div><b>V7</b><span>清水日 5 次/天，每次 1:00，對應 L1-L6</span></div>
            <div><b>V8</b><span>清水日 5 次/天，每次 0:45，對應 L7-L11</span></div>
            <div><b>V9</b><span>清水日 5 次/天，每次 1:20，對應 L12-L16</span></div>
            <div><b>V10</b><span>清水日 5 次/天，每次 1:20，對應 L17-L21</span></div>
          </div>
        </div>
        <div class="kengyi-guardrail-panel">
          <div class="kengyi-section-title">不可執行條件</div>
          <ul class="kengyi-guardrail-list">
            <li>11:00 後不做大量灌溉</li>
            <li>給肥日不得解讀成單純補水</li>
            <li>不可 L1-L21 分開施肥</li>
          </ul>
          <div class="kengyi-rollback"><b>回復計畫</b><span>若排液率過高、作物勢下降或 EC 過度稀釋，回復前一版秒數。</span></div>
        </div>
      </div>

      <div class="kengyi-monitor-section">
        <div class="kengyi-section-title light">設備影響圖：只亮本次建議需要調整的設備</div>
        <div class="kengyi-monitor-grid">
          <div class="kengyi-monitor-card muted"><b>前-天窗</b><span>無本次建議</span></div>
          <div class="kengyi-monitor-card muted"><b>前門-卷揚</b><span>無本次建議</span></div>
          <div class="kengyi-monitor-card muted"><b>內循環風扇-育苗</b><span>無本次建議</span></div>
          <div class="kengyi-monitor-card muted"><b>電磁閥1（左1-6排順灌）</b><span>無本次建議</span></div>
          <div class="kengyi-monitor-card target"><b>電磁閥7（左1-6排滴灌）</b><span>建議：5次/天，每次 1:00</span><em>清水日測試</em></div>
          <div class="kengyi-monitor-card target"><b>電磁閥8（左7-11排滴灌）</b><span>建議：5次/天，每次 0:45</span><em>中間區對照</em></div>
          <div class="kengyi-monitor-card target"><b>電磁閥9（左12-16排滴灌）</b><span>建議：5次/天，每次 1:20</span><em>高風險區</em></div>
          <div class="kengyi-monitor-card target"><b>電磁閥10（左17-21排滴灌）</b><span>建議：5次/天，每次 1:20</span><em>高風險區</em></div>
        </div>
      </div>

      <div class="kengyi-trace-panel">
        <div class="kengyi-section-title">追溯與回寫</div>
        <div class="kengyi-trace-grid">
          <div><b>共同交接層</b><span>operation_event_logs · event_type: control_proposal</span></div>
          <div><b>必要欄位</b><span>source、status、linked_memory_ids、fertigation_context、no_go_conditions、rollback_plan</span></div>
          <div><b>人工動作</b><span>確認通知、駁回、標記已在 Hugreen 設定、進入驗證</span></div>
          <div><b>回寫給耕譯</b><span>採納/駁回原因、實際設定、24-48h 結果、validated 或 failed</span></div>
        </div>
      </div>

      <div class="kengyi-mvp-actions">
        <button class="kengyi-mvp-button" data-kengyi-action="post">確認通知並寫入</button>
        <button class="kengyi-mvp-button secondary" data-kengyi-action="copy">複製通知內容</button>
        <button class="kengyi-mvp-button secondary" data-kengyi-action="testing">標記已在 Hugreen 設定</button>
        <button class="kengyi-mvp-button secondary" data-kengyi-action="verify">進入驗證</button>
        <button class="kengyi-mvp-button danger" data-kengyi-action="reject">駁回建議</button>
      </div>
      <div class="kengyi-mvp-note">保護規則：此頁不直接控制 Hugreen；所有動作都以 source: "kengyi" 寫入 operation_event_logs 或本機佇列。</div>
      </div>
      <div class="kengyi-build-stamp" data-testid="orbit-build-stamp">build: ${BUILD_ID} / deployed_at: ${DEPLOYED_AT}</div>
    `;

    if (target.id === "app") {
      target.parentNode.insertBefore(panel, target);
    } else {
      target.parentNode.insertBefore(panel, target.nextSibling);
    }
    setupControlTabs(panel, target);
    panel.querySelector('[data-kengyi-action="post"]').addEventListener("click", postEventLog);
    panel.querySelector('[data-kengyi-action="copy"]').addEventListener("click", copySuggestion);
    panel.querySelector('[data-kengyi-action="testing"]').addEventListener("click", () => {
      saveLocalProposal("testing");
      toast("\u5df2\u6a19\u8a18\u70ba\u6e2c\u8a66\u4e2d\uff0c\u7b49\u5f85 24-48h \u9a57\u8b49\u3002");
    });
    panel.querySelector('[data-kengyi-action="verify"]').addEventListener("click", () => {
      saveLocalProposal("verification_pending");
      toast("\u5df2\u6a19\u8a18\u70ba\u7b49\u5f85\u9a57\u8b49\uff0c\u5f8c\u7e8c\u9700\u56de\u586b EC\u3001\u6392\u6db2\u7387\u3001Brix\u3001A\u7d1a\u7387\u3002");
    });
    panel.querySelector('[data-kengyi-action="reject"]').addEventListener("click", () => {
      saveLocalProposal("rejected");
      toast("\u5df2\u99c1\u56de\u4e26\u4fdd\u7559\u7d00\u9304\uff0c\u4f9b\u8015\u8b6f\u56de\u770b\u539f\u56e0\u3002");
    });
  }

  function setupControlTabs(panel, target) {
    const buttons = [...panel.querySelectorAll("[data-kengyi-tab]")];
    const legacyNodes = [];
    if (target.id !== "app") {
      let node = panel.nextElementSibling;
      while (node) {
        legacyNodes.push(node);
        node.setAttribute("data-kengyi-legacy-control", "true");
        node = node.nextElementSibling;
      }
    }

    const setTab = (tabName) => {
      const legacyActive = tabName === "legacy";
      panel.classList.toggle("is-legacy", legacyActive);
      panel.setAttribute("data-active-tab", tabName);
      buttons.forEach((button) => {
        const active = button.getAttribute("data-kengyi-tab") === tabName;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      legacyNodes.forEach((node) => {
        node.hidden = !legacyActive;
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => setTab(button.getAttribute("data-kengyi-tab")));
    });
    window.__kengyiControlTabs = { setTab };
    setTab("proposal");
  }

  function markDeviceCards() {
    if (!document.body) return;
    const candidates = [...document.querySelectorAll("div, section")].filter((node) => {
      if (node.classList.contains("kengyi-mvp-device-card")) return false;
      const text = (node.innerText || "").replace(/\s+/g, "");
      const hasDeviceChild = [...node.children].some((child) =>
        /\u96fb\u78c1\u95a5(7|8|9|10)/.test((child.innerText || "").replace(/\s+/g, ""))
      );
      return (
        !hasDeviceChild &&
        text.startsWith("\u96fb\u78c1\u95a5") &&
        text.length < 60 &&
        node.children.length <= 8 &&
        /\u96fb\u78c1\u95a5(7|8|9|10)/.test(text) &&
        /(\u6ef4\u704c|\u6392\u6ef4\u704c|\u5de61-6|\u5de67-11|\u5de612-16|\u5de617-21)/.test(text)
      );
    });

    candidates.forEach((node) => {
      node.classList.add("kengyi-mvp-device-card");
      const hint = document.createElement("div");
      hint.className = "kengyi-mvp-device-hint";
      hint.textContent = "\u8015\u8b6f\u5efa\u8b70";
      node.appendChild(hint);
      node.title = "\u8015\u8b6f\u5efa\u8b70\uff1a\u6e05\u6c34\u65e5\u77ed\u8108\u885d\u9a57\u8b49\uff0c\u7b49\u5f85 Clement \u78ba\u8a8d\u3002";
    });
  }

  function boot() {
    renderPanel();
    markDeviceCards();
  }

  window.addEventListener("hashchange", () => setTimeout(boot, 300));
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(boot, 800);
    new MutationObserver(() => {
      renderPanel();
      markDeviceCards();
    }).observe(document.body, { childList: true, subtree: true });
  });
})();
