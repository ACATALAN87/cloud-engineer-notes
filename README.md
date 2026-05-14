# Cloud Engineer Notes · Portfolio + Demo de Landing Zone

Portfolio web personal y laboratorio interactivo de un **Senior Cloud Engineer**
especializado en Azure, Terraform y DevOps. Construido con **Astro + React +
Tailwind CSS v4**, desplegado de forma totalmente estática en GitHub Pages
mediante GitHub Actions.

> 🌐 **Live:** <https://acatalan87.github.io/cloud-engineer-notes>

---

## 📐 Visión general

El sitio combina dos cosas en uno:

1. **Portfolio profesional** — quién soy, experiencia, certificaciones,
   skills técnicos y proyectos.
2. **Laboratorio interactivo de Landing Zone Azure** — una experiencia
   pedagógica que explica una arquitectura empresarial real con
   componentes interactivos: arquitectura clicable, simulador de
   `terraform apply`, timeline de despliegue paso a paso y un "modo
   aprendizaje" con analogías sencillas.

Todo el contenido es estático, sin backend ni base de datos. Los proyectos,
labs y posts se gestionan como **content collections** de Astro tipadas con
Zod en `src/content/`.

---

## ✨ Características destacadas

### Página principal
- Fondo animado de **partículas conectadas** con `<canvas>` que reacciona al
  cursor.
- **Visualización cloud** SVG en el lado derecho del Hero con 6 servicios
  Azure orbitando un núcleo central, con hover tooltips y animación idle.
- **Glassmorphism + spotlight hover** en todas las tarjetas de skills,
  certificaciones y proyectos.
- **Scroll-reveal** con `IntersectionObserver` y stagger automático.
- **Header sticky** con blur dinámico al hacer scroll.
- Indicador animado del enlace activo en la navegación.
- Diseño 100% responsive y respeta `prefers-reduced-motion`.

### Proyecto interactivo Landing Zone
| Bloque | Qué hace |
|---|---|
| **Arquitectura interactiva** | Diagrama hub-and-spoke clicable con 11 componentes. Hover destaca conexiones; click abre panel lateral con explicación, buenas prácticas y "tip" del experto. |
| **Timeline de despliegue** | Las 7 fases del CAF (Management Groups → Policies → Networking → Identity → Monitoring → Security → Workloads) con botón Play que simula la ejecución y muestra la salida estilo terminal. |
| **Simulador IaC** | Mock animado de `terraform validate / plan / apply` con resources que aparecen en grid y governance checks que se validan en tiempo real. |
| **Modo aprendizaje** | 6 conceptos cloud explicados con analogías cotidianas (Landing Zone = urbanizar un terreno, Hub-and-spoke = aeropuerto, etc.) con flip toggle entre versión técnica y sencilla. |

### Sistema de contenido
- **Content collections** tipadas con Zod (`projects`, `blog`, `labs`, `briefing`).
- Página de detalle con TOC sticky lateral, prose styling con tablas, code
  blocks con borde gradient y resaltado Shiki.
- Diagrams SVG en `public/images/projects/azure-lz/` (4 diagramas con
  animaciones CSS embebidas).

---

## 🛠️ Stack técnico

