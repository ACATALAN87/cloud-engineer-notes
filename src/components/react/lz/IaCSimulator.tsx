import { useEffect, useRef, useState } from 'react';

/**
 * IaCSimulator
 *
 * Visual simulation of a Terraform-driven Landing-Zone deployment:
 *
 *   • Left column   — animated terminal-style log mimicking
 *                     `terraform validate → plan → apply` output.
 *   • Right column  — a 4×3 grid of "resources" that fade in one by one
 *                     as the simulated deployment progresses, plus a
 *                     governance / policy validation strip.
 *
 * The component is fully self-contained: state machine + setTimeouts.
 * It can be replayed, paused and reset. Honours reduced-motion.
 */

type LogLine = { kind: 'info' | 'ok' | 'warn' | 'cmd' | 'err'; text: string };

interface Resource {
  id:       string;
  label:    string;
  type:     'rg' | 'vnet' | 'firewall' | 'subnet' | 'kv' | 'log' | 'storage' | 'identity' | 'policy' | 'sql' | 'app' | 'private-link';
  accent:   string;
}

interface Check {
  id:    string;
  label: string;
  /** Status starts as pending; flips to passed during the simulation */
  delay: number;
}

const RESOURCES: Resource[] = [
  { id: 'rg-platform',   label: 'rg-platform',          type: 'rg',           accent: 'from-blue-400 to-cyan-400' },
  { id: 'vnet-hub',      label: 'vnet-hub',             type: 'vnet',         accent: 'from-blue-400 to-cyan-400' },
  { id: 'azfw',          label: 'azfw-hub',             type: 'firewall',     accent: 'from-amber-400 to-orange-500' },
  { id: 'subnet-shared', label: 'snet-shared',          type: 'subnet',       accent: 'from-blue-400 to-cyan-400' },
  { id: 'kv-platform',   label: 'kv-platform',          type: 'kv',           accent: 'from-emerald-400 to-teal-500' },
  { id: 'log-central',   label: 'log-platform',         type: 'log',          accent: 'from-cyan-400 to-emerald-400' },
  { id: 'st-tfstate',    label: 'sttfstate001',         type: 'storage',      accent: 'from-cyan-400 to-emerald-400' },
  { id: 'umi-deploy',    label: 'umi-terraform',        type: 'identity',     accent: 'from-rose-400 to-pink-500' },
  { id: 'policy-cis',    label: 'cis-baseline',         type: 'policy',       accent: 'from-violet-400 to-fuchsia-400' },
  { id: 'sql-prod',      label: 'sql-prod',             type: 'sql',          accent: 'from-blue-400 to-cyan-400' },
  { id: 'app-prod',      label: 'app-ecommerce-prod',   type: 'app',          accent: 'from-blue-400 to-cyan-400' },
  { id: 'pep-sql',       label: 'pep-sql-prod',         type: 'private-link', accent: 'from-emerald-400 to-teal-500' },
];

const CHECKS: Check[] = [
  { id: 'tags',     label: 'Tags requeridos (Environment, Owner, CostCenter)', delay: 1200 },
  { id: 'tls',      label: 'TLS 1.2 mínimo en Storage Accounts',               delay: 2400 },
  { id: 'pep',      label: 'Private Endpoints en SQL y Storage',               delay: 4200 },
  { id: 'region',   label: 'Recursos sólo en regiones autorizadas (westeurope)', delay: 5400 },
  { id: 'cmk',      label: 'Encryption con Customer Managed Keys en Key Vault', delay: 6800 },
  { id: 'rbac',     label: 'Asignaciones RBAC a grupos, no a usuarios',         delay: 8000 },
];

