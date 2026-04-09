---
title: "Lab 01 — Web técnica estática con Astro y GitHub Pages"
description: "Construcción de una web personal técnica con Astro, contenido Markdown y despliegue automático mediante GitHub Actions."
date: 2026-04-08
draft: false
stack: ["Astro", "GitHub Pages", "GitHub Actions", "Markdown"]
---

## Contexto

Quería construir una web personal técnica que sirviera como:

- portfolio
- espacio de publicación
- laboratorio de aprendizaje

La solución debía cumplir:

- coste prácticamente nulo
- mantenimiento sencillo
- contenido versionado en Git
- despliegue automático sin infraestructura compleja

Con ese criterio, opté por una arquitectura estática basada en Astro y GitHub Pages.

---

## Objetivo

Diseñar una web técnica con:

- páginas estáticas (inicio, blog, labs, about)
- contenido en Markdown
- despliegue automático con cada push a `main`
- base fácil de evolucionar

---

## Stack elegido

### Astro
Generador de sitio estático con buen rendimiento y enfoque claro para contenido.

### Markdown
Permite versionado limpio, simplicidad y control total del contenido.

### GitHub Pages
Hosting gratuito con integración directa con GitHub.

### GitHub Actions
Automatización del build y despliegue.

---

## Arquitectura

**Flujo general:**

→ Edición local  
→ commit / push  
→ GitHub Actions  
→ build Astro  
→ deploy en GitHub Pages  

La web sigue un enfoque **static-first**:

- el contenido se resuelve en build
- no hay base de datos
- no hay backend
- la publicación depende del pipeline de CI/CD

---

## Estructura del proyecto

```text
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
```
---

 ## Decisiones de diseño

### 1. Separar contenido y presentación

- contenido → `src/content`
- renderizado → `pages` y `layouts`

Esto permite mantener el proyecto ordenado y facilita su evolución sin mezclar lógica y contenido.

---

### 2. Usar content collections

Ventajas principales:

- validación del frontmatter
- consistencia en los datos
- menos errores en tiempo de render

---

### 3. Mantener arquitectura estática

No se añadió:

- CMS
- base de datos
- backend

La prioridad fue simplicidad, mantenibilidad y coste cero.

---

## Implementación

### 1. Estructura base

Se definieron las rutas principales:

- `/`
- `/blog`
- `/labs`
- `/about`

Además, se creó un layout común para:

- navegación
- estilos globales
- estructura compartida

---

### 2. Contenido en Markdown

Cada entrada utiliza frontmatter:

```yaml
title: "Lab 01 — Web técnica estática con Astro y GitHub Pages"
description: "Construcción de una web personal técnica con Astro..."
date: 2026-04-08
draft: false
stack: ["Astro", "GitHub Pages", "GitHub Actions", "Markdown"]
```
---

Esto permite estructurar el contenido y reutilizarlo fácilmente en las vistas.

### 3. Rutas dinámicas

Se implementaron con:

src/pages/blog/[slug].astro
src/pages/labs/[slug].astro

Esto permite generar páginas automáticamente a partir de los archivos Markdown.

### Problemas encontrados
1. Versión de Node

Astro requería Node 22 y el entorno local estaba en Node 20.

Solución: actualizar la versión de Node.

2. Subruta en GitHub Pages

El sitio se publica en:

/cloud-engineer-notes/

Los enlaces absolutos (/blog, /labs) provocaban errores 404.

Solución:

const base = import.meta.env.BASE_URL;
<a href={`${base}blog/`}>Blog</a>
3. Uso incorrecto de slug

La colección devuelve id, no slug.

Solución:

lab.id.replace(/\.md$/, "")
Pipeline de despliegue

### El flujo de despliegue es:

push a main
instalación de dependencias
build del sitio
generación de /dist
despliegue en GitHub Pages
Resultado

### El proyecto terminó con:

web pública desplegada automáticamente
contenido versionado en Git
estructura preparada para crecer
Lecciones aprendidas
la gestión del base path es crítica en static hosting
GitHub Pages es simple pero sensible a rutas
Astro encaja muy bien para contenido técnico
CI/CD aporta valor incluso en proyectos pequeños

### Mejoras futuras
dominio propio
mejora visual del sitio
sección de briefing cloud
generación asistida con IA
migración a Azure
Conclusión

Este laboratorio establece una base técnica sólida para una web personal profesional, con arquitectura simple, despliegue automatizado y estructura preparada para evolucionar.