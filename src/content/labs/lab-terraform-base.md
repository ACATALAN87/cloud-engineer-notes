---
title: "Lab 02 — Terraform base structure for Azure environments"
description: "Minimal but production-ready Terraform layout for reproducible Azure infrastructure with remote state and workspace separation."
date: 2026-04-08
draft: false
stack: ["Terraform", "Azure", "GitHub Actions"]
difficulty: "intermediate"
labType: "hands-on"
source: "https://developer.hashicorp.com/terraform/tutorials/azure-get-started"
sourceName: "HashiCorp Learn"
---

Este laboratorio documenta una base mínima para desplegar infraestructura de forma limpia y repetible.

## Objetivo

Tener un punto de partida útil para:

- separar dev y prod
- mantener state remoto
- aplicar convenciones consistentes
- integrar despliegue en CI/CD

## Alcance

No busca cubrir todos los casos. Busca una base razonable para trabajar bien desde el principio.
