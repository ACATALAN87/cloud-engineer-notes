/**
 * suggest-labs.mjs
 *
 * Generates draft lab files in src/content/labs/ based on a predefined
 * catalogue of curated ideas from official sources (Microsoft Learn,
 * Azure Architecture Center, HashiCorp Learn).
 *
 * IMPORTANT: Drafts are generated with `draft: true` — they are NEVER
 * published automatically. Review and edit each file before setting
 * draft: false.
 *
 * Usage:
 *   node scripts/suggest-labs.mjs              → list available ideas
 *   node scripts/suggest-labs.mjs --generate   → write all missing drafts
 *   node scripts/suggest-labs.mjs --generate --id azure-private-endpoint
 *
 * Output: src/content/labs/<slug>.md  (draft: true)
 */

import { writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname }                                  from 'node:path';
import { fileURLToPath }                                     from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LABS_DIR  = resolve(__dirname, '../src/content/labs');

// ─── Lab catalogue ────────────────────────────────────────────────────────────

/**
 * @typedef {{
 *   id:          string,
 *   title:       string,
 *   description: string,
 *   difficulty:  'beginner'|'intermediate'|'advanced',
 *   labType:     'hands-on'|'architecture'|'devops'|'security',
 *   stack:       string[],
 *   source:      string,
 *   sourceName:  string,
 *   outline:     string[],
 * }} LabIdea
 */

