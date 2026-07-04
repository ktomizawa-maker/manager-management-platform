#!/usr/bin/env node

const target = process.argv[2];

if (!target) {
  console.error("Usage: node tools/verify-public-url.mjs https://{owner}.github.io/{repo}/management-platform/");
  process.exit(2);
}

const baseUrl = target.endsWith("/") ? target : `${target}/`;
const requiredText = [
  "店長OS",
  "店舗を選択",
  "成果アプリを開く",
  "理念浸透を開く",
  "売上達成率",
  "教育進捗率",
  "離職率",
  "マネジメントチェック"
];
const cultureRequiredText = [
  "理念浸透",
  "IDEA NOVベーシック",
  "2026年スローガン",
  "360度アンケート関連",
  "マネジメントチェック関連"
];
const requiredAssets = ["assets/ideanov-basic.png", "assets/slogan-2026.png"];
const forbiddenPatterns = [
  /service_role\s*[:=]/i,
  /SUPABASE_SERVICE_ROLE/i,
  /sb_secret_/i
];

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow" });
  const body = await response.text();
  return { response, body };
}

async function assertOk(url) {
  const { response, body } = await fetchText(url);
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return body;
}

async function assertAssetOk(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
}

function assertContains(body, text) {
  if (!body.includes(text)) {
    throw new Error(`Missing expected text: ${text}`);
  }
}

function assertNoForbiddenSecrets(label, body) {
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(body)) {
      throw new Error(`${label} appears to expose forbidden secret pattern: ${pattern}`);
    }
  }
}

async function main() {
  const topHtml = await assertOk(baseUrl);
  for (const text of requiredText) {
    assertContains(topHtml, text);
  }
  assertNoForbiddenSecrets("TOP HTML", topHtml);

  const appJs = await assertOk(new URL("app.js", baseUrl).toString());
  assertNoForbiddenSecrets("app.js", appJs);

  const cultureHtml = await assertOk(new URL("culture/", baseUrl).toString());
  for (const text of cultureRequiredText) {
    assertContains(cultureHtml, text);
  }
  assertNoForbiddenSecrets("culture/", cultureHtml);

  for (const assetPath of requiredAssets) {
    await assertAssetOk(new URL(assetPath, baseUrl).toString());
  }

  console.log("OK: public Management Platform URL passed smoke checks");
  console.log(baseUrl);
}

main().catch((error) => {
  console.error(`NG: ${error.message}`);
  process.exit(1);
});
