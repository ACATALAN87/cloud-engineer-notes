---
title: "Lab 01 — Web técnica estática con Astro y GitHub Pages"
description: "Construcción de una web personal técnica con Astro, contenido Markdown y despliegue automático mediante GitHub Actions."
date: 2026-04-08
draft: false
stack: ["Astro", "GitHub Pages", "GitHub Actions", "Markdown"]
---

## Contexto

Quería construir una web personal técnica que sirviera a la vez como portfolio, espacio de publicación y laboratorio de aprendizaje. La solución tenía que cumplir cuatro condiciones:

- coste prácticamente nulo
- mantenimiento sencillo
- contenido versionado en Git
- despliegue automático sin infraestructura compleja

Con ese criterio, opté por una arquitectura estática basada en Astro y GitHub Pages.

---

## Objetivo

Diseñar y desplegar una web técnica con estas capacidades:

- páginas estáticas para inicio, blog, labs y perfil
- contenido gestionado en Markdown
- despliegue automático al hacer push a `main`
- estructura fácil de evolucionar más adelante

---

## Stack elegido

### Astro
Lo utilicé como generador de sitio estático por su buen encaje con proyectos de contenido, su simplicidad y su modelo de build orientado a rendimiento.

### Markdown
El contenido vive dentro del repositorio, lo que permite versionado, revisiones limpias y una estructura muy adecuada para una web técnica.

### GitHub Pages
Se eligió como hosting por coste cero y por integrarse bien con un flujo de publicación sencillo.

### GitHub Actions
Se utilizó para automatizar el build y el despliegue del sitio.

---

## Arquitectura

El flujo general del proyecto es este:

```text
Edición local → commit/push → GitHub Actions → build Astro → deploy en GitHub Pages

La web sigue un enfoque static-first:

el contenido se resuelve en build
no hay base de datos
no hay backend
la publicación depende del pipeline de CI/CD

Esto reduce complejidad operativa y encaja bien con una primera versión orientada a portfolio.

Estructura del proyecto
src/
  content/
    blog/
    labs/
    briefing/
  layouts/
    BaseLayout.astro
  pages/
    index.astro
    about.astro
    blog/
      index.astro
      [slug].astro
    labs/
      index.astro
      [slug].astro

.github/
  workflows/
    deploy.yml

astro.config.mjs
package.json
Decisiones de diseño
1. Separar contenido y presentación

El contenido está en src/content, mientras que las rutas y plantillas viven en src/pages y src/layouts.

Esto permite mantener el proyecto ordenado y facilita que el sitio crezca sin mezclar contenido con lógica de render.

2. Usar content collections

Se definieron colecciones para blog, labs y briefing, con esquema validado.

Esto aporta dos ventajas claras:

consistencia en frontmatter
menos errores al renderizar contenido
3. Mantener el sitio estático

No añadí CMS, base de datos ni capa dinámica. La prioridad era tener una base sólida y fácil de mantener.

Implementación
1. Estructura base del sitio

Se creó una primera versión con estas rutas:

/
/blog
/labs
/about

Y un layout base compartido para navegación, estilos generales y estructura común.

2. Soporte para contenido Markdown

El blog y los labs se construyeron como colecciones de contenido. Cada entrada se escribe como archivo Markdown con frontmatter.

Ejemplo de metadatos:

---
title: "Lab 01 — Web técnica estática con Astro y GitHub Pages"
description: "Construcción de una web personal técnica con Astro, contenido Markdown y despliegue automático mediante GitHub Actions."
date: 2026-04-08
draft: false
stack: ["Astro", "GitHub Pages", "GitHub Actions", "Markdown"]
---
3. Rutas dinámicas

Para mostrar cada post o lab individualmente, se utilizaron archivos dinámicos:

src/pages/blog/[slug].astro
src/pages/labs/[slug].astro
Problemas encontrados
1. Error de versión de Node

La versión más reciente del creador de Astro requería Node 22, mientras que mi entorno local estaba en Node 20.

Solución

Actualizar el entorno usando un gestor de versiones y trabajar con Node 22.

Esto evita incompatibilidades y deja el proyecto alineado con versiones actuales.

2. Despliegue en subruta de GitHub Pages

El sitio no se publica en la raíz del dominio, sino bajo esta ruta:

/cloud-engineer-notes/

Inicialmente, los enlaces internos usaban rutas como /blog o /labs, lo que provocaba errores 404 en producción.

Solución

Definir correctamente la configuración base en astro.config.mjs y construir los enlaces internos usando import.meta.env.BASE_URL.

Ejemplo:

const base = import.meta.env.BASE_URL;
<a href={`${base}blog/`}>Blog</a>
3. Uso incorrecto de slug en las colecciones

En la implementación inicial intenté usar lab.slug y post.slug, pero la colección devolvía id.

Solución

Construir la URL a partir de id, eliminando la extensión del archivo:

lab.id.replace(/\.md$/, "")

Esto permitió generar rutas estáticas válidas y coherentes con los archivos Markdown reales.

Pipeline de despliegue

El despliegue se automatizó con GitHub Actions.

El flujo es:

push a main
instalación de dependencias
build del sitio
publicación del directorio dist
despliegue en GitHub Pages

Este enfoque permite que la publicación sea repetible y elimina pasos manuales.

Resultado

El resultado final fue una web pública con estas características:

desplegada automáticamente
mantenida desde Git
con contenido estructurado
preparada para seguir creciendo

Además, el proyecto sirve como demostración práctica de:

CI/CD básico
static hosting
gestión de contenido técnica
resolución de incidencias de routing en entornos reales
Lecciones aprendidas
en static hosting, la gestión del base path es crítica
GitHub Pages es simple, pero obliga a cuidar mucho las rutas
Astro encaja muy bien en proyectos técnicos centrados en contenido
incluso un proyecto pequeño gana mucho valor cuando tiene CI/CD real
Mejoras futuras

Estas serían las siguientes evoluciones razonables del proyecto:

dominio propio
refinamiento visual del sitio
sección de briefing cloud
generación asistida de borradores con IA
migración o réplica posterior en Azure
Conclusión

Este laboratorio me permitió construir una base técnica simple pero sólida para una web personal profesional. Más allá del resultado visual, el valor principal del proyecto está en haber definido una arquitectura mantenible, un flujo de publicación automático y una estructura de contenido preparada para crecer.


---

# 2. Cómo hacerlo paso a paso

## Paso 1 — Crear el archivo del lab

Desde la raíz del proyecto:

```bash
touch "src/content/labs/lab-astro-github-pages.md"
Paso 2 — Abrir el archivo

