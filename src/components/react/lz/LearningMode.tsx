import { useState } from 'react';

/**
 * LearningMode
 *
 * "¿Qué está ocurriendo aquí?" — pedagogical section that explains the
 * landing zone using simple analogies. Each concept is presented as a
 * card with a flip-style "Ver explicación simple" toggle that reveals
 * a non-technical analogy.
 *
 * Designed to be a friendly counterweight to the deeply technical
 * architecture and timeline components above.
 */

interface Lesson {
  id:        string;
  title:     string;
  technical: string;
  analogy:   {
    headline:    string;
    body:        string;
    /** Short comparison table: technical → everyday */
    comparison?: { tech: string; everyday: string }[];
  };
  accent:    string;
  glow:      string;
  emoji:     string;
}

const LESSONS: Lesson[] = [
  {
    id: 'lz-overview',
    title: '¿Qué es una Landing Zone?',
    technical:
      'Es el conjunto de decisiones de arquitectura, identidad, networking, gobernanza y operación que se aplican antes de desplegar workloads, siguiendo el Cloud Adoption Framework de Microsoft.',
    analogy: {
      headline: 'Es como urbanizar un terreno antes de construir las casas',
      body: 'Antes de construir un barrio nuevo, primero pones las calles, las farolas, el alcantarillado, los servicios de seguridad y dejas claro qué se puede construir y dónde. Una Landing Zone hace exactamente eso para tu cloud: deja todo preparado para que cada equipo solo tenga que aterrizar su proyecto.',
      comparison: [
        { tech: 'Management Groups',  everyday: 'Distritos del barrio' },
        { tech: 'Suscripciones',      everyday: 'Solares con su propia escritura' },
        { tech: 'Hub VNet',           everyday: 'Avenida principal del barrio' },
        { tech: 'Spoke VNet',         everyday: 'Calles internas de cada parcela' },
      ],
    },
    accent: 'from-blue-400 to-cyan-400',
    glow:   'rgba(59, 130, 246, 0.35)',
    emoji:  '🏘️',
  },
  {
    id: 'hub-spoke',
    title: '¿Por qué hub-and-spoke?',
    technical:
      'Una topología hub-and-spoke centraliza los servicios compartidos en una VNet "hub" peerada con varias VNets "spoke", de forma que el tráfico entre spokes pasa siempre por componentes del hub (firewall, DNS, gateway).',
    analogy: {
      headline: 'Como un aeropuerto con vuelos en hub',
      body: 'Imagina que en lugar de poner un control de seguridad en cada puerta de embarque, tienes un único control central por el que pasan todos los pasajeros. Eso es el hub: el sitio único donde se aplica la seguridad, el routing y la conectividad. Cada terminal (spoke) solo se preocupa de su propio negocio.',
      comparison: [
        { tech: 'Hub VNet',          everyday: 'Edificio central del aeropuerto' },
        { tech: 'Azure Firewall',    everyday: 'Control de seguridad' },
        { tech: 'VPN/ExpressRoute',  everyday: 'Pasarela hacia el exterior' },
        { tech: 'Spoke VNet',        everyday: 'Terminal de una aerolínea' },
      ],
    },
    accent: 'from-violet-400 to-fuchsia-400',
    glow:   'rgba(168, 85, 247, 0.35)',
    emoji:  '✈️',
  },
  {
    id: 'iac',
    title: 'Infrastructure as Code, ¿qué gano?',
    technical:
      'Definir la infraestructura en archivos .tf versionados permite revisar cambios en PR, replicar entornos exactamente y auditar qué cambió, cuándo y por qué.',
    analogy: {
      headline: 'Es la receta del plato en lugar del plato ya cocinado',
      body: 'Hacer click en el portal es como cocinar sin receta: queda rico una vez, pero si quieres reproducirlo en otra cocina o pasárselo a otra persona, es imposible. Terraform es la receta escrita: cualquiera puede ejecutarla y obtiene exactamente el mismo resultado, y si cambias un ingrediente queda registrado.',
    },
    accent: 'from-emerald-400 to-teal-400',
    glow:   'rgba(16, 185, 129, 0.35)',
    emoji:  '👨‍🍳',
  },
  {
    id: 'policies',
    title: '¿Qué hace Azure Policy?',
    technical:
      'Las policies definen reglas declarativas que se aplican a recursos Azure (Audit, Deny, DeployIfNotExists). Las iniciativas agrupan varias policies y se asignan a Management Groups o suscripciones para herencia automática.',
    analogy: {
      headline: 'Como las normas de la comunidad de vecinos',
      body: 'En una comunidad hay normas: no se puede tender ropa al balcón, no se puede pintar la fachada de cualquier color, etc. Si alguien las incumple, el portero avisa o lo impide. Azure Policy es ese portero automático: revisa todo lo que se despliega y bloquea lo que no cumple las normas.',
      comparison: [
        { tech: 'Audit',                everyday: 'El portero anota la infracción' },
        { tech: 'Deny',                 everyday: 'El portero impide la acción' },
        { tech: 'DeployIfNotExists',    everyday: 'El portero arregla el desperfecto él mismo' },
      ],
    },
    accent: 'from-amber-400 to-orange-500',
    glow:   'rgba(245, 158, 11, 0.35)',
    emoji:  '🛡️',
  },
  {
    id: 'private-endpoints',
    title: '¿Qué son los Private Endpoints?',
    technical:
      'Un Private Endpoint expone un servicio PaaS (Storage, SQL, Key Vault…) con una IP privada dentro de tu VNet, eliminando la exposición pública del plano de datos.',
    analogy: {
      headline: 'Es entrar a la oficina por el garaje, no por la puerta principal',
      body: 'Por defecto, los servicios cloud son edificios con la puerta principal abierta a Internet. Un Private Endpoint es una puerta lateral exclusiva para ti, dentro de tu propio recinto. Nadie de fuera puede llegar — sólo tú y tu equipo, desde dentro de tu red privada.',
    },
    accent: 'from-cyan-400 to-blue-500',
    glow:   'rgba(34, 211, 238, 0.35)',
    emoji:  '🔐',
  },
  {
    id: 'oidc',
    title: '¿Por qué OIDC y no client secrets?',
    technical:
      'Federation OIDC entre GitHub Actions y un User-Assigned Managed Identity en Azure permite autenticarse sin guardar secretos de larga duración. Cada job recibe un token efímero firmado por GitHub.',
    analogy: {
      headline: 'Como una llave maestra vs un pasaporte temporal',
      body: 'Guardar un client secret es como dejar la llave de tu casa debajo del felpudo: si la encuentran, tienen acceso indefinido. OIDC es como pedir un pasaporte temporal cada vez que entras: caduca a los 5 minutos y solo es válido si vienes de un sitio concreto.',
    },
    accent: 'from-rose-400 to-pink-500',
    glow:   'rgba(244, 63, 94, 0.35)',
    emoji:  '🎟️',
  },
];