/** Build the full sequence of log lines with timestamps */
const LOG_TIMELINE: { at: number; line: LogLine }[] = [
  { at:   0,   line: { kind: 'cmd',  text: '$ terraform fmt -check && terraform validate' } },
  { at:   500, line: { kind: 'ok',   text: '✓ formatted · 14 .tf files validated' } },
  { at:   900, line: { kind: 'cmd',  text: '$ terraform init -backend-config=backend.tfvars' } },
  { at:  1200, line: { kind: 'info', text: 'Initializing modules… backend: azurerm (OIDC)' } },
  { at:  1500, line: { kind: 'cmd',  text: '$ terraform plan -out=tfplan' } },
  { at:  1800, line: { kind: 'info', text: 'Refreshing state from Azure Blob…' } },
  { at:  2200, line: { kind: 'ok',   text: 'Plan: 12 to add, 0 to change, 0 to destroy.' } },
  { at:  2600, line: { kind: 'cmd',  text: '$ terraform apply tfplan' } },
  { at:  3000, line: { kind: 'info', text: '→ creating rg-platform' } },
  { at:  3400, line: { kind: 'info', text: '→ creating vnet-hub' } },
  { at:  3800, line: { kind: 'info', text: '→ creating azfw-hub (Premium, ~4 min in real life)' } },
  { at:  4400, line: { kind: 'info', text: '→ creating snet-shared, kv-platform, log-platform…' } },
  { at:  5000, line: { kind: 'info', text: '→ assigning policy initiative cis-azure-baseline' } },
  { at:  5800, line: { kind: 'warn', text: 'Policy compliance scan in progress…' } },
  { at:  6600, line: { kind: 'info', text: '→ deploying spoke-prod resources (sql, app, private endpoints)' } },
  { at:  7800, line: { kind: 'ok',   text: 'Apply complete! Resources: 12 added, 0 changed, 0 destroyed.' } },
  { at:  8200, line: { kind: 'ok',   text: 'All policy checks passed ✓ — landing zone ready.' } },
];

const RESOURCE_REVEAL_INTERVAL = 480;
const TOTAL_DURATION           = 8500;

