---
title: "Personal Cloud Engineer Portfolio"
description: "Portfolio web moderno construido con Astro, React y Tailwind CSS, desplegado de forma automática en GitHub Pages mediante GitHub Actions."
date: 2026-05-13
status: live
category: web
featured: true
stack:
  - Astro
  - React
  - TypeScript
  - Tailwind CSS
  - GitHub Actions
  - GitHub Pages
repoUrl: https://github.com/acatalan87/WebCloudEngineer
liveUrl: https://acatalan87.github.io/cloud-engineer-notes
highlights:
  - "Diseño moderno con glassmorphism, gradientes y animaciones canvas"
  - "Despliegue automático en GitHub Pages vía GitHub Actions"
  - "100% estático, sin coste de hosting"
  - "Optimizado para Core Web Vitals y accesibilidad"
---

Este portfolio web ha sido construido desde cero como showcase técnico y profesional.
Combina **Astro** para el rendering estático con **React** para las interacciones del
cliente, y **Tailwind CSS v4** para el sistema de diseño.

## Arquitectura

- **Astro 6** con SSG (Static Site Generation) para máximo rendimiento.
- **Islands architecture**: los componentes interactivos (Hero, Header, animaciones)
  se hidratan en cliente, el resto es HTML puro.
- **GitHub Actions** para CI/CD: cada push a `main` dispara build y deploy automático.
- **Content collections** tipadas con Zod para gestionar posts, labs y proyectos.

## Características visuales

- Fondo animado de partículas conectadas con Canvas API que reacciona al cursor.
- Microanimaciones de scroll basadas en `IntersectionObserver`.
- Tarjetas con efecto glass y spotlight hover.
- Gradientes dinámicos en texto y bordes.
- Respeta `prefers-reduced-motion`.
