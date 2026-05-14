import { useState } from 'react';

/**
 * InteractiveArchitecture
 *
 * Interactive hub-and-spoke diagram for the Landing Zone project page.
 *
 * Each component is clickable: clicking it opens a side panel with a
 * detailed explanation. Hovering highlights the active node and its
 * primary connection to the hub.
 *
 * Pure React + SVG + Tailwind — no external animation library needed.
 */

type ComponentId =
  | 'hub'
  | 'firewall'
  | 'vpn'
  | 'bastion'
  | 'dns'
  | 'spoke-identity'
  | 'spoke-prod'
  | 'spoke-dev'
  | 'spoke-data'
  | 'onprem'
  | 'internet';

interface NodeDef {
  id:        ComponentId;
  label:     string;
  short:     string;
  /** Where it sits on the 900×540 viewBox */
  x:         number;
  y:         number;
  w:         number;
  h:         number;
  /** Tailwind gradient classes */
  accent:    string;
  category:  'hub' | 'shared' | 'spoke' | 'edge';
  /** Lines this node has to other nodes (rendered separately) */
  connects?: ComponentId[];
  /** Long-form explanation surfaced in the side panel */
  detail: {
    summary:     string;
    bullets:     string[];
    bestPractice?: string;
  };
}

const NODES: NodeDef[] = [
  {
    id: 'hub',
    label: 'Hub VNet',
    short: '10.0.0.0/16',
    x: 360, y: 230, w: 180, h: 80,
    accent: 'from-blue-500 to-blue-700',
    category: 'hub',
    connects: ['firewall', 'vpn', 'bastion', 'dns', 'spoke-identity', 'spoke-prod', 'spoke-dev', 'spoke-data', 'internet', 'onprem'],
    detail: {
      summary: 'Red central que concentra los servicios compartidos y conecta a todos los spokes mediante peering bidireccional.',
      bullets: [
        'Tráfico spoke ↔ spoke siempre pasa por el firewall del hub',
        'Single source of truth para Private DNS Zones',
        'ExpressRoute / VPN Gateway viven aquí',
        'Subnet GatewaySubnet, AzureFirewallSubnet, AzureBastionSubnet reservadas',
      ],
      bestPractice: 'Asignar /16 al hub aunque parezca grande. Cambiar el address space después implica recrear la VNet.',
    },
  },
  {
    id: 'firewall',
    label: 'Azure Firewall',
    short: 'Premium · Policy hierarchy',
    x: 360, y: 90, w: 180, h: 56,
    accent: 'from-amber-400 to-orange-500',
    category: 'shared',
    detail: {
      summary: 'Firewall gestionado L3-L7 con policy hierarchy: una política padre global y políticas hijas por landing zone.',
      bullets: [
        'Forced tunneling: 0.0.0.0/0 → AzureFirewall vía UDR',
        'Reglas DNAT, Network y Application',
        'TLS inspection y IDPS en tier Premium',
        'Logs nativos a Log Analytics',
      ],
      bestPractice: 'Empezar con policy hierarchy desde el día 1. Migrar reglas planas a herencia es muy costoso.',
    },
  },
  {
    id: 'vpn',
    label: 'VPN / ExpressRoute',
    short: 'Hybrid connectivity',
    x: 130, y: 230, w: 170, h: 56,
    accent: 'from-violet-400 to-fuchsia-500',
    category: 'shared',
    detail: {
      summary: 'Gateway que conecta el hub con la red corporativa on-premises mediante ExpressRoute (dedicado) o VPN site-to-site.',
      bullets: [
        'ExpressRoute para SLA + bandwidth dedicado',
        'VPN S2S como backup o entornos no críticos',
        'BGP dinámico para anuncio de rutas',
        'Soporta active-active con dos circuitos',
      ],
      bestPractice: 'Activar BGP MD5 y monitorizar AS-path para detectar fugas de rutas.',
    },
  },
  {
    id: 'bastion',
    label: 'Azure Bastion',
    short: 'Acceso seguro a VMs',
    x: 600, y: 230, w: 170, h: 56,
    accent: 'from-cyan-400 to-blue-500',
    category: 'shared',
    detail: {
      summary: 'Acceso RDP/SSH a VMs sin exponer IPs públicas. El cliente se conecta por HTTPS al portal y Bastion proxy-tunneliza.',
      bullets: [
        'Sin IPs públicas en las VMs',
        'Soporta MFA + Conditional Access',
        'Native client RDP/SSH (Standard SKU)',
        'Auditoría en Activity Log',
      ],
      bestPractice: 'Subnet AzureBastionSubnet mínimo /26, no compartirla con otros recursos.',
    },
  },
  {
    id: 'dns',
    label: 'Private DNS Zones',
    short: 'privatelink.*',
    x: 130, y: 320, w: 170, h: 56,
    accent: 'from-emerald-400 to-teal-500',
    category: 'shared',
    detail: {
      summary: 'Zonas DNS privadas centralizadas en el hub, enlazadas a todos los spokes para resolver Private Endpoints.',
      bullets: [
        'Una zona por servicio (blob, vault, sql, etc.)',
        'VNet links a todos los spokes',
        'A-records auto-registrados al crear Private Endpoints',
        'Vive en la suscripción de Connectivity',
      ],
      bestPractice: '90% de los problemas con Private Endpoints son DNS. Si algo no resuelve, empezar por el vnet link.',
    },
  },
  {
    id: 'spoke-identity',
    label: 'Spoke · Identidad',
    short: '10.10.0.0/16',
    x: 60, y: 60, w: 170, h: 64,
    accent: 'from-rose-400 to-pink-500',
    category: 'spoke',
    detail: {
      summary: 'Suscripción que aloja los servicios de identidad: domain controllers, AAD Connect, PIM.',
      bullets: [
        'Domain Controllers AD DS',
        'AAD Connect sync',
        'Privileged Identity Management (PIM)',
        'Conditional Access policies',
      ],
      bestPractice: 'Aislar la suscripción de identidad con RBAC propio. Solo el Identity team tiene acceso de escritura.',
    },
  },
  {
    id: 'spoke-prod',
    label: 'Spoke · Workload Prod',
    short: '10.20.0.0/16',
    x: 670, y: 60, w: 170, h: 64,
    accent: 'from-blue-400 to-cyan-400',
    category: 'spoke',
    detail: {
      summary: 'Workloads productivos: App Service, SQL Database, Storage — todo con Private Endpoint.',
      bullets: [
        'NSG con reglas mínimas por capa (app/data)',
        'Private Endpoints obligatorios',
        'Diagnostic settings → Log Analytics',
        'Backup con Recovery Services Vault',
      ],
      bestPractice: 'Mismo Terraform que dev/preprod, solo cambian variables. Drift = bug, no feature.',
    },
  },
  {
    id: 'spoke-dev',
    label: 'Spoke · Workload Dev',
    short: '10.30.0.0/16',
    x: 60, y: 400, w: 170, h: 64,
    accent: 'from-violet-400 to-fuchsia-400',
    category: 'spoke',
    detail: {
      summary: 'Réplica de prod con SKUs económicas y políticas relajadas para iterar rápido sin asumir riesgo de producción.',
      bullets: [
        'SKUs Basic/Standard donde se pueda',
        'Auto-shutdown nocturno',
        'Budgets con alertas',
        'Misma topología que prod',
      ],
      bestPractice: 'Aplicar las mismas policies que en prod en modo Audit. Cambiarlas a Deny solo cuando todo cumple.',
    },
  },
  {
    id: 'spoke-data',
    label: 'Spoke · Data Platform',
    short: '10.40.0.0/16',
    x: 670, y: 400, w: 170, h: 64,
    accent: 'from-cyan-400 to-emerald-400',
    category: 'spoke',
    detail: {
      summary: 'Plataforma de datos: Data Factory con SHIR, Snowflake con PrivateLink, integración con on-prem.',
      bullets: [
        'Self-hosted Integration Runtime (SHIR)',
        'Snowflake con PrivateLink',
        'Storage layered: Bronze · Silver · Gold',
        'Key Vault para credenciales',
      ],
      bestPractice: 'SHIR siempre en par activo-pasivo. Si la única VM se cae, los pipelines fallan en silencio.',
    },
  },
  {
    id: 'onprem',
    label: 'On-premises',
    short: 'Corporate network',
    x: 60, y: 230, w: 70, h: 56,
    accent: 'from-slate-500 to-slate-700',
    category: 'edge',
    detail: {
      summary: 'Data center corporativo conectado al hub vía ExpressRoute o VPN site-to-site.',
      bullets: [
        'Ruta default vía Azure Firewall (opcional)',
        'DNS forwarders bidireccionales',
        'AD DS sincronizado con AAD',
      ],
    },
  },
  {
    id: 'internet',
    label: 'Internet',
    short: 'Public ingress',
    x: 770, y: 230, w: 70, h: 56,
    accent: 'from-slate-500 to-slate-700',
    category: 'edge',
    detail: {
      summary: 'Tráfico público entrante (Application Gateway, Front Door) y saliente filtrado por Azure Firewall.',
      bullets: [
        'Front Door o App Gateway con WAF',
        'DDoS Protection Standard en el hub',
        'Egress por Firewall con TLS inspection',
      ],
    },
  },
];