function Card({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="reveal glass-card relative overflow-hidden rounded-2xl p-6 sm:p-7"
    >
      {/* Decorative corner accent */}
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity ${open ? 'opacity-40' : ''}`}
        style={{ background: lesson.glow }}
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${lesson.accent} text-2xl`}
            style={{ boxShadow: `0 8px 20px -6px ${lesson.glow}` }}
            aria-hidden="true"
          >
            {lesson.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white leading-snug">
              {lesson.title}
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              {open ? 'Explicación sencilla' : 'Definición técnica'}
            </p>
          </div>
        </div>

        {/* Content area */}
        <div className="mt-4 min-h-[180px]">
          {!open ? (
            <p className="text-sm leading-relaxed text-slate-300">
              {lesson.technical}
            </p>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <p className="text-sm font-semibold text-white">
                {lesson.analogy.headline}
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                {lesson.analogy.body}
              </p>
              {lesson.analogy.comparison && (
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-700/50">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-800/60 text-left">
                        <th className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-blue-300">
                          En cloud
                        </th>
                        <th className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                          En la vida real
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lesson.analogy.comparison.map((c) => (
                        <tr key={c.tech} className="border-t border-slate-800/60">
                          <td className="px-3 py-1.5 font-mono text-[11px] text-slate-300">{c.tech}</td>
                          <td className="px-3 py-1.5 text-[11px] text-slate-400">{c.everyday}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-blue-300 hover:text-blue-200 transition-colors"
          aria-expanded={open}
        >
          {open ? '← Volver a la versión técnica' : 'Ver explicación sencilla →'}
        </button>
      </div>
    </div>
  );
}

export default function LearningMode() {
  return (
    <section className="relative border-b border-slate-800/60 py-20" style={{ backgroundColor: '#040818' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-10 max-w-2xl">
          <span className="eyebrow">Modo aprendizaje</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            ¿Qué está <span className="text-gradient-static">ocurriendo aquí?</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Cada concepto técnico tiene una analogía sencilla. Pulsa "ver
            explicación sencilla" en cualquier tarjeta para una versión
            sin jerga.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((l) => (
            <Card key={l.id} lesson={l} />
          ))}
        </div>
      </div>
    </section>
  );
}
