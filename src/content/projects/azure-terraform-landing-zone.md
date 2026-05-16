---
title: "Azure Landing Zone with Terraform"
description: "Diseño e implementación de una Azure Landing Zone enterprise siguiendo el Cloud Adoption Framework: hub-and-spoke, gobernanza con Management Groups, identidad con Entra ID, seguridad defense-in-depth, observabilidad y CI/CD con OIDC — todo declarativo en Terraform."
date: 2026-03-01
status: in-progress
category: infrastructure
featured: true
cover: images/projects/azure-lz/ESLZ.gif
stack:
  - Azure
  - Terraform
  - Azure DevOps
  - GitHub Actions
  - Hub-and-Spoke
  - Private Endpoints
  - Azure Firewall
  - Azure Policy
  - Entra ID
  - Log Analytics
  - OIDC
highlights:
  - "Topología hub-and-spoke con peering bidireccional y resolución DNS privada"
  - "Jerarquía de Management Groups alineada con el Cloud Adoption Framework"
  - "Defense-in-depth: Entra ID + PIM, Key Vault, Defender for Cloud, Azure Policy"
  - "Módulos Terraform reutilizables con remote state cifrado en Azure Blob"
  - "CI/CD con autenticación OIDC keyless y aprobación manual para producción"
  - "Observabilidad centralizada: Log Analytics, NSG Flow Logs y Activity Logs"
repoUrl: https://github.com/ACATALAN87/azure-landing-zone-terraform
---

## Por qué una Landing Zone

Una **Azure Landing Zone** es la base sobre la que se construye todo lo demás. No es
un servicio que se contrata, es un conjunto de decisiones tomadas *antes* de
empezar a desplegar workloads: cómo se organiza la suscripción, cómo se conectan
las redes, quién tiene acceso a qué, dónde van los logs y cómo se evita que el
entorno se degrade con el tiempo.

Construir workloads sin una landing zone funciona los primeros tres meses. A
partir del sexto se convierte en deuda técnica de la que es muy caro salir:
recursos sin tags, IPs solapadas entre suscripciones, accesos olvidados, logs
dispersos y políticas inexistentes. Esta es la razón por la que el **Cloud
Adoption Framework (CAF)** de Microsoft existe — y este proyecto es mi
implementación de referencia de sus principios.

> Este proyecto está **en desarrollo activo**. Aquí documento las decisiones de
> diseño, los módulos Terraform y las lecciones aprendidas. El repositorio
> contendrá el código completo una vez estabilizado.

---

## Arquitectura · Hub-and-Spoke

El patrón **hub-and-spoke** es el estándar de facto para topologías Azure
enterprise. Una única VNet central (el *hub*) concentra los servicios
compartidos — firewall, VPN/ExpressRoute, Bastion, Private DNS — y cada
workload vive en su propia VNet (*spoke*) peerada al hub.

![Topología hub-and-spoke con cuatro spokes, on-premises e Internet](/cloud-engineer-notes/images/projects/azure-lz/hub-and-spoke.svg)

### Por qué hub-and-spoke y no Virtual WAN

| Criterio | Hub-and-spoke (este proyecto) | Virtual WAN |
| --- | --- | --- |
| Control granular | Alto — peering, rutas y firewall son explícitos | Más opinión de Microsoft |
| Coste base | Más bajo en escenarios <10 spokes | Mejor a partir de N regiones |
| Multi-región | Manual (peerings cruzados o ExR) | Nativo |
| Curva de aprendizaje | Familiar para equipos de networking | Requiere repensar el modelo |

Para un cliente enterprise con dos o tres regiones y necesidad de control fino
sobre rutas y políticas de firewall, hub-and-spoke gana por previsibilidad y
coste operativo.

### Componentes del Hub

- **Azure Firewall Premium** con política jerárquica (parent policy en el hub,
  child policies por landing zone).
- **VPN Gateway** o **ExpressRoute Gateway** para conectividad híbrida.
- **Azure Bastion** para acceso a VMs sin exponer IPs públicas.
- **Private DNS Zones** centralizadas (`privatelink.*`) con auto-registration
  desde los spokes.
- **Route Tables (UDRs)** que fuerzan el tráfico spoke→spoke a través del
  firewall (forced tunneling).

### Direccionamiento IP

Un espacio plano sin solapamientos es **innegociable**. Empiezo desde
`10.0.0.0/8` y reservo bloques amplios desde el principio:

```text
10.0.0.0/16     hub-primary           (DC primario)
10.1.0.0/16     hub-secondary         (DR / región secundaria)
10.10.0.0/16    spoke-identity
10.20.0.0/16    spoke-prod-workloads
10.30.0.0/16    spoke-dev-workloads
10.40.0.0/16    spoke-data-platform
10.100.0.0/14   reservado-futuro      (4 x /16 sin asignar)
```

Lección dura: asignar `/24` "porque ya escalaré" cuesta el doble que asignar
`/16` desde el inicio. Las VNets no se pueden ampliar fácilmente sin
recreación.

---

## Gobernanza · Management Groups y suscripciones

La jerarquía de **Management Groups** es donde aplico las políticas que se
heredan por toda la organización. La estructura del CAF distingue claramente
entre **Platform** (todo lo que sirve a otros: identidad, networking,
management) y **Landing Zones** (los workloads productivos).

![Jerarquía Management Groups CAF con cascada de políticas](/cloud-engineer-notes/images/projects/azure-lz/management-groups.svg)

### Diseño de la jerarquía

```text
Tenant Root
├── Platform
│   ├── Identity         → sub-identity-prod
│   ├── Management       → sub-mgmt (Log Analytics, Automation)
│   └── Connectivity     → sub-hub (Hub VNet + Firewall + Gateways)
├── Landing Zones
│   ├── Corp             → sub-lz-corp-{env}      (workloads internos)
│   └── Online           → sub-lz-online-{env}    (workloads públicos)
└── Sandbox              → sub-sandbox-*           (PoCs aislados, budget cap)
```

### Política heredada

A nivel **Tenant Root** aplico el mínimo común denominador. Todo lo demás se
cascadea hacia abajo:

| Nivel | Iniciativa | Efecto |
| --- | --- | --- |
| Tenant Root | `Audit-PublicIPOnNICs` | Audit |
| Tenant Root | `Deny-Resources-OutsideAllowedRegions` | Deny |
| Platform | `Enforce-TLS1.2-OnStorage` | Deny |
| Landing Zones | `Require-NSGFlowLogs` | DeployIfNotExists |
| Landing Zones | `Require-PrivateEndpoints-OnPaaS` | Audit (→ Deny en fase 2) |
| Sandbox | `Budget-Cap-250USD-Monthly` | Action group + alert |

### Tagging strategy

Etiquetas obligatorias enforced por Policy `Require-Tag-And-Modify`:

```hcl
tags = {
  Environment    = "prod"            # prod | preprod | dev | sandbox
  CostCenter     = "CC-1024"
  Owner          = "platform-team@empresa.com"
  Application    = "data-platform"
  Criticality    = "tier-1"          # tier-1 | tier-2 | tier-3
  DeployedBy     = "terraform"
  DataClass      = "internal"        # public | internal | confidential | restricted
}
```

---

## Identidad y seguridad · Defense-in-depth

La seguridad en Azure no es un producto, es una **estrategia por capas**.
Diseño cada landing zone asumiendo que las capas superiores pueden fallar.

![Stack de seguridad, gobernanza y observabilidad en capas](/cloud-engineer-notes/images/projects/azure-lz/security-stack.svg)

### Capa 1 · Identidad

- **Microsoft Entra ID** como único IdP. Sin usuarios locales en suscripciones.
- **Conditional Access** que exige MFA + dispositivo compliant + ubicación
  permitida para acceder al portal.
- **Privileged Identity Management (PIM)** para roles privilegiados — *Owner*,
  *Contributor*, *User Access Administrator* solo son JIT, con justificación
  obligatoria y aprobación.
- **Groups, no users**: las asignaciones RBAC van siempre a grupos de Entra ID,
  nunca a usuarios individuales. Esto sobrevive a cambios de personal y se
  audita más fácil.

### Capa 2 · RBAC con menor privilegio

Roles personalizados por escenario:

```hcl
resource "azurerm_role_definition" "network_reader_with_diagnostics" {
  name        = "Network Reader + Diagnostics"
  scope       = data.azurerm_management_group.platform.id

  permissions {
    actions = [
      "Microsoft.Network/*/read",
      "Microsoft.Insights/diagnosticSettings/read",
      "Microsoft.OperationalInsights/workspaces/read",
    ]
    not_actions = []
  }

  assignable_scopes = [data.azurerm_management_group.platform.id]
}
```

### Capa 3 · Secretos en Key Vault