export default function IaCSimulator() {
  const [running, setRunning]   = useState(false);
  const [tick,    setTick]      = useState(0);     // ms elapsed
  const [done,    setDone]      = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const rafRef       = useRef<number | null>(null);

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startedAtRef.current = null;
    setTick(0);
    setRunning(false);
    setDone(false);
  };

  const run = () => {
    if (running) return;
    if (done) {
      reset();
      // start fresh on next frame
      setTimeout(() => start(), 50);
      return;
    }
    start();
  };

  const start = () => {
    setRunning(true);
    setDone(false);
    startedAtRef.current = performance.now() - tick;
    const loop = (now: number) => {
      const elapsed = now - (startedAtRef.current ?? now);
      if (elapsed >= TOTAL_DURATION) {
        setTick(TOTAL_DURATION);
        setRunning(false);
        setDone(true);
        return;
      }
      setTick(elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /** Lines visible right now */
  const visibleLines = LOG_TIMELINE.filter((l) => l.at <= tick);
  /** Resources revealed so far */
  const revealedCount = Math.min(
    RESOURCES.length,
    Math.floor(tick / RESOURCE_REVEAL_INTERVAL),
  );
  const revealedResources = RESOURCES.slice(0, revealedCount);
  /** Checks completed */
  const passedChecks = CHECKS.filter((c) => tick >= c.delay);

  const progress = Math.min(100, (tick / TOTAL_DURATION) * 100);

  return (
    <section className="relative border-b border-slate-800/60 py-20" style={{ backgroundColor: '#040818' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-10 max-w-2xl">
          <span className="eyebrow">Simulación · IaC en directo</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Despliegue <span className="text-gradient-static">paso a paso</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Pulsa <strong className="text-white">Deploy</strong> para lanzar una
            simulación visual de cómo un <code>terraform apply</code> aterriza
            la landing zone. Cada recurso aparece a medida que se crea y los
            governance checks se validan en paralelo.
          </p>
        </div>

        {/* Toolbar */}
        <div className="reveal mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            className="btn-primary"
            disabled={running}
          >
            {running ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"/>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"/>
                </span>
                <span>Desplegando…</span>
              </>
            ) : done ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                <span>Volver a desplegar</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Deploy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={reset}
            className="btn-ghost"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <span>Stop</span>
          </button>

          <div className="ml-auto flex w-full max-w-[260px] flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="reveal grid gap-5 lg:grid-cols-[1fr_1fr]">

          {/* === Left: terminal log === */}
          <div className="glass-card relative flex h-[420px] flex-col overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-slate-700/40 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60"/>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60"/>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60"/>
              <span className="ml-2 font-mono text-[10px] text-slate-500">
                terraform · landing-zone · main
              </span>
            </div>
            <div
              className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed"
              ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
            >
              {visibleLines.length === 0 && (
                <p className="text-slate-600">Esperando comando…<span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-slate-500 animate-blink-soft align-middle"/></p>
              )}
              {visibleLines.map((l, i) => (
                <p
                  key={i}
                  className={
                    l.line.kind === 'cmd'  ? 'text-blue-300 mt-2'
                    : l.line.kind === 'ok'   ? 'text-emerald-300'
                    : l.line.kind === 'warn' ? 'text-amber-300'
                    : l.line.kind === 'err'  ? 'text-rose-300'
                                              : 'text-slate-400'
                  }
                >
                  {l.line.text}
                </p>
              ))}
              {running && (
                <span className="inline-block h-3 w-1.5 translate-y-0.5 bg-blue-400 animate-blink-soft align-middle"/>
              )}
            </div>
          </div>

          {/* === Right: resources grid + checks === */}
          <div className="space-y-5">
            <div className="glass-card relative rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-300">
                  Recursos
                </h3>
                <span className="font-mono text-[10px] text-slate-500">
                  {revealedCount} / {RESOURCES.length}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {RESOURCES.map((r) => {
                  const isLive = revealedResources.some((x) => x.id === r.id);
                  return (
                    <div
                      key={r.id}
                      className={`relative flex h-20 flex-col items-center justify-center rounded-lg border p-2 text-center transition-all duration-300 ${
                        isLive
                          ? 'border-blue-500/40 bg-slate-800/60 opacity-100 scale-100'
                          : 'border-slate-700/40 bg-slate-800/20 opacity-40 scale-95'
                      }`}
                    >
                      <span
                        className={`mb-1 inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${r.accent} ${isLive ? 'text-white' : 'text-slate-400 grayscale'}`}
                        aria-hidden="true"
                      >
                        {iconFor(r.type)}
                      </span>
                      <p className="truncate w-full font-mono text-[9px] text-slate-300">
                        {r.label}
                      </p>
                      {isLive && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink-soft"/>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-300">
                Governance checks
              </h3>
              <ul className="mt-3 space-y-2">
                {CHECKS.map((c) => {
                  const passed = passedChecks.some((p) => p.id === c.id);
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-2.5 text-xs"
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                          passed ? 'bg-emerald-500/20' : 'bg-slate-700/40'
                        }`}
                        aria-hidden="true"
                      >
                        {passed ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-emerald-400">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500"/>
                        )}
                      </span>
                      <span className={passed ? 'text-slate-200' : 'text-slate-500'}>
                        {c.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Icons mapping ───────────────────────── */
function iconFor(type: Resource['type']) {
  const common = {
    viewBox: '0 0 24 24',
    fill:    'none',
    stroke:  'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-4 w-4',
    'aria-hidden': true,
  };
  switch (type) {
    case 'rg':
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/></svg>;
    case 'vnet':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18"/></svg>;
    case 'firewall':
      return <svg {...common}><path d="M3 3h18v6H3zM3 9h18v6H3zM3 15h18v6H3z"/></svg>;
    case 'subnet':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>;
    case 'kv':
      return <svg {...common}><path d="M21 11.5V8a4 4 0 0 0-4-4 4 4 0 0 0-4 4v4M3 11h12v10H3z"/></svg>;
    case 'log':
      return <svg {...common}><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>;
    case 'storage':
      return <svg {...common}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/></svg>;
    case 'identity':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>;
    case 'policy':
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'sql':
      return <svg {...common}><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12a8 3 0 0 0 16 0V6"/></svg>;
    case 'app':
      return <svg {...common}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
    case 'private-link':
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7 0l4-4a5 5 0 1 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-4 4a5 5 0 1 0 7 7l1-1"/></svg>;
  }
}
