import { chromium } from "@playwright/test";

const BASE = process.env.SHOT_BASE ?? "http://127.0.0.1:5173";
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

const results = [];
const check = (name, pass, detail = "") =>
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);

async function enter(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1200);
  const skip = page.getByRole("button", { name: /skip|lewati/i });
  if (await skip.count()) await skip.first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(4000);
}

// The score element only exists once sound has been switched on, and it is
// paused when it is switched off, so its presence and paused flag together are
// the audio state as the page itself sees it.
const audioState = () =>
  page.evaluate(() => {
    const el = document.querySelector("[data-house-adel-score]");
    return { present: Boolean(el), paused: el ? el.paused : null };
  });

await enter("/contact");

// --- David ------------------------------------------------------------------
const canvases = await page.locator("canvas").count();
check("canvases mounted on contact", canvases >= 2, `${canvases} canvases`);
const cloud = await page.evaluate(async () => {
  const response = await fetch("/assets/house-adel/david-cloud.bin");
  const buffer = await response.arrayBuffer();
  const view = new DataView(buffer, 0, 24);
  return { ok: response.ok, magic: view.getUint32(0, false).toString(16), count: view.getUint32(4, true), bytes: buffer.byteLength };
});
check("david cloud loads", cloud.ok && cloud.magic === "48414331", JSON.stringify(cloud));
check(
  "david stage labelled",
  (await page.locator('[role="img"][aria-label*="David"]').count()) === 1,
);

// --- Audio: background click toggles ----------------------------------------
let state = await audioState();
check("audio starts off", !state.present, JSON.stringify(state));

await page.mouse.click(1180, 640); // empty page, right of the column, over the sculpture field
await page.waitForTimeout(1200);
state = await audioState();
check("background click enables audio", state.present && state.paused === false, JSON.stringify(state));

// --- Audio: interactive elements must never toggle --------------------------
// Record the app's own verdict for every click, so a pass cannot come from the
// pointer having missed the control entirely.
await page.evaluate(async () => {
  const module = await import("/src/lib/interactive.ts");
  window.__verdicts = [];
  window.addEventListener("click", (event) => {
    window.__verdicts.push({
      background: module.isBackgroundClick(event),
      match: module.interactiveTarget(event)?.tagName?.toLowerCase() ?? null,
    });
  });
});
const verdicts = async () => {
  const seen = await page.evaluate(() => window.__verdicts);
  await page.evaluate(() => {
    window.__verdicts = [];
  });
  return seen;
};
await verdicts();
const targets = [
  ["header nav link", 'header nav a[href$="/work"]'],
  ["language button", "header nav button"],
  ["text input", "#enquiry-name"],
  ["textarea", "#enquiry-planning"],
  ["radio label (WhatsApp)", 'label:has(input[value="whatsapp"])'],
  ["disclosure button", 'button[aria-controls="more-details-panel"]'],
  ["submit button", 'button[type="submit"]'],
  ["whatsapp link", 'a[href^="https://wa.me"]'],
  ["instagram link", 'a[href*="instagram.com"]'],
  ["email link", 'a[href^="mailto:"]'],
  ["privacy link", 'a[href$="/privacy"]'],
];

for (const [name, selector] of targets) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) {
    check(`audio unchanged: ${name}`, false, "selector not found");
    continue;
  }
  const before = await audioState();
  // Links would navigate; the point is only whether the global handler fires,
  // so the default is suppressed for anchors and the click still bubbles.
  await locator.evaluate((el) => {
    if (el.tagName === "A") el.addEventListener("click", (e) => e.preventDefault(), { once: true });
  });
  // A real pointer press at the control's own centre. Playwright's actionability
  // layer is bypassed deliberately: the navigation rebuilds its letters on every
  // hover, and its retry loop times out on elements a visitor can press without
  // any trouble. The verdict recorded below says where the click actually landed.
  let clickError = "";
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(600);
  const box = await locator.boundingBox();
  if (!box) clickError = " (no box)";
  else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  const after = await audioState();
  const seen = await verdicts();
  check(
    `audio unchanged: ${name}`,
    before.present === after.present &&
      before.paused === after.paused &&
      !clickError &&
      seen.length > 0 &&
      seen.every((v) => v.background === false),
    `${JSON.stringify(before)} -> ${JSON.stringify(after)}${clickError} verdicts=${JSON.stringify(seen)}`,
  );
}

