/**
 * fetch-azure-news.mjs
 *
 * Fetches recent posts from the Azure Blog RSS feed and:
 *   1. Updates src/data/azure-news.json  (used by future /news page)
 *   2. Generates Azure News blog posts in src/content/blog/
 *
 * Each generated post follows the editorial template:
 *   ## Summary · ## Why it matters · ## Enterprise perspective · ## Official source
 *
 * To switch source, change ACTIVE_SOURCE below.
 * To generate more posts, increase MAX_POSTS_TO_GENERATE.
 *
 * Usage:
 *   node scripts/fetch-azure-news.mjs
 *   npm run news        (manual run)
 *   prebuild hook runs it automatically before every build
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname }                                   from 'node:path';
import { fileURLToPath }                                      from 'node:url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR   = resolve(__dirname, '../src/content/blog');
const DATA_FILE  = resolve(__dirname, '../src/data/azure-news.json');
const DATA_DIR   = dirname(DATA_FILE);

// ─── Configuration ────────────────────────────────────────────────────────────

const SOURCES = {
  'azure-blog': {
    url:        'https://azure.microsoft.com/en-us/blog/feed/',
    label:      'Azure Blog',
    sourceName: 'Microsoft Azure Blog',
  },
  'azure-updates': {
    url:        'https://www.microsoft.com/en-us/updates/feed/?product=azure',
    label:      'Azure Updates',
    sourceName: 'Microsoft Azure Updates',
  },
};

const ACTIVE_SOURCE        = 'azure-blog';
const MAX_ITEMS_TO_STORE   = 10;  // stored in azure-news.json
const MAX_POSTS_TO_GENERATE = 1;  // posts created in blog — increase when ready

// ─── XML helpers (zero external deps) ────────────────────────────────────────

function extractTag(xml, tagName) {
  const re = new RegExp(
    `<${tagName}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tagName}>`,
    's'
  );
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

function extractItems(xml) {
  const items = [];
  const re    = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let   m;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);
  return items;
}

/**
 * @typedef {{ title: string, url: string, publishedAt: string, source: string }} NewsItem
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

// ─── Slug & duplicate detection ───────────────────────────────────────────────

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+$/, '');
}

/** Returns the set of sourceUrls already present in blog posts */
function existingSourceUrls() {
  if (!existsSync(BLOG_DIR)) return new Set();
  const urls = new Set();
  for (const file of readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md')) continue;
    const content = require('node:fs').readFileSync(resolve(BLOG_DIR, file), 'utf-8');
    const m = content.match(/sourceUrl:\s*["']?(.+?)["']?\n/);
    if (m) urls.add(m[1].trim());
  }
  return urls;
}

// ─── Markdown generator ───────────────────────────────────────────────────────

/**
 * Builds the editorial body for an Azure News post.
 * Uses paraphrase + structured sections — never copies full paragraphs.
 */
function buildBody(item) {
  const date = new Date(item.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return `## Summary

Microsoft Azure published a new update on ${date}: **${item.title}**.

This post covers a recent announcement from the Azure Blog. For the full details, refer to the official source linked below.

## Why it matters

Staying current with Azure announcements is part of working effectively in cloud environments. Each update — whether a new service capability, a platform change, or an architectural guidance — can have direct implications for infrastructure design, platform operations, or cost management.

## Enterprise perspective

When evaluating any Azure platform update, the key questions are:

- Does this affect existing infrastructure or running workloads?
- Is there an action required (migration, configuration change, deprecation)?
- Does it open new architectural options worth evaluating in the platform roadmap?
- What are the security, governance or compliance implications, if any?

Apply a structured review before adopting new capabilities in production environments.

## Official source

Read the full announcement on the Azure Blog:

[${item.title}](${item.url})

> Source: ${item.source} — ${date}
`;
}

/**
 * Writes a single markdown blog post for the given news item.
 * @param {NewsItem} item
 * @param {string}   sourceName
 * @returns {string} file path written
 */
function generatePost(item, sourceName) {
  mkdirSync(BLOG_DIR, { recursive: true });

  const slug     = `azure-news-${toSlug(item.title)}`;
  const filePath = resolve(BLOG_DIR, `${slug}.md`);
  const dateStr  = item.publishedAt.split('T')[0]; // YYYY-MM-DD

  const frontmatter = `---
title: "Azure News: ${item.title.replace(/"/g, "'")}"
description: "Technical brief on a recent Microsoft Azure update: ${item.title.replace(/"/g, "'").slice(0, 80)}."
date: ${dateStr}
draft: false
category: "Azure News"
tags: ["Azure", "Microsoft", "Cloud News"]
sourceUrl: "${item.url}"
sourceName: "${sourceName}"
autogenerated: true
---

`;

  writeFileSync(filePath, frontmatter + buildBody(item), 'utf-8');
  return filePath;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { url, label, sourceName } = SOURCES[ACTIVE_SOURCE];

  console.log(`[azure-news] Source: ${label}`);
  console.log(`[azure-news] Fetching: ${url}`);

  let xml;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AstroPortfolio/1.0 (build-time RSS reader)' },
      signal:  AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.warn(`[azure-news] ⚠ Fetch failed: ${err.message}`);
    console.warn('[azure-news] Keeping existing data. Build will continue.');
    return;
  }

  const rawItems = extractItems(xml);
  if (rawItems.length === 0) {
    console.warn('[azure-news] ⚠ No <item> elements found in feed.');
    return;
  }

  const items = rawItems
    .slice(0, MAX_ITEMS_TO_STORE)
    .map((i) => parseItem(i, label))
    .filter(Boolean);

  if (items.length === 0) {
    console.warn('[azure-news] ⚠ Could not parse any items.');
    return;
  }

  // ── 1. Update azure-news.json ──────────────────────────────────────────────
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    latest:    items[0],
    items,
  }, null, 2), 'utf-8');
  console.log(`[azure-news] ✓ azure-news.json updated (${items.length} items)`);

  // ── 2. Generate blog posts (skip duplicates) ───────────────────────────────
  const existing    = existingSourceUrls();
  const toGenerate  = items
    .filter((item) => !existing.has(item.url))
    .slice(0, MAX_POSTS_TO_GENERATE);

  if (toGenerate.length === 0) {
    console.log('[azure-news] ✓ No new posts to generate (all already exist).');
    return;
  }

  for (const item of toGenerate) {
    const filePath = generatePost(item, sourceName);
    console.log(`[azure-news] ✓ Generated post: ${filePath}`);
  }
}

// ─── Node.js require shim for readFileSync in ESM ────────────────────────────
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

main().catch((err) => {
  console.error('[azure-news] ✗ Unexpected error:', err);
  // Do NOT exit with code 1 — must not break the build
});
