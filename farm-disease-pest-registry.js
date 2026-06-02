(function () {
  const BUILD_ID = "farm-disease-pest-registry";
  const DEPLOYED_AT = "2026-06-02T17:25:00+08:00";
  const EVENT_KEY = "orbit_disease_pest_events";

  const zones = [
    "麻豆1場 L1-L6",
    "麻豆1場 L7-L11",
    "麻豆1場 L12-L16",
    "麻豆1場 L17-L21",
    "右1-5",
    "右6-11",
    "育苗區",
    "水耕液區",
    "其他"
  ];

  const diseases = [
    { group: "病原性病害", value: "炭疽病 / 冠腐 / 基腐病 (Colletotrichum)", code: "D-COLLETOTRICHUM" },
    { group: "病原性病害", value: "疫病 / 根腐病 (Phytophthora)", code: "D-PHYTOPHTHORA" },
    { group: "病原性病害", value: "灰黴病 (Botrytis)", code: "D-BOTRYTIS" },
    { group: "病原性病害", value: "細菌性軟腐病 (Pectobacterium)", code: "D-PECTOBACTERIUM" },
    { group: "病原性病害", value: "葉斑病群 (Ramularia 等)", code: "D-LEAF-SPOT" },
    { group: "病原性病害", value: "白粉病", code: "D-POWDERY-MILDEW" },
    { group: "病原性病害", value: "露菌病", code: "D-DOWNY-MILDEW" },
    { group: "病原性病害", value: "蔓枯病", code: "D-GUMMY-STEM-BLIGHT" },
    { group: "病原性病害", value: "黑點根腐病", code: "D-BLACK-ROOT-ROT" },
    { group: "病原性病害", value: "病毒病群 (SMoV / SMYEV / WSMoV / ZYMV / CMV / WMV / CGMMV / MYSV)", code: "D-VIRUS-GROUP" },
    { group: "病原性病害", value: "細菌性果斑病", code: "D-BACTERIAL-FRUIT-BLOTCH" },
    { group: "病原性病害", value: "苗立枯病", code: "D-DAMPING-OFF" },
    { group: "病原性病害", value: "根瘤線蟲", code: "D-ROOT-KNOT-NEMATODE" },
    { group: "病原性病害", value: "萎凋病 / 其他鐮孢類", code: "D-FUSARIUM-WILT" },
    { group: "病原性病害", value: "其他真菌病害 (鐮孢等)", code: "D-OTHER-FUNGAL" },
    { group: "非病原判斷", value: "苗源 / 品種問題", code: "D-SEEDLING-VARIETY" },
    { group: "非病原判斷", value: "水傷 / 化學傷", code: "D-WATER-CHEMICAL-INJURY" },
    { group: "非病原判斷", value: "連作障礙 / 磷鉀重鹽累積", code: "D-CROPPING-SALT" },
    { group: "非病原判斷", value: "未知 / 待耕譯判讀", code: "D-UNKNOWN" }
  ];

  const pests = [
    { group: "刺吸與病毒媒介", value: "紅蜘蛛 / 葉蟎", code: "P-SPIDER-MITE" },
    { group: "刺吸與病毒媒介", value: "細蟎類", code: "P-BROAD-MITE" },
    { group: "刺吸與病毒媒介", value: "薊馬類 (南黃薊馬 / 小黃薊馬)", code: "P-THRIPS" },
    { group: "刺吸與病毒媒介", value: "蚜蟲類 (棉蚜 / 桃蚜)", code: "P-APHID" },
    { group: "刺吸與病毒媒介", value: "粉蝨類 (銀葉粉蝨 / 溫室粉蝨)", code: "P-WHITEFLY" },
    { group: "刺吸與病毒媒介", value: "介殼蟲 / 粉介殼蟲", code: "P-SCALE-MEALYBUG" },
    { group: "潛葉與葉部取食", value: "斑潛蠅 / 番茄斑潛蠅", code: "P-LEAFMINER" },
    { group: "潛葉與葉部取食", value: "黃守瓜 / 黃條葉蚤", code: "P-CUCURBIT-BEETLE" },
    { group: "潛葉與葉部取食", value: "金花蟲類", code: "P-LEAF-BEETLE" },
    { group: "潛葉與葉部取食", value: "植食性瓢蟲類", code: "P-PLANT-FEEDING-LADYBIRD" },
    { group: "鱗翅目幼蟲", value: "瓜螟 / 瓜絹螟", code: "P-MELON-WORM" },
    { group: "鱗翅目幼蟲", value: "斜紋夜蛾", code: "P-SPODOPTERA-LITURA" },
    { group: "鱗翅目幼蟲", value: "甜菜夜蛾", code: "P-BEET-ARMYWORM" },
    { group: "鱗翅目幼蟲", value: "夜蛾類 / 鑽蛀類幼蟲", code: "P-NOCTUID-LARVAE" },
    { group: "果實與地下部", value: "瓜實蠅 / 果實蠅", code: "P-MELON-FRUIT-FLY" },
    { group: "果實與地下部", value: "菌蚊 / 蕈蚋成蟲與幼蟲", code: "P-FUNGUS-GNAT" },
    { group: "果實與地下部", value: "根蟎 / 根部蟲害", code: "P-ROOT-MITE" },
    { group: "果實與地下部", value: "蝸牛 / 蛞蝓", code: "P-SLUG-SNAIL" },
    { group: "其他", value: "其他 / 待耕譯判讀", code: "P-UNKNOWN" }
  ];

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isFarmPage() {
    const hash = location.hash.toLowerCase();
    const text = document.body?.textContent || "";
    return hash.includes("farm") || hash.includes("management") || text.includes("蟲害登記") || text.includes("蟲害巡查");
  }

  function optionGroups(items) {
    const groups = [...new Set(items.map((item) => item.group))];
    return groups.map((group) => {
      const options = items.filter((item) => item.group === group)
        .map((item) => `<option value="${item.value}" data-code="${item.code}">${item.value}</option>`)
        .join("");
      return `<optgroup label="${group}">${options}</optgroup>`;
    }).join("");
  }

  function chipList(items) {
    return items.map((item) => `<span title="${item.group}">${item.value}</span>`).join("");
  }

  function renameText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.nodeValue && node.nodeValue.includes("蟲害登記")) {
        node.nodeValue = node.nodeValue.replaceAll("蟲害登記", "病蟲害登記");
      }
    });
  }

  function addDiseaseTabBeforePest() {
    const candidates = Array.from(document.querySelectorAll("button, [role='tab'], .el-tabs__item, .el-tab-pane"));
    const pestTab = candidates.find((node) => node.textContent?.trim() === "蟲害巡查");
    if (!pestTab || pestTab.parentElement?.querySelector("[data-testid='farm-disease-tab']")) return;
    const diseaseTab = pestTab.cloneNode(true);
    diseaseTab.textContent = "病害登記";
    diseaseTab.setAttribute("data-testid", "farm-disease-tab");
    diseaseTab.classList.remove("is-active");
    pestTab.parentElement.insertBefore(diseaseTab, pestTab);
  }

  function scoreEvent(event) {
    const total = Math.max(Number(event.totalPlants) || 0, 1);
    const infectedRate = Math.min(1, (Number(event.infectedCount) || 0) / total);
    const removedRate = Math.min(1, (Number(event.removedCount) || 0) / total);
    const severity = Number(event.severity) || 1;
    const diseaseWeight = event.disease && event.disease !== "無" ? 1 : 0;
    const pestWeight = event.pest && event.pest !== "無" ? 0.65 : 0;
    return Math.round(Math.min(100, infectedRate * 45 + removedRate * 55 + severity * 5 + diseaseWeight * 8 + pestWeight * 6));
  }

  function renderEvents(root) {
    const list = root.querySelector("[data-pd-events]");
    const events = readJson(EVENT_KEY, []).slice(0, 6);
    if (!events.length) {
      list.innerHTML = `<div class="pd-empty">尚無登記。第一筆資料會成為耕譯病蟲害評分基準。</div>`;
      return;
    }
    list.innerHTML = events.map((event) => `
      <div class="pd-event">
        <strong>${event.zone}</strong>
        <span>${event.disease || "未選病害"} / ${event.pest || "未選蟲害"}</span>
        <em>感染 ${event.infectedCount} / 移除 ${event.removedCount} / 風險 ${event.kengyiRiskScore}</em>
      </div>
    `).join("");
  }

  function saveEvent(root) {
    const form = root.querySelector("[data-pd-form]");
    const event = {
      id: `pd_${Date.now()}`,
      source: "farm_disease_pest_registry",
      event_type: "disease_pest_registration",
      created_at: new Date().toISOString(),
      zone: form.zone.value,
      crop: form.crop.value,
      disease: form.disease.value,
      pest: form.pest.value,
      infectedCount: Number(form.infectedCount.value || 0),
      removedCount: Number(form.removedCount.value || 0),
      totalPlants: Number(form.totalPlants.value || 0),
      severity: Number(form.severity.value || 1),
      note: form.note.value.trim()
    };
    event.kengyiRiskScore = scoreEvent(event);
    event.kengyiScoreEquation = "DiseasePestRisk = infectionRate*45 + removalRate*55 + severity*5 + diseaseWeight*8 + pestVectorWeight*6";
    const events = readJson(EVENT_KEY, []);
    events.unshift(event);
    writeJson(EVENT_KEY, events.slice(0, 120));
    root.querySelector("[data-pd-score]").textContent = `耕譯風險 ${event.kengyiRiskScore}`;
    renderEvents(root);
  }

  function renderPanel() {
    if (!isFarmPage() || document.querySelector("[data-testid='farm-disease-pest-registry']")) return;
    const host = document.querySelector(".farm-mgmt, .farm-management, main, #app") || document.body;
    const root = document.createElement("section");
    root.className = "orbit-pd-panel";
    root.setAttribute("data-testid", "farm-disease-pest-registry");
    root.innerHTML = `
      <div class="pd-head">
        <div>
          <b>病蟲害登記</b>
          <span>區域感染數、病死移除數與蟲害壓力會寫入耕譯評分資料。</span>
        </div>
        <em data-testid="farm-pd-build">build: ${BUILD_ID} / deployed_at: ${DEPLOYED_AT}</em>
      </div>
      <div class="pd-tabs" data-testid="farm-pd-tabs">
        <button class="active" type="button">病害登記</button>
        <button type="button">蟲害巡查</button>
        <button type="button">耕譯評分</button>
      </div>
      <form class="pd-form" data-pd-form>
        <label>區域<select name="zone">${zones.map((zone) => `<option>${zone}</option>`).join("")}</select></label>
        <label>作物<select name="crop"><option>香瓜 / 哈密瓜</option><option>草莓</option><option>其他</option></select></label>
        <label>病害<select name="disease"><option value="">無 / 未判定</option>${optionGroups(diseases)}</select></label>
        <label>蟲害<select name="pest"><option value="">無 / 未判定</option>${optionGroups(pests)}</select></label>
        <label>感染株數<input name="infectedCount" type="number" min="0" value="0"></label>
        <label>病死移除<input name="removedCount" type="number" min="0" value="0"></label>
        <label>總株數<input name="totalPlants" type="number" min="1" value="100"></label>
        <label>嚴重度<select name="severity"><option value="1">1 輕微</option><option value="2">2 擴散觀察</option><option value="3">3 高風險</option><option value="4">4 急迫處理</option><option value="5">5 大量移除</option></select></label>
        <label class="pd-note">備註<input name="note" placeholder="例：L7-L11 白粉疑似，移除 3 株，葉背有粉蝨"></label>
        <button type="button" data-pd-save>儲存並送入耕譯評分</button>
        <output data-pd-score>耕譯風險 --</output>
      </form>
      <div class="pd-equation" data-testid="farm-pd-equation">
        DiseasePestRisk = infectionRate*45 + removalRate*55 + severity*5 + diseaseWeight*8 + pestVectorWeight*6
      </div>
      <div class="pd-lists">
        <div><b>病害可選清單</b><div>${chipList(diseases)}</div></div>
        <div><b>蟲害可選清單</b><div>${chipList(pests)}</div></div>
      </div>
      <div class="pd-history" data-pd-events></div>
    `;
    host.prepend(root);
    root.querySelector("[data-pd-save]").addEventListener("click", () => saveEvent(root));
    renderEvents(root);
  }

  function boot() {
    if (!document.body) return;
    renameText();
    addDiseaseTabBeforePest();
    renderPanel();
  }

  const observer = new MutationObserver(() => boot());
  window.addEventListener("hashchange", () => setTimeout(boot, 250));
  window.addEventListener("DOMContentLoaded", () => {
    boot();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
  setTimeout(boot, 1000);
})();