- Un Key Vault **por landing zone**, no compartidos entre entornos.
- Habilitado **RBAC authorization model** (no access policies).
- **Private Endpoint** obligatorio — el plano de datos no escucha en Internet.
- **Soft delete** y **purge protection** activados (Policy enforced).
- Rotación automatizada de claves con Event Grid + Functions.

### Capa 4 · Defender for Cloud

- Plan **Defender CSPM** habilitado en todas las suscripciones — gratuito en su
  tier free para postura, de pago para CWPP.
- **Secure Score** monitorizado como KPI mensual.
- Recomendaciones críticas integradas en alertas vía Logic Apps.

---

## Networking · Lo que diferencia un buen diseño

### Private Endpoints vs Service Endpoints

| Aspecto | Service Endpoint | Private Endpoint |
| --- | --- | --- |
| Trafico | Sigue saliendo a internet backbone Azure | 100% privado en tu VNet |
| Coste | Gratis | Por endpoint + DNS |
| DNS | Sigue resolviendo a IP pública | Resuelve a IP privada vía Private DNS |
| Cross-tenant | No | Sí (con aprobación) |
| Mi recomendación | **Evitar para PaaS sensible** | **Default para storage, KV, SQL, ACR…** |

### Private DNS centralizadas

Las zonas `privatelink.*` viven en la suscripción de Connectivity y se enlazan
(`vnet link`) a todos los spokes. Cuando un spoke crea un Private Endpoint, el
A-record se registra automáticamente en la zona central. Esto evita el
clásico problema de "tengo DNS correcto en un spoke pero no resuelve desde el
otro".

```hcl
# Hub: una zona privada por servicio
resource "azurerm_private_dns_zone" "blob" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = azurerm_resource_group.connectivity.name
}

# Link a cada spoke (en un módulo iterado por cada VNet)
resource "azurerm_private_dns_zone_virtual_network_link" "blob_to_spokes" {
  for_each              = toset(var.spoke_vnet_ids)
  name                  = "link-${replace(each.key, "/", "-")}"
  resource_group_name   = azurerm_resource_group.connectivity.name
  private_dns_zone_name = azurerm_private_dns_zone.blob.name
  virtual_network_id    = each.value
  registration_enabled  = false   # solo resolución, no auto-registro
}
```

### Azure Firewall con jerarquía de políticas

- **Parent policy** en el hub: reglas globales — DNAT mínimo, bloqueo de
  destinos prohibidos, app rules para SaaS imprescindible (Microsoft Update,
  GitHub, package registries).
- **Child policy** por landing zone: reglas específicas del workload, hereda
  todo lo del parent y solo añade.
- **Forced tunneling** mediante UDRs: el tráfico spoke→Internet pasa
  obligatoriamente por el firewall (`0.0.0.0/0 → AzureFirewall`).

### NSG strategy

NSG en **subnet level**, no en NIC level. Reglas mínimas y nombres
auto-explicativos:

```text
allow-https-from-appgw-to-app-subnet
allow-sql-from-app-to-data-subnet
deny-all-inbound-from-internet
```

Flow logs obligatorios → Storage Account → Traffic Analytics en Log Analytics.

---

## CI/CD · Terraform sin claves estáticas

![Pipeline CI/CD con OIDC, plan, aprobación manual y apply](/cloud-engineer-notes/images/projects/azure-lz/cicd-pipeline.svg)

### Autenticación OIDC keyless

El error más común en pipelines Terraform es guardar un Service Principal con
client secret en GitHub Secrets / Azure DevOps Library. Eso significa:

- Un secreto que rota manualmente (o nunca).
- Si se filtra, control de daños limitado.
- Auditoría imposible — no se sabe quién lo usó.

La solución correcta es **OIDC federado**:

```yaml
# .github/workflows/terraform.yml
permissions:
  id-token: write   # ← clave para OIDC
  contents: read

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: azure/login@v2
        with:
          client-id:       ${{ secrets.AZURE_CLIENT_ID }}        # solo el ID, no secret
          tenant-id:       ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - run: terraform init
      - run: terraform plan -out=tfplan
```

En Azure, la User-Assigned Managed Identity tiene una **federated credential**
que confía en GitHub OIDC para un repo y branch concretos:

```hcl
resource "azurerm_federated_identity_credential" "github_main" {
  name                = "github-main-branch"
  resource_group_name = azurerm_resource_group.identity.name
  parent_id           = azurerm_user_assigned_identity.terraform.id
  audience            = ["api://AzureADTokenExchange"]
  issuer              = "https://token.actions.githubusercontent.com"
  subject             = "repo:ACATALAN87/azure-landing-zone-terraform:ref:refs/heads/main"
}
```

