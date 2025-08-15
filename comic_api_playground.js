// comicvine_playground.js
// Node 18+ (global fetch). Mess-around script for ComicVine.
//
// What it does:
// - searchCharacters(query)
// - getCharacterDetail(apiDetailUrl)  -> reads issue_credits
// - getAppearancesViaDetail(detailUrl, { from, to, limit }) -> hydrates issues
// - simple rate limiting + backoff
//


const API_KEY = "";
const BASE = "https://comicvine.gamespot.com/api";
if (!API_KEY) {
  console.error("Set COMICVINE_API_KEY env var first.");
  process.exit(1);
}

// ---- tiny utils ------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// polite global rate limiter: 1 request/second (burst-safe)
let lastHit = 0;
async function throttle() {
  const now = Date.now();
  const elapsed = now - lastHit;
  const minGap = 1100; // ~1.1s between requests
  if (elapsed < minGap) await sleep(minGap - elapsed);
  lastHit = Date.now();
}

// basic fetch wrapper with retry/backoff on 429/5xx
async function cvFetch(url, params = {}, fieldList = "") {
  const u = new URL(url.startsWith("http") ? url : `${BASE}${url}`);
  u.searchParams.set("api_key", API_KEY);
  u.searchParams.set("format", "json");
  if (fieldList) u.searchParams.set("field_list", fieldList);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }

  let attempt = 0;
  while (true) {
    await throttle();
    const res = await fetch(u.toString(), {
      headers: {
        // Keeping UA simple; customize if you want.
        "User-Agent": "ComicHunt-Playground/0.1 (+node)",
        "Accept": "application/json",
      },
    });

    // Retry on rate-limit or transient errors
    if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
      attempt++;
      const backoff = Math.min(8000, 500 * 2 ** attempt);
      console.warn(`HTTP ${res.status} → backing off ${backoff}ms for ${u.pathname}`);
      await sleep(backoff);
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`ComicVine error ${res.status} for ${u.pathname}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    // ComicVine wraps payloads: { status_code, error, number_of_total_results, results }.
    if (json.error && json.error !== "OK") {
      throw new Error(`ComicVine API error: ${json.error}`);
    }
    return json;
  }
}

// normalize a few fields so your UI/code is provider-agnostic
function slimIssue(cvIssue) {
  return {
    id: cvIssue.id, // numeric id
    guid: cvIssue.guid || cvIssue.api_detail_url?.split("/").filter(Boolean).pop(), // e.g., 4000-12345
    title: cvIssue.name || "",
    issueNumber: Number(cvIssue.issue_number) || null,
    series: cvIssue.volume?.name || "",
    coverDate: cvIssue.cover_date || null,
    url: cvIssue.site_detail_url || cvIssue.api_detail_url || null,
  };
}

function withinRange(isoDate, from, to) {
  if (!isoDate) return false;
  const t = new Date(isoDate).getTime();
  if (Number.isNaN(t)) return false;
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime()) return false;
  return true;
}

// ---- API helpers -----------------------------------------------------------

// 1) Search for characters by name (disambiguation)
async function searchCharacters(query, limit = 8) {
  const params = {
    query,
    resources: "character",
    limit,
  };
  // Using /search gives fuzzy matching; /characters with filter=name: is stricter.
  const json = await cvFetch("/search/", params, "id,name,api_detail_url,site_detail_url,publisher");
  const results = (json.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    apiDetailUrl: r.api_detail_url, // we’ll use this to fetch detail
    siteUrl: r.site_detail_url,
    publisher: r.publisher?.name || null,
  }));
  return results;
}

// 2) Get character detail (issue_credits lives here)
async function getCharacterDetail(apiDetailUrl) {
  const json = await cvFetch(apiDetailUrl, {}, "id,name,issue_credits,first_appeared_in_issue,count_of_issue_appearances");
  return json.results;
}

// 3) Hydrate a single issue by GUID or by id (we prefer api_detail_url if present)
async function getIssueByGuidOrId(issueRef) {
  if (issueRef.api_detail_url) {
    const j = await cvFetch(issueRef.api_detail_url, {}, "id,guid,name,issue_number,cover_date,volume,site_detail_url,api_detail_url");
    return slimIssue(j.results);
  }
  const guid = typeof issueRef === "string" ? issueRef : issueRef.guid || `4000-${issueRef.id}`;
  const j = await cvFetch(`/issue/${guid}/`, {}, "id,guid,name,issue_number,cover_date,volume,site_detail_url,api_detail_url");
  return slimIssue(j.results);
}

// 4) Appearances via character detail → hydrate top N issues, then filter by date range locally.
//    (This avoids relying on provider-specific filters that may vary by endpoint.)
async function getAppearancesViaDetail(characterDetail, { from, to, limit = 12 } = {}) {
  const credits = Array.isArray(characterDetail.issue_credits) ? characterDetail.issue_credits : [];
  const slice = credits.slice(0, limit); // for messing around; increase carefully due to rate limit
  const out = [];
  for (const ref of slice) {
    try {
      const issue = await getIssueByGuidOrId(ref);
      if (!from && !to) out.push(issue);
      else if (withinRange(issue.coverDate, from, to)) out.push(issue);
    } catch (e) {
      console.warn("Issue hydration failed:", e.message);
    }
  }
  return out;
}

// ---- CLI demo --------------------------------------------------------------

async function demo() {
  const [,, nameArg, fromArg, toArg, limitArg] = process.argv;
  const query = nameArg || "supergirl";
  const from = fromArg || null;           // e.g "2000-01-01"
  const to   = toArg   || null;           // e.g "2010-12-31"
  const limit = Number(limitArg || 12);   // how many issues to hydrate (beware rate limit)

  console.log(`🔎 Searching for character: "${query}"`);
  const chars = await searchCharacters(query, 6);
  if (!chars.length) {
    console.log("No characters found.");
    return;
  }

  // Pick the first result for simplicity
  const pick = chars[0];
  console.log(`👤 Picked: ${pick.name} ${pick.publisher ? `(${pick.publisher})` : ""}`);
  console.log(`   api_detail_url: ${pick.apiDetailUrl}`);

  console.log("📄 Fetching character detail...");
  const detail = await getCharacterDetail(pick.apiDetailUrl);

  const total = detail.count_of_issue_appearances ?? (detail.issue_credits?.length || 0);
  console.log(`   Reported appearances: ${total} (Fecthing up to ${limit} for this demo)`);

  console.log(`📚 Fetching issues${from || to ? ` between ${from || "…"} and ${to || "…"}"` : ""} ...`);
  const issues = await getAppearancesViaDetail(detail, { from, to, limit });

  if (!issues.length) {
    console.log("No hydrated issues in range (might need a higher limit or different dates).");
    return;
  }

  // Sort by coverDate ascending
  issues.sort((a, b) => (a.coverDate || "").localeCompare(b.coverDate || ""));

  // Print a tiny table
  console.log("\n# Appearances (hydrated)");
  for (const it of issues) {
    const line = [
      it.coverDate?.slice(0, 10) || "????-??-??",
      `${it.series || "Unknown Series"} #${it.issueNumber ?? "?"}`,
      it.title ? `— ${it.title}` : "",
      it.url ? `\n   ${it.url}` : "",
    ].join(" ");
    console.log("•", line);
  }

  const aiContext = issues.map((i) => ({
    id: i.id,
    guid: i.guid,
    series: i.series,
    issueNumber: i.issueNumber,
    coverDate: i.coverDate,
    title: i.title,
  }));
  console.log("\n Recent Appearance:");
  console.dir(aiContext.slice(0, 5), { depth: null });
}

// Run if called directly
if (require.main === module) {
  demo().catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  });
}

module.exports = {
  searchCharacters,
  getCharacterDetail,
  getAppearancesViaDetail,
  getIssueByGuidOrId,
};