Si usas VS Code:

code "src/content/labs/lab-astro-github-pages.md"

Si usas vi:

vi "src/content/labs/lab-astro-github-pages.md"
Paso 3 — Pegar el contenido

Copia todo el bloque Markdown que te he pasado y pégalo dentro del archivo.

Guarda.

Paso 4 — Arrancar la web en local
npm run dev

Abre:

http://localhost:4321/cloud-engineer-notes/

o, si en local te abre en raíz, simplemente:

http://localhost:4321/
Paso 5 — Comprobar que aparece en Labs

Ve a:

/labs/

y revisa que aparezca una tarjeta con el título:

Lab 01 — Web técnica estática con Astro y GitHub Pages
Paso 6 — Entrar en el lab

Haz clic y comprueba que abre la página individual del lab.

Si carga correctamente, el contenido ya está integrado bien.

Paso 7 — Reordenar el lab anterior

Como quieres que este sea el Lab 01, tienes dos opciones.

Opción A — Dejar el de Terraform como Lab 02

Edita el archivo:

src/content/labs/lab-terraform-base.md

y cambia el título del frontmatter de:

title: "Lab 01 — Base Terraform para entornos cloud"

a:

title: "Lab 02 — Base Terraform para entornos cloud"

Esta es la opción que te recomiendo.

Opción B — Despublicarlo temporalmente

Si todavía está verde y no quieres enseñarlo, cambia:

draft: false

por:

draft: true

Así no aparecerá en la web.

Paso 8 — Verificar orden de aparición

Tus labs se ordenan por fecha de más reciente a más antigua.

Si quieres que el nuevo lab aparezca primero, deja una fecha más reciente o igual y asegúrate de que el título ya marque bien el orden.

Paso 9 — Probar build de producción

Esto es importante. No te quedes solo con npm run dev.

Ejecuta:

npm run build

Si no da error, el contenido es válido para producción.

Paso 10 — Subir cambios
git add .
git commit -m "Improve Lab 01 and publish Astro GitHub Pages lab"
git push
Paso 11 — Esperar al despliegue

En GitHub:

entra en tu repo
abre la pestaña Actions
espera a que el workflow termine en verde

Luego revisa la web pública.