Resultado: **cero secretos** que rotar. Si alguien clona el repo y lo pushea
desde otro lugar, no autentica.

### Pipeline stages

| Stage | Trigger | Acción |
| --- | --- | --- |
| `validate` | PR abierta | `terraform fmt -check`, `terraform validate`, `tflint`, `tfsec`, `checkov` |
| `plan` | PR abierta | `terraform plan -out=tfplan`, comentario en PR con `infracost diff` |
| `manual-approval` | Merge a `main` (solo prod) | Reviewer aprueba en GitHub Environments |
| `apply` | Tras approval | `terraform apply tfplan` con identidad de menor privilegio |
| `notify` | Siempre | Mensaje a Teams con resultado |

### Remote state con Azure Blob

```hcl
terraform {
  required_version = ">= 1.7.0"
  backend "azurerm" {
    resource_group_name  = "rg-tfstate-prod"
    storage_account_name = "stterraformstateacatalan"
    container_name       = "tfstate"
    key                  = "landing-zone/prod.tfstate"
    use_oidc             = true       # ← keyless en el backend también
    use_azuread_auth     = true
  }
}
```

El Storage Account está protegido con:
- **Private Endpoint** (no expone API pública).
- **Versioning** activado por si hay corrupción.
- **Soft delete** de blobs (14 días retención).
- **RBAC**: rol *Storage Blob Data Contributor* solo a la MI del pipeline.
- **Customer Managed Keys** desde Key Vault.

---

## Estructura del repositorio Terraform

```text
azure-landing-zone-terraform/
├── modules/
│   ├── management-group-hierarchy/
│   ├── hub-network/
│   ├── spoke-network/
│   ├── private-dns-zones/
│   ├── azure-firewall/
│   ├── log-analytics-workspace/
│   ├── policy-assignments/
│   ├── key-vault/
│   └── rbac-assignments/
├── environments/
│   ├── prod/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── preprod/
│   └── dev/
├── policies/
│   ├── initiatives/
│   └── definitions/
├── .github/
│   └── workflows/
│       ├── validate.yml
│       ├── plan.yml
│       └── apply.yml
└── docs/
    ├── architecture.md
    ├── decision-records/
    └── runbooks/
```

### Ejemplo de módulo: spoke-network

```hcl
# modules/spoke-network/main.tf
resource "azurerm_virtual_network" "spoke" {
  name                = "vnet-${var.workload}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = [var.address_space]

  dynamic "subnet" {
    for_each = var.subnets
    content {
      name           = subnet.value.name
      address_prefix = subnet.value.cidr
    }
  }

  tags = var.tags
}

resource "azurerm_virtual_network_peering" "spoke_to_hub" {
  name                         = "peer-spoke-to-hub"
  resource_group_name          = var.resource_group_name
  virtual_network_name         = azurerm_virtual_network.spoke.name
  remote_virtual_network_id    = var.hub_vnet_id
  allow_forwarded_traffic      = true
  allow_gateway_transit        = false
  use_remote_gateways          = true     # ← para usar VPN/ExR del hub
}

resource "azurerm_virtual_network_peering" "hub_to_spoke" {
  name                         = "peer-hub-to-${var.workload}-${var.environment}"
  resource_group_name          = var.hub_resource_group_name
  virtual_network_name         = var.hub_vnet_name
  remote_virtual_network_id    = azurerm_virtual_network.spoke.id
  allow_forwarded_traffic      = true
  allow_gateway_transit        = true
  use_remote_gateways          = false
}

# Diagnostics: forzados por convención
resource "azurerm_monitor_diagnostic_setting" "spoke" {
  name                       = "send-to-law"
  target_resource_id         = azurerm_virtual_network.spoke.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log { category = "VMProtectionAlerts" }
  metric      { category = "AllMetrics" }
}
```

---

## Observabilidad · Una sola fuente de verdad

Un **Log Analytics Workspace** centralizado en la suscripción `sub-mgmt`
recibe diagnostic settings de todos los recursos críticos. La regla es simple:

> Si un recurso no envía logs a Log Analytics, no existe para mí.

### Política para forzar diagnostic settings

`DeployIfNotExists` configurado en la iniciativa `Enable-Diagnostics-Baseline`
para los recursos que más importan:

- Activity Logs (subscription level)
- Key Vault audit logs
- Azure Firewall logs + metrics
- NSG flow logs
- Application Gateway
- App Service / Functions
- SQL audit
- Azure Kubernetes Service