// --- Audio: a span inside a button still counts as the button ---------------
{
  const span = page.locator('button[aria-controls="more-details-panel"] span').first();
  await span.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const box = await span.boundingBox();
  const before = await audioState();
  await verdicts();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  const after = await audioState();
  const seen = await verdicts();
  check(
    "audio unchanged: span inside button",
    before.paused === after.paused && seen.length > 0 && seen.every((v) => v.background === false),
    `verdicts=${JSON.stringify(seen)}`,
  );
}

// --- Audio: keyboard activation of a control must not toggle ----------------
{
  await page.locator('button[aria-controls="more-details-panel"]').focus();
  const before = await audioState();
  const expandedBefore = await page.locator('button[aria-controls="more-details-panel"]').getAttribute("aria-expanded");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  const after = await audioState();
  const expandedAfter = await page.locator('button[aria-controls="more-details-panel"]').getAttribute("aria-expanded");
  check("keyboard Enter on button: audio unchanged", before.paused === after.paused);
  check("keyboard Enter on button: control acted", expandedBefore !== expandedAfter, `${expandedBefore} -> ${expandedAfter}`);
}

// --- Audio: background click still toggles back off -------------------------
{
  await page.mouse.click(1180, 700);
  await page.waitForTimeout(800);
  const after = await audioState();
  check("second background click mutes", after.paused === true, JSON.stringify(after));
}

// --- Questionnaire controls -------------------------------------------------
await page.locator('label:has(input[value="instagram"])').click();
await page.waitForTimeout(400);
check(
  "radio selects instagram",
  await page.locator('input[value="instagram"]').isChecked(),
);
check(
  "instagram field revealed",
  (await page.locator("#enquiry-instagram").count()) === 1,
);
await page.locator('label:has(input[value="whatsapp"])').click();
await page.waitForTimeout(400);
check("radio switches to whatsapp", await page.locator('input[value="whatsapp"]').isChecked());
check("country select present", (await page.locator("select").count()) === 1);

// Keyboard: the radio group must still answer to the arrow keys.
await page.locator('input[value="whatsapp"]').focus();
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(300);
check(
  "arrow key moves radio selection",
  await page.locator('input[value="instagram"]').isChecked(),
);

await page.locator("#enquiry-name").fill("Test Person");
check("text input accepts typing", (await page.locator("#enquiry-name").inputValue()) === "Test Person");

// Submit with an incomplete form: it must validate rather than navigate.
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(900);
check(
  "submit runs validation",
  (await page.locator('[role="alert"]').count()) > 0,
  `${await page.locator('[role="alert"]').count()} alerts`,
);

// --- Link targets -----------------------------------------------------------
for (const [name, selector, expected] of [
  ["whatsapp href", 'a[href^="https://wa.me"]', "https://wa.me/628117783600"],
  ["instagram href", 'a[href*="instagram.com"]', "https://www.instagram.com/thehouseadel/"],
  ["email href", 'a[href^="mailto:"]', "mailto:hello.houseofadel@gmail.com"],
]) {
  const href = await page.locator(`main ${selector}`).first().getAttribute("href");
  check(name, href === expected, `${href}`);
}

// --- Route churn: no leaked contexts, no duplicate loops --------------------
for (let i = 0; i < 3; i += 1) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
}
const afterChurn = await page.locator("canvas").count();
check("canvas count stable after 3 round trips", afterChurn === canvases, `${afterChurn} vs ${canvases}`);
check("no page errors during churn", errors.length === 0, errors.slice(0, 4).join(" | "));

// --- Resize -----------------------------------------------------------------
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(2500);
check("survives resize to mobile", (await page.locator("canvas").count()) >= 1);
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(2500);
check("survives resize back to desktop", (await page.locator("canvas").count()) >= 1);
check("no page errors overall", errors.length === 0, errors.slice(0, 4).join(" | "));

console.log(results.join("\n"));
console.log(`\n${results.filter((r) => r.startsWith("PASS")).length}/${results.length} passed`);
await browser.close();
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