| Capa | Tecnología | Por qué |
|---|---|---|
| **Framework** | [Astro 6](https://astro.build) | SSG con islands architecture — HTML puro + React solo donde aporta |
| **UI** | [React 19](https://react.dev) | Para componentes interactivos (Hero, Landing Zone) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com) | Sistema con CSS variables vía `@theme`, sin PostCSS |
| **Tipografía** | Inter + JetBrains Mono | UI limpia + monospace para código |
| **Animaciones** | CSS keyframes + SVG + Canvas | Cero deps externas — bundle mínimo |
| **Iconos** | SVG inline | Sin librería; cada icono es un componente |
| **Lenguaje** | TypeScript | Strict mode, schemas tipados con Zod |
| **CI/CD** | GitHub Actions | Workflow `ci.yml` (lint+build) + `deploy.yml` (GitHub Pages) |
| **Containers** | Docker multi-stage | Build con node:22-alpine, runtime con nginx:alpine |

> ¿Por qué no Framer Motion / Lottie? Para el nivel de animación que requería
> el diseño, CSS + SVG son más eficientes y mantienen el bundle por debajo de
> ~50 KB de JS comprimido. Si en el futuro un componente necesita animaciones
> coreografiadas complejas, el plan es añadir [`motion`](https://motion.dev)
> (Framer Motion v12) selectivamente.

---

## 📂 Estructura del repositorio

```text
cloud-engineer-notes/
├── public/                          # Assets estáticos (servidos tal cual)
│   ├── favicon.svg
│   └── images/
│       └── projects/
│           └── azure-lz/             # 4 diagramas SVG con animaciones CSS
│               ├── hub-and-spoke.svg
│               ├── management-groups.svg
│               ├── cicd-pipeline.svg
│               └── security-stack.svg
│
├── src/
│   ├── components/
│   │   ├── HeroNewsCard.astro
│   │   ├── ui/
│   │   │   └── SectionTitle.tsx
│   │   └── react/
│   │       ├── AnimatedBackground.tsx     # Canvas de partículas del fondo
│   │       ├── CloudVisual.tsx            # Visualización 3D-ish del Hero
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Hero.tsx
│   │       ├── RotatingTag.tsx            # Tagline rotatorio con cursor
│   │       ├── ValueProps.tsx
│   │       ├── SkillGrid.tsx
│   │       ├── ExperienceTimeline.tsx
│   │       ├── CertificationsGrid.tsx
│   │       ├── ProjectsBento.tsx
│   │       ├── FeaturedProjectsTeaser.tsx
│   │       ├── CTASection.tsx
│   │       ├── ProjectCard.tsx
│   │       ├── ArticleCard.tsx
│   │       ├── LogoMark.tsx
│   │       ├── useScrollReveal.ts         # Hook global del observer
│   │       └── lz/                        # Componentes Landing-Zone
│   │           ├── InteractiveArchitecture.tsx
│   │           ├── DeploymentTimeline.tsx
│   │           ├── IaCSimulator.tsx
│   │           └── LearningMode.tsx
│   │
│   ├── content/                          # Content collections tipadas
│   │   ├── projects/                     # Proyectos (3)
│   │   ├── labs/                         # Laboratorios técnicos
│   │   ├── blog/                         # Posts y noticias Azure
│   │   └── briefing/                     # Briefings IT
│   │
│   ├── data/
│   │   └── azure-news.json               # Cache del fetch de Azure RSS
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro              # Layout base + meta SEO
│   │
│   ├── pages/
│   │   ├── index.astro                   # Home
│   │   ├── about.astro                   # Sobre mí
│   │   ├── projects/
│   │   │   ├── index.astro               # Bento grid de proyectos
│   │   │   └── [slug].astro              # Detalle (con bloques LZ)
│   │   ├── labs/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   │
│   ├── styles/
│   │   └── global.css                    # @theme + utilidades + animaciones
│   │
│   └── content.config.ts                 # Schemas Zod de las collections
│
├── scripts/
│   ├── fetch-azure-news.mjs              # Build-time RSS fetch
│   └── suggest-labs.mjs
│
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Lint + typecheck + build (PRs)
│       └── deploy.yml                    # Deploy a GitHub Pages (main)
│
├── Dockerfile                            # Multi-stage: node 22 → nginx
├── docker-compose.yml                    # Preview local + perfil dev
├── .dockerignore
├── .editorconfig
├── .prettierrc.json
├── .prettierignore
├── .gitignore
├── astro.config.mjs                      # base="/cloud-engineer-notes"
├── tsconfig.json
├── tailwind.config.mjs
└── package.json
```

---

## 🚀 Empezar localmente

### Requisitos
- Node.js **22.12+** (ver `engines` en `package.json`)
- npm 10+

### Instalación y arranque

```bash
git clone https://github.com/ACATALAN87/cloud-engineer-notes.git
cd cloud-engineer-notes
npm install
npm run dev
```

Visita <http://localhost:4321/cloud-engineer-notes/>.

### Scripts npm disponibles

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR en `:4321` |
| `npm run build` | Build de producción → `./dist/` |
| `npm run preview` | Sirve el build localmente (para verificar antes de deploy) |
| `npm run news` | Refresca la cache de Azure RSS (`src/data/azure-news.json`) |
| `npm run labs` | Sugiere nuevos labs basados en las noticias |
| `npm run labs:generate` | Genera scaffolding de un lab nuevo |

### Variables de entorno

No se requieren para desarrollo o build. El despliegue se basa puramente en
assets estáticos.

---

## 🐳 Docker

### Build de producción local

```bash
docker build -t cloud-engineer-notes .
docker run --rm -p 8080:80 cloud-engineer-notes
```

Abre <http://localhost:8080/cloud-engineer-notes/>.

### Con docker-compose

```bash
# Preview de producción (nginx)
docker compose up --build

# Modo desarrollo con HMR (volumen montado)
docker compose --profile dev up dev
```

El `docker-compose.yml` define dos servicios:
- `web` — nginx sirviendo el build estático en `:8080`
- `dev` (perfil opcional) — Astro dev server en `:4321`

---

## ☁️ Despliegue

### GitHub Pages (configuración actual)

Cada push a `main` dispara `.github/workflows/deploy.yml`:

1. Instala dependencias
2. Ejecuta `npm run build`
3. Sube `./dist/` como artefacto de Pages
4. Despliega vía `actions/deploy-pages@v4`

**Configuración requerida una sola vez** en el repo:
- Settings → Pages → Source: **GitHub Actions**

El sitio queda accesible en `https://<usuario>.github.io/cloud-engineer-notes/`.

### Vercel

```bash
npx vercel
```

Vercel autodetecta Astro. Para que el `base` quede correcto:
- Edita `astro.config.mjs` y comenta la línea `base: '/cloud-engineer-notes'`
  (o cámbiala a `'/'`).
- Las URLs internas se ajustarán automáticamente porque toda la app usa
  `import.meta.env.BASE_URL`.

### Azure Static Web Apps

1. En el portal de Azure: crea un Static Web App apuntando al repo.
2. Build preset: **Astro**.
3. Output location: `dist`.
4. Azure inyecta su propio workflow (`azure-static-web-apps-*.yml`).

### Docker (cualquier hosting)

La imagen del `Dockerfile` es self-contained: nginx + assets estáticos.
Compatible con Azure App Service for Containers, Cloud Run, ECS, Fly.io, etc.

```bash
# Push a registry
docker tag cloud-engineer-notes ghcr.io/ACATALAN87/cloud-engineer-notes:latest
docker push ghcr.io/ACATALAN87/cloud-engineer-notes:latest
```

---

## 🧪 Calidad de código

| Herramienta | Configuración | Cuándo se ejecuta |
|---|---|---|
| **Astro check** | TypeScript strict + validación de content collections | `npm run build` y CI |
| **Prettier** | `.prettierrc.json` con plugin Astro | `npx prettier --write .` |
| **EditorConfig** | 2 espacios, LF, UTF-8 | Auto en editores compatibles |

> El proyecto no usa ESLint **todavía** — Astro check cubre los errores
> críticos de tipos y plantillas. Si el código crece, el siguiente paso
> sería añadir `eslint-plugin-astro` + `typescript-eslint`.

---

## 🗺️ Roadmap

### Próximas mejoras
- [ ] Detail page propia (no markdown) para los otros 2 proyectos del portfolio.
- [ ] Modo claro/oscuro con toggle (actualmente solo dark).
- [ ] Búsqueda en contenidos de blog/labs.
- [ ] Generación dinámica de OG images por página.
- [ ] Página `/uses` con stack personal de hardware/software.
- [ ] Internacionalización completa EN/ES con `astro-i18n`.

### Ideas de proyectos futuros
- Lab interactivo de **Azure Networking** (Private Endpoints, peering).
- **Cost calculator** visual para Landing Zone.
- Dashboard **Defender Secure Score** simulado.
- Visualizador interactivo de **Azure Policy initiatives**.

---

## 📷 Capturas

> _Capturas pendientes — el sitio en vivo está en
> [acatalan87.github.io/cloud-engineer-notes](https://acatalan87.github.io/cloud-engineer-notes)._

| Vista | Descripción |
|---|---|
| `screenshots/home.png` | Home con Hero + visualización cloud animada |
| `screenshots/lz-architecture.png` | Diagrama hub-and-spoke interactivo |
| `screenshots/lz-timeline.png` | Timeline de despliegue paso a paso |
| `screenshots/lz-simulator.png` | Simulador de `terraform apply` |
| `screenshots/lz-learning.png` | Modo aprendizaje con analogías |

---

## 🤝 Contacto

- **LinkedIn:** [Ángel Luis Catalán Sánchez](https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/)
- **GitHub:** [@ACATALAN87](https://github.com/ACATALAN87)
- **Email:** acatalan87@outlook.com

---

## 📝 Licencia

El **código** está disponible bajo licencia MIT. Los **contenidos**
(textos, certificaciones, datos personales) son © Ángel Luis Catalán
y no deben reutilizarse sin permiso.

---

<sub>Construido con ❤️ desde Madrid · Astro + React + Tailwind + GitHub Pages</sub>
