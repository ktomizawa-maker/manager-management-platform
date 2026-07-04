#!/usr/bin/env node

const target = process.argv[2];

if (!target) {
  console.error("Usage: node tools/verify-public-url.mjs https://{owner}.github.io/{repo}/management-platform/");
  process.exit(2);
}

const baseUrl = target.endsWith("/") ? target : `${target}/`;
const requiredText = [
  "店長OS",
  "成果",
  "育成",
  "定着",
  "理念浸透",
  "4領域ハブ"
];
const childPaths = ["sales/", "training/", "retention/", "culture/"];
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

  for (const path of childPaths) {
    const body = await assertOk(new URL(path, baseUrl).toString());
    assertNoForbiddenSecrets(path, body);
  }

  console.log("OK: public Management Platform URL passed smoke checks");
  console.log(baseUrl);
}

main().catch((error) => {
  console.error(`NG: ${error.message}`);
  process.exit(1);
});
