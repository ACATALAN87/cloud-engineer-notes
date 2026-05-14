import { useEffect, useRef, useState } from 'react';

/**
 * DeploymentTimeline
 *
 * Animated 7-step landing-zone deployment timeline.
 *
 * Two modes:
 *   1. Manual: user clicks any step to jump to it.
 *   2. Auto: a "Play" button advances each step every ~1.8s with a
 *      progress bar visualisation.
 *
 * Each step shows:
 *   - A short label + a single-sentence outcome.
 *   - A Terraform-like code preview that morphs as you change steps.
 *   - Status pills (Pending → Provisioning → Done).
 *
 * Designed to feel like watching `terraform apply` in slow motion.
 */

interface Step {
  id:        string;
  label:     string;
  outcome:   string;
  accent:    string;
  glow:      string;
  /** Code snippet shown in the right preview. Kept short, illustrative. */
  code:      string;
  /** What the step "creates" — used by the status chips */
  resources: string[];
  icon:      React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: 'mg',
    label: 'Management Groups',
    outcome: 'Jerarquía CAF: Platform, Landing Zones, Sandbox.',
    accent: 'from-violet-400 to-fuchsia-400',
    glow: 'rgba(168, 85, 247, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="6" rx="1"/>
        <rect x="3" y="15" width="7" height="6" rx="1"/>
        <rect x="14" y="15" width="7" height="6" rx="1"/>
        <path d="M7 9v3M17 9v3M7 12h10"/>
      </svg>
    ),
    code: `resource "azurerm_management_group" "platform" {
  display_name = "Platform"
  parent_management_group_id = data.tenant.id
}`,
    resources: ['mg-platform', 'mg-landing-zones', 'mg-sandbox'],
  },
  {
    id: 'policies',
    label: 'Policies',
    outcome: 'Iniciativas que se cascadean por la jerarquía.',
    accent: 'from-fuchsia-400 to-pink-400',
    glow: 'rgba(217, 70, 239, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="m9 15 2 2 4-4"/>
      </svg>
    ),
    code: `resource "azurerm_policy_set_definition" "cis_baseline" {
  name        = "cis-azure-baseline"
  policy_type = "Custom"
}`,
    resources: ['cis-baseline', 'require-tags', 'allowed-regions', 'enforce-tls'],
  },
  {
    id: 'network',
    label: 'Networking',
    outcome: 'Hub VNet + spokes peerados + Azure Firewall.',
    accent: 'from-blue-400 to-cyan-400',
    glow: 'rgba(59, 130, 246, 0.4)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18"/>
      </svg>
    ),
    code: `module "hub" {
  source              = "./modules/hub-network"
  address_space       = "10.0.0.0/16"
  enable_firewall     = true
  enable_bastion      = true
}`,
    resources: ['vnet-hub', 'azfw-hub', 'bastion-hub', 'private-dns-zones'],
  },
  {
    id: 'identity',
    label: 'Identity',
    outcome: 'Entra ID groups, RBAC roles, PIM y Conditional Access.',
    accent: 'from-rose-400 to-pink-500',
    glow: 'rgba(244, 63, 94, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>
      </svg>
    ),
    code: `resource "azuread_group" "platform_owners" {
  display_name     = "platform-owners"
  security_enabled = true
}`,
    resources: ['platform-owners', 'platform-readers', 'pim-role-assignments'],
  },
  {
    id: 'monitor',
    label: 'Monitoring',
    outcome: 'Log Analytics central + diagnostic settings baseline.',
    accent: 'from-cyan-400 to-emerald-400',
    glow: 'rgba(34, 211, 238, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18"/>
        <path d="M7 14l4-4 4 4 5-5"/>
      </svg>
    ),
    code: `resource "azurerm_log_analytics_workspace" "central" {
  name                = "log-platform-mgmt"
  sku                 = "PerGB2018"
  retention_in_days   = 90
}`,
    resources: ['log-platform-mgmt', 'activity-log-diag', 'nsg-flow-logs'],
  },
  {
    id: 'security',
    label: 'Security',
    outcome: 'Defender for Cloud, Key Vault y enforcement de TLS.',
    accent: 'from-emerald-400 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.4)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    code: `resource "azurerm_security_center_subscription_pricing" "csp" {
  for_each      = toset(local.subscriptions)
  tier          = "Standard"
  resource_type = "VirtualMachines"
}`,
    resources: ['defender-csp', 'kv-platform', 'kv-cmk', 'tls-enforcement'],
  },
  {
    id: 'workloads',
    label: 'Workloads',
    outcome: 'Las aplicaciones aterrizan sobre la plataforma.',
    accent: 'from-amber-400 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.4)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    code: `module "spoke_prod" {
  source         = "./modules/spoke-network"
  workload       = "ecommerce"
  environment    = "prod"
  address_space  = "10.20.0.0/16"
  hub_vnet_id    = module.hub.vnet_id
}`,
    resources: ['vnet-prod', 'app-service-prod', 'sql-prod', 'storage-prod'],
  },
];

const PLAY_INTERVAL = 1800;

export default function DeploymentTimeline() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing,   setPlaying]   = useState(false);
  /** Steps that have been "applied" — used to render persistent done states */
  const [doneUpTo,  setDoneUpTo]  = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((i) => {
        setDoneUpTo((d) => Math.max(d, i));
        if (i + 1 >= STEPS.length) {
          setPlaying(false);
          setDoneUpTo(STEPS.length - 1);
          return i;
        }
        return i + 1;
      });
    }, PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (doneUpTo >= STEPS.length - 1) {
      // Restart from scratch
      setActiveIdx(0);
      setDoneUpTo(-1);
    }
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setActiveIdx(0);
    setDoneUpTo(-1);
  };

  const handlePick = (i: number) => {
    setPlaying(false);
    setActiveIdx(i);
  };

  const step = STEPS[activeIdx];
  const stepStatus = (i: number): 'pending' | 'active' | 'done' => {
    if (i <= doneUpTo) return 'done';
    if (i === activeIdx) return 'active';
    return 'pending';
  };

  return (
    <section className="relative border-b border-slate-800/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-10 max-w-2xl">
          <span className="eyebrow">Flujo de despliegue</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Cómo se <span className="text-gradient-static">construye</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Siete fases declarativas que se ejecutan desde Terraform. Pulsa
            <strong className="text-white"> Play</strong> y observa cómo la
            plataforma se materializa paso a paso.
          </p>
        </div>

        {/* Toolbar */}
        <div className="reveal mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePlay}
            className="btn-primary"
            aria-label={playing ? 'Pausar' : 'Reproducir despliegue'}
          >
            {playing ? (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1"/>
                  <rect x="14" y="5" width="4" height="14" rx="1"/>
                </svg>
                <span>Pausar</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>{doneUpTo >= STEPS.length - 1 ? 'Reiniciar' : 'Play'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost"
            aria-label="Reiniciar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span>Reset</span>
          </button>
          <span className="ml-auto font-mono text-xs text-slate-500">
            Step <strong className="text-white">{activeIdx + 1}</strong> · {STEPS.length}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* === Steps list === */}
          <ol className="reveal flex flex-col gap-2" aria-label="Pasos del despliegue">
            {STEPS.map((s, i) => {
              const status = stepStatus(i);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handlePick(i)}
                    className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      status === 'active'
                        ? 'border-blue-400/60 bg-blue-500/10'
                        : status === 'done'
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-500'
                    }`}
                    aria-current={status === 'active' ? 'step' : undefined}
                  >
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.accent} text-white`}
                      style={{ boxShadow: `0 4px 12px -4px ${s.glow}` }}
                      aria-hidden="true"
                    >
                      <span className="h-[18px] w-[18px]">{s.icon}</span>
                    </span>
                    <span className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        <span className="font-mono text-xs text-slate-500 mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{s.outcome.slice(0, 38)}{s.outcome.length > 38 ? '…' : ''}</p>
                    </span>
                    <span aria-hidden="true">
                      {status === 'done' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-400">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {status === 'active' && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"/>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-400"/>
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="block h-2.5 w-2.5 rounded-full bg-slate-700"/>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* === Active step detail === */}
          <div className="reveal grid gap-5 sm:grid-cols-2">

            {/* Outcome card */}
            <div className="glass-card flex flex-col rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.accent} text-white`}
                  style={{ boxShadow: `0 8px 20px -6px ${step.glow}` }}
                  aria-hidden="true"
                >
                  <span className="h-6 w-6">{step.icon}</span>
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Fase {activeIdx + 1} / {STEPS.length}
                  </p>
                  <p className="text-lg font-bold text-white">{step.label}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {step.outcome}
              </p>

              <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Recursos creados
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {step.resources.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-700/60 bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                  >
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-blink-soft"/>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Terraform preview */}
            <div className="glass-card relative flex flex-col overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-slate-700/40 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60"/>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60"/>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60"/>
                <span className="ml-2 font-mono text-[10px] text-slate-500">
                  {step.id}.tf · terraform plan
                </span>
              </div>
              <pre
                key={step.id}    /* Key bump forces remount → CSS fade animation */
                className="flex-1 overflow-x-auto px-4 py-3 font-mono text-[11px] leading-snug text-slate-300 animate-fade-in"
              >
                <code>{step.code}</code>
              </pre>
              <div className="border-t border-slate-700/40 px-4 py-2 font-mono text-[10px] text-emerald-300">
                <span className="text-slate-500">$</span> apply complete · {step.resources.length} added · 0 changed · 0 destroyed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
