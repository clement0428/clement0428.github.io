import { writeFile, mkdir } from "node:fs/promises";

const baseUrl = process.env.PRODUCTION_URL || "https://wegrow-orbit.com";
const targetPath = process.env.PRODUCTION_PATH || "/#/analysis";
const targetText = process.env.TARGET_TEXT || "AI 驅動智慧溫室：耕譯決策島";
const targetTestId = process.env.TARGET_TESTID || "kengyi-decision-island";
const photoStorageUrl = process.env.PHOTO_STORAGE_URL || "https://api.wegrow-orbit.com/bucket";
const outputDir = process.env.VERIFY_OUTPUT_DIR || "outputs";

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  return {
    ok: response.ok,
    status: response.status,
    text: await response.text().catch(() => "")
  };
}

async function run() {
  const stamp = Date.now();
  const indexUrl = `${baseUrl}/?verify=${stamp}`;
  const buildUrl = `${baseUrl}/build-meta.js?verify=${stamp}`;
  const photoUrl = `${photoStorageUrl}${photoStorageUrl.includes("?") ? "&" : "?"}verify=${stamp}`;

  const [index, buildMeta, photo] = await Promise.allSettled([
    fetchText(indexUrl),
    fetchText(buildUrl),
    fetch(photoUrl, { method: "HEAD", cache: "no-store" })
  ]);

  const indexValue = index.status === "fulfilled" ? index.value : { ok: false, status: 0, text: String(index.reason) };
  const buildValue = buildMeta.status === "fulfilled" ? buildMeta.value : { ok: false, status: 0, text: String(buildMeta.reason) };
  const photoValue = photo.status === "fulfilled"
    ? { ok: photo.value.ok, status: photo.value.status }
    : { ok: false, status: 0, error: String(photo.reason) };

  const frontendPass = indexValue.ok
    && buildValue.ok
    && indexValue.text.includes("/assets/index-")
    && !indexValue.text.includes("farm-disease-pest-registry");

  const result = {
    checked_at: new Date().toISOString(),
    production_url: `${baseUrl}${targetPath}`,
    frontend_bundle_deployed: {
      status: frontendPass ? "pass" : "fail",
      index_status: indexValue.status,
      build_meta_status: buildValue.status,
      no_removed_overlay: !indexValue.text.includes("farm-disease-pest-registry")
    },
    photo_storage_check: {
      status: photoValue.ok ? "pass" : "fail",
      status_code: photoValue.status,
      url: photoStorageUrl,
      error: photoValue.error || null
    },
    visibility_gate: {
      status: "requires_browser",
      target_text: targetText,
      target_testid: targetTestId,
      note: "DOM visibility and screenshots must be verified with Browser against the production route."
    }
  };

  await mkdir(outputDir, { recursive: true });
  const out = `${outputDir}/production-verify-${stamp}.json`;
  await writeFile(out, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));

  if (!frontendPass) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

