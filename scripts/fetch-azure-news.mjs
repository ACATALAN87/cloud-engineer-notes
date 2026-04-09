/**
 * fetch-azure-news.mjs
 *
 * Fetches the latest post from the Azure Blog RSS feed at build time
 * and writes it to src/data/azure-news.json.
 *
 * To switch to a different source in the future, just replace FEED_URL
 * and adjust the XML field mappings in parseItems() below.
 *
 * Possible future sources:
 *   - Azure Updates:  https://www.microsoft.com/en-us/updates/feed/?product=azure
 *   - Azure Blog:     https://azure.microsoft.com/en-us/blog/feed/
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE  = resolve(__dirname, '../src/data/azure-news.json');
const OUT_DIR   = dirname(OUT_FILE);

// ─── Source configuration ─────────────────────────────────────────────────────

const SOURCES = {
  'azure-blog': {
    url:   'https://azure.microsoft.com/en-us/blog/feed/',
    label: 'Azure Blog',
  },
  'azure-updates': {
    url:   'https://www.microsoft.com/en-us/updates/feed/?product=azure',
    label: 'Azure Updates',
  },
};

// Active source — change this key to switch source with zero other changes
const ACTIVE_SOURCE = 'azure-blog';

// ─── RSS parser (no external dependencies) ────────────────────────────────────

/**
 * Extracts the text content of the first occurrence of <tagName> inside a
 * given XML string. CDATA sections are unwrapped automatically.
 */
function extractTag(xml, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tagName}>`, 's');
  const m  = xml.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Returns an array of raw <item> XML strings from the feed.
 */
function extractItems(xml) {
  const items = [];
  const re    = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let   m;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);
  return items;
}

/**
 * Parses raw item XML into a normalised NewsItem object.
 *
 * @typedef {{ title: string, url: string, publishedAt: string, source: string }} NewsItem
 * @param {string} itemXml
 * @param {string} sourceLabel
 * @returns {NewsItem | null}
 */
function parseItem(itemXml, sourceLabel) {
  const title = extractTag(itemXml, 'title');
  const url   = extractTag(itemXml, 'link') ?? extractTag(itemXml, 'guid');
  const date  = extractTag(itemXml, 'pubDate') ?? extractTag(itemXml, 'dc:date');

  if (!title || !url) return null;

  return {
    title,
    url,
    publishedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
    source:      sourceLabel,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { url, label } = SOURCES[ACTIVE_SOURCE];

  console.log(`[fetch-azure-news] Fetching: ${url}`);

  let xml;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AstroPortfolio/1.0 (build-time RSS reader)' },
      signal:  AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.warn(`[fetch-azure-news] Could not fetch feed: ${err.message}`);
    console.warn('[fetch-azure-news] Writing empty fallback to preserve build.');
    writeOutput(null);
    return;
  }

  const items = extractItems(xml);
  if (items.length === 0) {
    console.warn('[fetch-azure-news] No <item> elements found in feed.');
    writeOutput(null);
    return;
  }

  // We store the latest N items so the data layer is ready for a /news page.
  // The hero only consumes items[0], but the full list is available.
  const MAX_ITEMS = 10;
  const parsed = items
    .slice(0, MAX_ITEMS)
    .map((i) => parseItem(i, label))
    .filter(Boolean);

  if (parsed.length === 0) {
    console.warn('[fetch-azure-news] Could not parse any items.');
    writeOutput(null);
    return;
  }

  console.log(`[fetch-azure-news] Parsed ${parsed.length} item(s). Latest: "${parsed[0].title}"`);
  writeOutput(parsed);
}

/**
 * @param {NewsItem[] | null} items
 */
function writeOutput(items) {
  mkdirSync(OUT_DIR, { recursive: true });
  /** @type {{ fetchedAt: string, latest: NewsItem | null, items: NewsItem[] }} */
  const output = {
    fetchedAt: new Date().toISOString(),
    latest:    items?.[0] ?? null,
    items:     items ?? [],
  };
  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`[fetch-azure-news] Written to ${OUT_FILE}`);
}

main();