const CATEGORY_LEGEND: Record<NodeDef['category'], { label: string; dot: string }> = {
  hub:    { label: 'Hub central',       dot: 'bg-blue-400' },
  shared: { label: 'Servicios compartidos', dot: 'bg-amber-400' },
  spoke:  { label: 'Landing zone (spoke)',  dot: 'bg-violet-400' },
  edge:   { label: 'Conectividad externa',  dot: 'bg-slate-400' },
};

// Pre-compute the list of edges so they're rendered once
function getEdges(): { from: ComponentId; to: ComponentId }[] {
  const edges: { from: ComponentId; to: ComponentId }[] = [];
  for (const n of NODES) {
    if (!n.connects) continue;
    for (const c of n.connects) {
      edges.push({ from: n.id, to: c });
    }
  }
  return edges;
}
const EDGES = getEdges();

export default function InteractiveArchitecture() {
  const [selected, setSelected] = useState<ComponentId>('hub');
  const [hovered, setHovered]   = useState<ComponentId | null>(null);

  const nodeOf = (id: ComponentId) => NODES.find((n) => n.id === id)!;
  const sel    = nodeOf(selected);

  const centerOf = (n: NodeDef) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

  const isHighlighted = (a: ComponentId, b: ComponentId) => {
    if (!hovered && !selected) return false;
    const active = hovered ?? selected;
    return a === active || b === active;
  };

  return (
    <section className="relative border-b border-slate-800/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-10 max-w-2xl">
          <span className="eyebrow">Arquitectura interactiva</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Explora la <span className="text-gradient-static">topología</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Pasa el ratón sobre cualquier componente o pulsa para ver su rol,
            buenas prácticas y cómo se conecta con el resto de la plataforma.
          </p>
        </div>

        {/* Legend */}
        <div className="reveal mb-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
          {Object.entries(CATEGORY_LEGEND).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${v.dot}`} />
              {v.label}
            </span>
          ))}
        </div>

        <div className="reveal grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* === Diagram === */}
          <div className="glass-card relative overflow-hidden rounded-2xl">
            <svg
              viewBox="0 0 900 540"
              className="block h-auto w-full"
              role="img"
              aria-label="Diagrama interactivo hub-and-spoke"
            >
              <defs>
                <pattern id="lzgrid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(96,165,250,0.08)" strokeWidth="0.5"/>
                </pattern>
                <radialGradient id="lzhubglow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%"   stopColor="rgba(59,130,246,0.45)"/>
                  <stop offset="100%" stopColor="rgba(59,130,246,0)"/>
                </radialGradient>
              </defs>

              {/* Background */}
              <rect width="900" height="540" fill="rgba(5,9,20,0.6)"/>
              <rect width="900" height="540" fill="url(#lzgrid)"/>

              {/* Hub glow */}
              <circle cx="450" cy="270" r="220" fill="url(#lzhubglow)"/>

              {/* Edges */}
              {EDGES.map((e, i) => {
                const a = nodeOf(e.from);
                const b = nodeOf(e.to);
                const ca = centerOf(a);
                const cb = centerOf(b);
                const hl = isHighlighted(e.from, e.to);
                return (
                  <line
                    key={`edge-${i}`}
                    x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                    stroke={hl ? 'rgba(96,165,250,0.85)' : 'rgba(96,165,250,0.18)'}
                    strokeWidth={hl ? 1.6 : 0.7}
                    strokeDasharray={hl ? '0' : '4 6'}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />
                );
              })}

              {/* Nodes */}
              {NODES.map((n) => {
                const active = selected === n.id || hovered === n.id;
                return (
                  <g
                    key={n.id}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(n.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(n.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer focus:outline-none"
                    aria-label={n.label}
                  >
                    <rect
                      x={n.x - (active ? 2 : 0)}
                      y={n.y - (active ? 2 : 0)}
                      width={n.w + (active ? 4 : 0)}
                      height={n.h + (active ? 4 : 0)}
                      rx="10"
                      fill="rgba(15, 23, 42, 0.85)"
                      stroke={active ? 'rgba(96,165,250,0.9)' : 'rgba(96,165,250,0.3)'}
                      strokeWidth={active ? 1.6 : 1}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    {/* Accent bar at top */}
                    <foreignObject x={n.x + 8} y={n.y + 8} width={n.w - 16} height={n.h - 16}>
                      <div className="flex h-full flex-col justify-center">
                        <div className={`h-1 w-8 rounded bg-gradient-to-r ${n.accent} mb-1.5`}/>
                        <p className="text-[12px] font-semibold text-white leading-tight">{n.label}</p>
                        <p className="font-mono text-[10px] text-blue-300/80 mt-0.5">{n.short}</p>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Hub label */}
              <text x="450" y="330" textAnchor="middle" fontSize="9" fontFamily="'JetBrains Mono', monospace" fill="rgba(96,165,250,0.4)" letterSpacing="2">
                HUB-AND-SPOKE TOPOLOGY
              </text>
            </svg>

            <p className="px-4 pb-3 pt-1 text-center font-mono text-[10px] text-slate-500">
              Pulsa un componente para ver el detalle →
            </p>
          </div>

          {/* === Detail side panel === */}
          <aside
            className="glass-card flex flex-col rounded-2xl p-6"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-10 rounded bg-gradient-to-r ${sel.accent}`}
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                {sel.category === 'hub'    && 'Hub central'}
                {sel.category === 'shared' && 'Servicio compartido'}
                {sel.category === 'spoke'  && 'Spoke'}
                {sel.category === 'edge'   && 'Edge'}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-white">{sel.label}</h3>
            <p className="mt-1 font-mono text-xs text-blue-300">{sel.short}</p>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {sel.detail.summary}
            </p>

            <ul className="mt-5 space-y-2">
              {sel.detail.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-400" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {sel.detail.bestPractice && (
              <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="flex items-start gap-2 text-xs text-amber-200/90">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">Tip</span>
                  <span className="leading-snug">{sel.detail.bestPractice}</span>
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