/** @type {LabIdea[]} */
const LAB_CATALOGUE = [
  {
    id:          'azure-private-endpoint',
    title:       'Lab — Azure Private Endpoint for Storage Account',
    description: 'Configuring a Private Endpoint to expose an Azure Storage Account exclusively over a private IP within a VNet, disabling public access and validating DNS resolution.',
    difficulty:  'intermediate',
    labType:     'hands-on',
    stack:       ['Terraform', 'Azure', 'Azure Networking', 'Private Endpoint', 'Azure DNS'],
    source:      'https://learn.microsoft.com/en-us/azure/private-link/create-private-endpoint-terraform',
    sourceName:  'Microsoft Learn',
    outline: [
      '## Objective',
      '## Architecture overview',
      '## Implementation',
      '### Resource group and VNet',
      '### Storage Account with public access disabled',
      '### Private Endpoint and NIC',
      '### Private DNS Zone and VNet link',
      '### Validation with nslookup / dig',
      '## Key considerations',
      '## Troubleshooting',
      '## What I learned',
      '## Source',
    ],
  },
  {
    id:          'terraform-remote-state-azure',
    title:       'Lab — Terraform Remote State on Azure Blob Storage',
    description: 'Setting up a secure Terraform remote backend on Azure Blob Storage with state locking, versioning and access control via managed identity.',
    difficulty:  'intermediate',
    labType:     'hands-on',
    stack:       ['Terraform', 'Azure', 'Azure Storage', 'Managed Identity'],
    source:      'https://developer.hashicorp.com/terraform/language/backend/azurerm',
    sourceName:  'HashiCorp Docs',
    outline: [
      '## Objective',
      '## Architecture overview',
      '## Implementation',
      '### Bootstrap storage account and container',
      '### Backend configuration block',
      '### State locking behaviour',
      '### Managed identity access vs. storage key',
      '## Key considerations',
      '## Troubleshooting',
      '## What I learned',
      '## Source',
    ],
  },
  {
    id:          'azure-devops-terraform-pipeline',
    title:       'Lab — Terraform CI/CD pipeline with Azure DevOps',
    description: 'Building a multi-stage Azure DevOps pipeline for Terraform: validate, plan on PR and apply on merge to main, with approval gates and environment separation.',
    difficulty:  'intermediate',
    labType:     'devops',
    stack:       ['Terraform', 'Azure DevOps', 'CI/CD', 'Azure', 'YAML'],
    source:      'https://learn.microsoft.com/en-us/azure/developer/terraform/devops-testing-overview',
    sourceName:  'Microsoft Learn',
    outline: [
      '## Objective',
      '## Architecture overview',
      '## Implementation',
      '### Service connection and service principal',
      '### Pipeline structure: validate / plan / apply',
      '### Environment and approval gates',
      '### Handling plan output as artifact',
      '## Key considerations',
      '## Troubleshooting',
      '## What I learned',
      '## Source',
    ],
  },
  {
    id:          'azure-rbac-least-privilege',
    title:       'Lab — RBAC least-privilege design for a platform team',
    description: 'Designing and implementing a least-privilege RBAC model in Azure for a platform engineering team: custom roles, management group scope, PIM eligibility and audit.',
    difficulty:  'advanced',
    labType:     'security',
    stack:       ['Azure', 'Azure RBAC', 'Terraform', 'Azure Policy', 'PIM'],
    source:      'https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices',
    sourceName:  'Microsoft Learn',
    outline: [
      '## Objective',
      '## Architecture overview',
      '## Implementation',
      '### Role taxonomy: platform vs. workload',
      '### Custom role definition with Terraform',
      '### Assignment at management group scope',
      '### PIM eligibility for sensitive roles',
      '### Azure Policy for guardrails',
      '## Key considerations',
      '## Troubleshooting',
      '## What I learned',
      '## Source',
    ],
  },
  {
    id:          'azure-monitor-alerts-terraform',
    title:       'Lab — Azure Monitor alerts and action groups with Terraform',
    description: 'Provisioning metric alerts, log query alerts and action groups in Azure Monitor using Terraform for a standardised observability baseline.',
    difficulty:  'intermediate',
    labType:     'hands-on',
    stack:       ['Terraform', 'Azure', 'Azure Monitor', 'Log Analytics'],
    source:      'https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-overview',
    sourceName:  'Microsoft Learn',
    outline: [
      '## Objective',
      '## Architecture overview',
      '## Implementation',
      '### Log Analytics workspace',
      '### Action group (email + webhook)',
      '### Metric alert: CPU threshold on VM',
      '### Log query alert: failed login attempts',
      '### Diagnostic settings on resources',
      '## Key considerations',
      '## Troubleshooting',
      '## What I learned',
      '## Source',
    ],
  },
  {
    id:          'github-actions-azure-oidc',
    title:       'Lab — Keyless Azure deployments with GitHub Actions and OIDC',
    description: 'Configuring federated identity (OIDC) between GitHub Actions and Azure to deploy infrastructure without storing long-lived credentials as secrets.',
    difficulty:  'intermediate',
    labType:     'devops',
    stack:       ['GitHub Actions', 'Azure', 'OIDC', 'Terraform', 'Managed Identity'],
    source:      'https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-azure',
    sourceName:  'GitHub Docs',
    outline: [
      '## Objective',
      '## Architecture overview',
      '## Implementation',
      '### App registration and federated credential',
      '### GitHub Actions workflow with azure/login',
      '### Terraform provider with OIDC token',
      '### Scoping permissions to minimum required',
      '## Key considerations',
      '## Troubleshooting',
      '## What I learned',
      '## Source',
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function existingSlugs() {
  if (!existsSync(LABS_DIR)) return new Set();
  return new Set(
    readdirSync(LABS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  );
}

function today() {
  return new Date().toISOString().split('T')[0];
}

/** @param {LabIdea} idea */
function generateDraft(idea) {
  const frontmatter = `---
title: "${idea.title}"
description: "${idea.description}"
date: ${today()}
draft: true
stack: [${idea.stack.map((s) => `"${s}"`).join(', ')}]
difficulty: "${idea.difficulty}"
labType: "${idea.labType}"
source: "${idea.source}"
sourceName: "${idea.sourceName}"
---

> **Draft** — This file was generated by \`scripts/suggest-labs.mjs\`.
> Fill in each section before setting \`draft: false\`.

`;

  const body = idea.outline
    .map((heading) => `${heading}\n\n<!-- TODO -->\n`)
    .join('\n');

  return frontmatter + body;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const doGenerate = args.includes('--generate');
const targetId   = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;

const existing = existingSlugs();

const ideas = targetId
  ? LAB_CATALOGUE.filter((l) => l.id === targetId)
  : LAB_CATALOGUE;

if (ideas.length === 0 && targetId) {
  console.error(`[suggest-labs] ✗ No idea found with id "${targetId}"`);
  console.log('[suggest-labs] Available ids:', LAB_CATALOGUE.map((l) => l.id).join(', '));
  process.exit(1);
}

console.log('\n[suggest-labs] Lab catalogue\n');
console.log(
  ideas
    .map((idea) => {
      const exists = existing.has(idea.id) ? '✓ exists' : '○ not created';
      return `  ${exists.padEnd(12)} [${idea.labType}] [${idea.difficulty}]  ${idea.id}`;
    })
    .join('\n')
);
console.log('');

if (!doGenerate) {
  console.log('[suggest-labs] Run with --generate to create draft files.\n');
  process.exit(0);
}

mkdirSync(LABS_DIR, { recursive: true });

let created = 0;
let skipped = 0;

for (const idea of ideas) {
  const filePath = resolve(LABS_DIR, `${idea.id}.md`);
  if (existing.has(idea.id)) {
    console.log(`[suggest-labs] ↷ Skip (exists): ${idea.id}.md`);
    skipped++;
    continue;
  }
  writeFileSync(filePath, generateDraft(idea), 'utf-8');
  console.log(`[suggest-labs] ✓ Draft created: ${filePath}`);
  created++;
}

console.log(`\n[suggest-labs] Done — ${created} created, ${skipped} skipped.\n`);
