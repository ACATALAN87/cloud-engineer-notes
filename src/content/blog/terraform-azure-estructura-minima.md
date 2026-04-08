---
title: "Terraform + Azure: estructura mínima para trabajar bien"
description: "Base práctica para proyectos limpios: módulos, estados remotos, naming y separación por entornos."
date: 2026-04-08
draft: false
tags: ["Terraform", "Azure", "IaC"]
---

Cuando empiezas con Terraform en Azure, el problema no suele ser escribir recursos. El problema real es construir una base que no se deteriore rápido.

## Qué debería tener una estructura mínima

- separación por entornos
- backend remoto para el state
- convenciones de naming
- variables claras
- módulos reutilizables solo donde tenga sentido

## Qué evitar al principio

No conviene abstraer demasiado pronto. Primero necesitas una estructura comprensible y operable.

## Enfoque recomendado

Para proyectos pequeños o medianos, una estructura simple y explícita suele funcionar mejor que una capa excesiva de módulos y wrappers.
