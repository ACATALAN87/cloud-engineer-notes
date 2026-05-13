---
title: "Automatización IaC de Couchbase Capella"
description: "Automatización completa del despliegue de clústeres Couchbase Capella mediante GitHub Actions y Terraform."
date: 2025-11-15
status: live
category: automation
stack:
  - Terraform
  - GitHub Actions
  - Couchbase Capella
  - OIDC
  - YAML
highlights:
  - "Provisioning declarativo de clústeres y buckets"
  - "Autenticación keyless con OIDC"
  - "Pipeline matricial para múltiples entornos"
---

Implementación de Infrastructure as Code para la gestión completa de la plataforma
Couchbase Capella, integrada en el flujo de delivery empresarial.

## Contexto

Couchbase Capella es la oferta DBaaS de Couchbase sobre Azure. Aunque ofrece un
portal web completo, gestionar clústeres en producción desde el portal a mano
no es viable: no es reproducible, no es auditable y no escala a varios entornos.

## Solución

Provider de Terraform `couchbase/couchbase-capella` orquestado desde un workflow
de GitHub Actions con autenticación OIDC keyless.

- **Sin secretos estáticos**: la federación OIDC entre GitHub y Couchbase Capella
  elimina la necesidad de guardar API keys de larga duración.
- **Pipeline matricial**: el mismo workflow se ejecuta para dev, preprod y prod
  con variables específicas por entorno.
- **Drift detection**: en cada PR, `terraform plan` muestra cualquier diferencia
  entre el código y el estado real de la plataforma.

> Documentación detallada y módulos públicos en preparación.