### KQL recetas que uso a diario

```kql
// Top 10 deny rules en Azure Firewall — últimas 24h
AZFWNetworkRule
| where TimeGenerated > ago(24h)
| where Action == "Deny"
| summarize Count = count() by RuleCollection, RuleName, DestinationIp
| top 10 by Count

// Detección de RBAC role assignments en Owner — últimas 7d
AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue endswith "ROLEASSIGNMENTS/WRITE"
| where Properties has "Owner"
| project TimeGenerated, Caller, ResourceGroup, Properties

// Subnets sin NSG asignado (compliance check)
Resources
| where type =~ "microsoft.network/virtualnetworks"
| mv-expand subnet = properties.subnets
| extend subnetName = subnet.name, nsg = subnet.properties.networkSecurityGroup
| where isnull(nsg)
| project subscriptionId, resourceGroup, name, subnetName
```

---

## Casos de uso reales

### 1 · Migración enterprise a Azure

Cliente con 200+ servidores on-premises que migra a Azure. La landing zone
proporciona desde el día 1:
- Conectividad ExpressRoute al data center existente vía Hub.
- Suscripción por entorno con RBAC y costes separados.
- Logging y compliance baseline antes de migrar la primera workload.
- Plantilla de spoke reutilizable: un nuevo equipo provisiona su entorno en
  20 minutos vía PR.

### 2 · Plataforma multi-tenant SaaS

Spokes por cliente, política de aislamiento estricta (NSG deniega tráfico
inter-spoke), Front Door global apuntando a múltiples spokes regionales. La
jerarquía de Management Groups permite políticas distintas por tier de cliente.

### 3 · Compliance regulado (banca, salud)

`Microsoft Cloud Security Benchmark` y `PCI-DSS` aplicados como Policy
Initiatives a nivel **Tenant Root**. Cualquier violación de las reglas se
detecta como *non-compliant* y se reporta a Defender for Cloud y a Sentinel
para investigación.

### 4 · Sandbox controlado para desarrolladores

Sub-MG `Sandbox` con:
- Budget máximo $250/mes por suscripción (alertas a 50%, 80%, 100%).
- Allowed regions: solo `westeurope` y `northeurope`.
- VM SKU restringidas a `Standard_B*` (familias económicas).
- Auto-shutdown a las 19:00 vía Azure Automation.
- Desplegado a través del **Subscription Vending** module — un PR crea suscripción
  + MG assignment + tags + budget en una sola operación.

---

## Lecciones aprendidas (las que duelen)

1. **No subestimar el direccionamiento IP**. Cambiar el CIDR de una VNet
   implica recrear todo. Reservar `/14` aunque al principio parezca excesivo.

2. **Tagging desde el día 1 o nunca**. Aplicar tagging policy meses después
   significa peinar a mano cientos de recursos.

3. **DNS es el 80% de los problemas de Private Endpoints**. Cuando algo no
   resuelve, casi siempre es porque el vnet link está mal o la zona apunta a
   la suscripción equivocada.

4. **Azure Firewall sin policy parent escala mal**. Empezar con jerarquía de
   policies desde el día 1, incluso si solo hay una landing zone.

5. **PIM al principio, no al final**. Habilitar PIM cuando ya tienes 50
   personas con Owner permanente es una pesadilla política.

6. **El Storage Account del tfstate es producción**. Tratarlo con el mismo
   rigor que cualquier recurso productivo — backup, monitorización, RBAC
   estricto.

7. **Documentar las decisiones, no solo el código**. Architecture Decision
   Records (ADR) en `docs/decision-records/` ahorran semanas cuando alguien
   nuevo se incorpora.

---

## Referencias

- [Cloud Adoption Framework — Azure landing zone design areas](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas)
- [Enterprise-Scale Landing Zone reference architecture](https://github.com/Azure/Enterprise-Scale)
- [Azure landing zones Terraform module (CAF Terraform)](https://github.com/Azure/terraform-azurerm-caf-enterprise-scale)
- [Microsoft Cloud Security Benchmark](https://learn.microsoft.com/security/benchmark/azure/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)

---

> Este proyecto es un **trabajo en curso** y un campo de pruebas constante. Las
> decisiones documentadas reflejan mi experiencia real con infraestructura
> Azure en entornos enterprise, no el contenido de un certification training.
> Si trabajas en algo parecido y quieres discutir trade-offs, escríbeme en
> LinkedIn.
