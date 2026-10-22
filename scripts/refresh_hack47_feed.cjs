/**
 * refresh_hack47_feed.js
 *
 * Pulls the latest posts from @hack47org (X) and /company/hack47 (LinkedIn)
 * through the shared logged-in browser (CDP port 9333) and rewrites
 * public/feed/latest.json — the file the site's NEWS_SIGNAL / news sections read.
 *
 * Requirements:
 *   - The shared browser must be running (see README: node launch_linkedin.js)
 *   - playwright: `npm i -g playwright` or run from a dir where it's installed
 *
 * Usage:
 *   node scripts/refresh_hack47_feed.js [--json]
 *     --json  print machine-readable summary {changed, x, linkedin}
 *
 * Exit codes: 0 = ok (changed or not), 1 = browser unavailable, 2 = fatal error
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const REPO_ROOT = path.resolve(__dirname, "..");
const FEED_PATH = path.join(REPO_ROOT, "public", "feed", "latest.json");

async function extractX(page) {
  await page.goto("https://x.com/hack47org", { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  await sleep(6000);
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, 1600)).catch(() => {});
    await sleep(1000);
  }
  return page
    .evaluate(() => {
      const out = [];
      const arts = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
      for (const a of arts) {
        const link = a.querySelector('a[href*="/status/"]');
        const textEl = a.querySelector('[data-testid="tweetText"]');
        const timeEl = a.querySelector("time");
        if (!link) continue;
        const href = link.getAttribute("href") || "";
        const m = href.match(/status\/(\d+)/);
        if (!m) continue;
        out.push({
          author: "Hack47",
          role: "@hack47org",
          url: "https://x.com" + href.split("?")[0],
          text: (textEl ? textEl.innerText : "").replace(/\n+/g, " ").trim().slice(0, 500),
          date: timeEl ? (timeEl.getAttribute("datetime") || "").slice(0, 10) : "",
        });
      }
      return out;
    })
    .catch(() => []);
}

async function extractLinkedIn(page) {
  await page.goto("https://www.linkedin.com/company/hack47/posts/", { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  // Works on both the public posts page and the admin dashboard (the logged-in
  // user is a page admin, so LinkedIn may redirect there).
  try {
    await page.waitForSelector('a[href*="urn:li:activity"]', { timeout: 15000 });
  } catch {
    // fall through — evaluate will return [] and the retry loop kicks in
  }
  await sleep(3000);
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000)).catch(() => {});
    await sleep(800);
  }
  return page
    .evaluate(() => {
      const out = [];
      const seen = new Set();
      const links = Array.from(document.querySelectorAll('a[href*="urn:li:activity"]'));
      for (const l of links) {
        const href = l.getAttribute("href") || "";
        const m = href.match(/urn:li:activity:(\d+)/);
        if (!m || seen.has(m[1])) continue;
        seen.add(m[1]);
        // The post card is LinkedIn's stable "feed-shared-update-v2" container.
        // Fall back to climbing to the smallest ancestor with bounded text.
        let card = l.closest(".feed-shared-update-v2");
        if (!card) {
          card = l;
          for (let i = 0; i < 14 && card; i++) {
            const parent = card.parentElement;
            if (!parent) break;
            card = parent;
            const t = card.innerText || "";
            if (card.querySelector("time") && t.length > 0 && t.length < 900) break;
          }
        }
        const raw = card ? card.innerText : "";
        const timeEl = card ? card.querySelector("time") : null;
        const lines = raw.split("\n").map((x) => x.trim()).filter(Boolean);
        // Parse around the "• 1st" author marker: name above it, headline below it
        const starIdx = lines.findIndex((l) => /^•/.test(l));
        let author = "Hack47";
        let role = "Hack47";
        let body = lines;
        if (starIdx >= 0) {
          if (lines[starIdx - 1]) author = lines[starIdx - 1].slice(0, 60);
          if (lines[starIdx + 1]) role = lines[starIdx + 1].split(" | ")[0].slice(0, 80);
          body = lines.slice(starIdx + 2);
        }
        const junk = /Manage recent posts|Learn more|Page \d+ of|Previous|Next|This post type|^Boost$|^…|^\d+[hdw]m? •/i;
        const text = body
          .filter((l) => !junk.test(l))
          .join("\n")
          .replace(/\n{2,}/g, "\n")
          .trim()
          .slice(0, 700);
        if (!text) continue;
        // Date: <time datetime> if present, else parse the relative marker ("3h •", "2d •")
        let date = timeEl ? (timeEl.getAttribute("datetime") || "").slice(0, 10) : "";
        if (!date) {
          const rel = (raw.match(/(\d+)\s*([hdwm])\s*•/) || [])[0];
          if (rel) {
            const n = parseInt(rel.match(/\d+/)[0], 10);
            const unit = rel.match(/[hdwm]/)[0];
            const ms = { h: 3600e3, d: 86400e3, w: 7 * 86400e3, m: 30 * 86400e3 }[unit];
            date = new Date(Date.now() - n * ms).toISOString().slice(0, 10);
          }
        }
        out.push({
          author,
          role,
          url: "https://www.linkedin.com/feed/update/urn:li:activity:" + m[1] + "/",
          text,
          date,
        });
      }
      return out;
    })
    .catch(() => []);
}

(async () => {
  const jsonOnly = process.argv.includes("--json");
  const report = (msg) => {
    if (!jsonOnly) console.log(msg);
  };

  // 1. Load previous feed (preserve mint entry)
  let prev = { mint: null, x: [], linkedin: [] };
  try {
    prev = JSON.parse(fs.readFileSync(FEED_PATH, "utf-8"));
  } catch {
    report("! no existing feed file — starting fresh");
  }

  // 2. Connect to shared browser
  let browser;
  try {
    browser = await chromium.connectOverCDP("http://localhost:9333", { timeout: 15000 });
  } catch {
    console.error("ERROR: shared browser not running on localhost:9333. Start it with: node launch_linkedin.js");
    process.exit(1);
  }
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  async function retry(fn, label, minResults) {
    let out = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      report(`> pulling ${label} ... (attempt ${attempt})`);
      out = await fn(page);
      report(`  ${out.length} item(s)`);
      if (out.length >= minResults) break;
      await sleep(4000 + attempt * 2000);
    }
    return out;
  }

  report("> pulling @hack47org ...");
  const x = await retry(extractX, "@hack47org", 0);
  report(`  X total: ${x.length}`);

  report("> pulling /company/hack47 ...");
  const linkedin = await retry(extractLinkedIn, "/company/hack47", 1);
  report(`  LinkedIn total: ${linkedin.length}`);

  await page.close();
  await browser.close();

  // 3. Write feed — never clobber good data with a failed/empty pull.
  //    If an extraction comes back empty but we had posts before, keep the old ones
  //    (the only legit case for empty is a brand-new account with 0 posts).
  const now = new Date();
  const next = {
    updated: now.toISOString(),
    mint: (prev.mint && prev.mint.title ? prev.mint : null),
    x: x.length > 0 ? x : prev.x || [],
    linkedin: linkedin.length > 0 ? linkedin : prev.linkedin || [],
  };
  if (x.length === 0 && prev.x && prev.x.length > 0) {
    report("! X pull came back empty — kept previous " + prev.x.length + " post(s)");
  }
  if (linkedin.length === 0 && prev.linkedin && prev.linkedin.length > 0) {
    report("! LinkedIn pull came back empty — kept previous " + prev.linkedin.length + " post(s)");
  }

  const prevRaw = JSON.stringify(prev, null, 2);
  const nextRaw = JSON.stringify(next, null, 2);
  const changed = prevRaw !== nextRaw;

  fs.mkdirSync(path.dirname(FEED_PATH), { recursive: true });
  fs.writeFileSync(FEED_PATH, nextRaw + "\n");
  report(changed ? "> feed updated ✓" : "> feed unchanged (nothing new)");
  report("  wrote " + FEED_PATH);

  if (jsonOnly) {
    console.log(JSON.stringify({ changed, x: x.length, linkedin: linkedin.length, updated: next.updated }));
  }
  process.exit(0);
})().catch((e) => {
  console.error("FATAL:", e.message || e);
  process.exit(2);
});
