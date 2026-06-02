(function () {
  const FEATURE_KEY = "wegrow_o2o3_enabled";
  const ROOT_ID = "o2o3-photo-upload-root";

  function featureEnabled() {
    const search = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes("?")
      ? new URLSearchParams(window.location.hash.split("?").slice(1).join("?"))
      : new URLSearchParams();
    return (
      search.get("feature") === "o2o3" ||
      hashQuery.get("feature") === "o2o3" ||
      window.localStorage.getItem(FEATURE_KEY) === "1"
    );
  }

  function renderThumb(file, index) {
    const row = document.createElement("div");
    row.className = "o2o3-thumb";
    const preview = document.createElement("div");
    preview.className = "o2o3-thumb-preview";
    preview.textContent = index === 0 ? "巡查單" : index === 1 ? "葉片" : "黃板";
    if (file && file.type && file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.alt = file.name;
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);
      preview.textContent = "";
      preview.appendChild(img);
    }
    const name = document.createElement("div");
    name.className = "o2o3-thumb-name";
    name.textContent = file?.name || ["巡查單.jpg", "A區葉背.jpg", "黃板_A區.jpg"][index] || "照片.jpg";
    const chip = document.createElement("span");
    chip.className = `o2o3-chip ${index === 1 ? "warn" : ""}`;
    chip.textContent = index === 0 ? "已讀取" : index === 1 ? "待確認" : "解析中";
    row.append(preview, name, chip);
    return row;
  }

  function updateThumbs(root, files) {
    const list = root.querySelector("[data-o2o3-thumbs]");
    if (!list) return;
    list.innerHTML = "";
    const selected = Array.from(files || []).slice(0, 6);
    const display = selected.length ? selected : [null, null, null];
    display.forEach((file, index) => list.appendChild(renderThumb(file, index)));
  }

  function boot() {
    if (!featureEnabled() || document.getElementById(ROOT_ID) || !document.body) return;
    const root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "o2o3-shell";
    root.setAttribute("data-testid", "o2o3-photo-upload");
    root.innerHTML = `
      <header class="o2o3-head">
        <div class="o2o3-title">
          <h2>O2+O3｜照片上傳 → 熱區圖 → 耕譯建議</h2>
          <p>現場只上傳巡查單、葉片、黃板照片；AI 讀取後產生熱區、環控、施肥與防治候選。</p>
        </div>
        <div class="o2o3-flow" aria-label="workflow">
          <span>1 上傳照片</span>
          <span>2 AI讀取欄位</span>
          <span>3 產生熱區圖</span>
          <span>4 耕譯建議</span>
        </div>
        <button class="o2o3-close" type="button" data-o2o3-close>關閉</button>
      </header>
      <div class="o2o3-body">
        <aside class="o2o3-panel">
          <h3>上傳照片</h3>
          <div class="o2o3-upload-box">
            <div>
              <strong>拖曳或選擇照片</strong>
              <small>支援巡查單、葉背、黃板與現場照片</small>
            </div>
          </div>
          <div class="o2o3-upload-actions">
            <label>巡查單<input type="file" accept="image/*" multiple data-o2o3-file></label>
            <label>葉片照片<input type="file" accept="image/*" multiple data-o2o3-file></label>
            <label>黃板照片<input type="file" accept="image/*" multiple data-o2o3-file></label>
          </div>
          <div class="o2o3-thumbs" data-o2o3-thumbs></div>
          <div class="o2o3-summary" data-testid="o2o3-extracted-summary">
            <div><span>日期</span><strong>2026/06/02</strong></div>
            <div><span>區域</span><strong>A區 L1-L6</strong></div>
            <div><span>作物</span><strong>小玉香瓜</strong></div>
            <div><span>病害</span><strong>瓜類褪綠黃化病毒</strong></div>
            <div><span>媒介</span><strong>粉蝨</strong></div>
            <div><span>感染</span><strong>22 / 168</strong></div>
            <div><span>移除</span><strong>5 株</strong></div>
            <div><span>嚴重度</span><strong>4 / 5</strong></div>
          </div>
        </aside>
        <main class="o2o3-panel" data-testid="o2o3-risk-heatmap">
          <h3>自動產生熱區圖</h3>
          <div class="o2o3-map" role="img" aria-label="麻豆1場病蟲害熱區圖">
            <div class="o2o3-zone e good"><span>E區<em>R6-R11｜穩定</em></span></div>
            <div class="o2o3-zone f watch"><span>F區<em>R1-R5｜注意</em></span></div>
            <div class="o2o3-zone nursery watch"><span>育苗區<em>隔離觀察</em></span></div>
            <div class="o2o3-zone d good"><span>D區<em>L17-L21｜穩定</em></span></div>
            <div class="o2o3-zone c watch"><span>C區<em>L12-L16｜觀察</em></span></div>
            <div class="o2o3-zone b spread"><span>B區<em>L7-L11｜擴散中</em></span></div>
            <div class="o2o3-zone a high"><span>A區<em>L1-L6｜高風險</em></span></div>
            <div class="o2o3-zone machine"><span>機房<em>非栽培區</em></span></div>
          </div>
          <div class="o2o3-risk-legend">
            <span style="background:#dff3e5">綠：穩定</span>
            <span style="background:#fff3c4">黃：觀察</span>
            <span style="background:#ffd9a3">橘：擴散中</span>
            <span style="background:#ffc1b8">紅：高風險</span>
          </div>
        </main>
        <aside class="o2o3-panel" data-testid="o2o3-kengyi-recommendations">
          <div class="o2o3-rec-head">
            <h3>耕譯判斷後建議</h3>
            <span class="o2o3-chip danger">需人工確認</span>
          </div>
          <div class="o2o3-score">
            <span>DiseasePestRisk</span>
            <strong>64 高風險</strong>
          </div>
          <p class="o2o3-reason">感染率 13.1%、移除率 3.0%、粉蝨媒介壓力高；病毒不可用環控治癒，目標是降低新感染與跨區傳播。</p>
          <section class="o2o3-rec-group">
            <h4>環控設定建議</h4>
            <ul>
              <li>提高 A/B 區通風巡查頻率，濕度警戒不直接控制設備。</li>
              <li>避開高濕低風速時段造成葉面停留水膜。</li>
              <li>48 小時後比對新增病株與粉蝨數。</li>
            </ul>
          </section>
          <section class="o2o3-rec-group">
            <h4>施肥計畫建議</h4>
            <ul>
              <li>今日不加重氮肥，避免徒長提高病蟲害風險。</li>
              <li>給肥日不得把額外補水解讀成單純補水。</li>
              <li>EC 維持區間，根區壓力與排液 EC 需同步回寫。</li>
            </ul>
          </section>
          <section class="o2o3-rec-group">
            <h4>防治計畫建議</h4>
            <ul>
              <li>A/B 區黃板加密，葉背粉蝨巡查改為 48hr 追蹤。</li>
              <li>病株移除後封袋，工具與人員動線分流。</li>
              <li>7 日內追蹤 A→B 擴散是否下降，回寫耕譯權重。</li>
            </ul>
          </section>
          <div class="o2o3-actions">
            <button type="button">送入耕譯紀錄</button>
            <button type="button" class="secondary">產生Hugreen候選</button>
            <button type="button" class="secondary">匯出防治計畫</button>
          </div>
        </aside>
      </div>
    `;
    document.body.appendChild(root);
    updateThumbs(root);
    root.querySelectorAll("[data-o2o3-file]").forEach((input) => {
      input.addEventListener("change", () => updateThumbs(root, input.files));
    });
    root.querySelector("[data-o2o3-close]")?.addEventListener("click", () => {
      root.hidden = true;
      window.localStorage.removeItem(FEATURE_KEY);
    });
  }

  window.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("hashchange", boot);
  setTimeout(boot, 1000);
})();
