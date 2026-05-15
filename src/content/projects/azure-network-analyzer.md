---
title: "Azure Network Analyzer"
description: "Herramienta web para analizar y visualizar topologías de red Azure con detección automática de problemas de configuración — construida en Python/FastAPI y desplegada sobre un entorno de prueba aprovisionado con Terraform."
date: 2026-05-15
status: in-progress
category: platform
featured: true
stack:
  - Python
  - FastAPI
  - Azure SDK
  - Terraform
  - vis.js
  - Azure Network
highlights:
  - "Descubrimiento automático de VNets, Subnets, NSGs y peerings vía Azure SDK"
  - "Visualización interactiva de la topología como grafo con vis.js"
  - "Motor de detección de problemas: CIDRs solapados, peerings rotos, subnets sin NSG"
  - "Entorno de prueba reproducible aprovisionado con Terraform"
  - "Solo lectura — cero escrituras a Azure, coste operativo nulo"
---

Hay un problema recurrente en entornos Azure de mediana complejidad: nadie tiene
una visión completa de cómo están conectadas las redes. VNets, subnets, peerings,
NSGs y route tables viven en el portal de Azure, desperdigados entre resource
groups y suscripciones. Revisarlos a mano no escala y las sorpresas llegan cuando
ya hay un incidente.

Este proyecto es mi respuesta a ese problema: una webapp que se conecta a una
suscripción Azure, descubre toda la topología de red y la presenta en un grafo
interactivo con los problemas de configuración marcados en rojo.

---

## Arquitectura de la herramienta

El diseño es deliberadamente simple. Sin base de datos, sin estado persistente,
sin escrituras a Azure.

```text
azure-network-analyzer/
├── main.py              # FastAPI: endpoints REST y serialización
├── analyzer/
│   ├── topology.py      # Descubrimiento con Azure SDK (solo lectura)
│   └── problems.py      # Motor de detección de problemas
├── static/
│   ├── index.html       # UI completa (single page)
│   ├── app.js           # Grafo vis.js + llamadas a la API
│   └── styles.css       # Dark mode
└── requirements.txt
```

### Backend — FastAPI + Azure SDK

El módulo `topology.py` usa `azure-mgmt-network` con `DefaultAzureCredential`
para descubrir en paralelo todos los recursos de red de una suscripción:

```python
def fetch_topology(subscription_id: str) -> NetworkTopology:
    credential = DefaultAzureCredential()
    client = NetworkManagementClient(credential, subscription_id)

    # Descubrimiento en tres pasadas: NSGs → Route Tables → VNets+Subnets+Peerings
    # Las dos primeras cargan lookups para que la tercera sea O(1) al resolver refs
    topology = NetworkTopology(subscription_id=subscription_id)
    _fetch_nsgs(client, topology)
    _fetch_route_tables(client, topology)
    _fetch_vnets(client, topology)
    return topology
```

El orden importa: NSGs y route tables se cargan primero como diccionarios
indexados por ID, para que al iterar subnets no haya N+1 queries a la API.

### Motor de detección

`problems.py` implementa siete checks independientes, cada uno devuelve una lista
de `Problem(severity, resource_id, title, description)`. El nivel de severidad
determina el color del nodo en el grafo:

| Severidad | Color en el grafo | Checks incluidos |
|-----------|-------------------|-----------------|
| 🔴 Crítico | Borde rojo | Peering disconnected, CIDRs solapados |
| 🟡 Advertencia | Borde naranja | Subnet sin NSG, NSG sin reglas custom, ruta 0.0.0.0/0 sin next hop |
| 🔵 Info | Borde azul claro | VNet sin peerings, subnet vacía |

### Frontend — grafo interactivo

La UI es una single page que llama a `/api/topology` con el Subscription ID,
recibe el grafo serializado y lo renderiza con **vis.js Network**. Cada nodo
es clickable y muestra un panel de detalle con las reglas NSG o la tabla de rutas.

---

## Entorno de prueba con Terraform

Para validar la herramienta necesitaba un entorno real en Azure con casos de uso
conocidos: recursos correctamente configurados junto a recursos con problemas
deliberados. El entorno de prueba está completamente declarado en Terraform.

### Diseño del entorno

El objetivo era cubrir cada tipo de detección con al menos un caso positivo:

```text
rg-network-analyzer-test  (westeurope)
├── vnet-network-analyzer-a     10.0.0.0/16
│   ├── subnet-a1-with-nsg      10.0.1.0/24  ← NSG correcto asociado ✅
│   └── subnet-a2-no-nsg        10.0.2.0/24  ← Sin NSG → WARNING 🟡
│       └── rt-basic                          ← Route table asociada
├── vnet-network-analyzer-b     10.1.0.0/16
│   └── subnet-b1-empty-nsg     10.1.1.0/24  ← NSG vacío → WARNING 🟡
├── vnet-network-analyzer-c-isolated  10.2.0.0/16
│   └── subnet-c1               10.2.1.0/24  ← VNet sin peering → INFO 🔵
├── peering-a-to-b  (bidireccional)           ← Peering sano ✅
├── nsg-with-rules                            ← Con reglas HTTPS/HTTP ✅
└── nsg-empty-no-custom-rules                 ← Sin reglas → WARNING 🟡
```

Tres VNets, cinco subnets, dos NSGs, un route table y un peering bidireccional.
Lo suficiente para que el analizador tenga algo interesante que decir.

### Código Terraform — `main.tf`

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }
  required_version = ">= 1.5.0"
}

provider "azurerm" {
  features {}
}

# VNet A — Con peering hacia VNet B
resource "azurerm_virtual_network" "vnet_a" {
  name                = "vnet-network-analyzer-a"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]
  tags                = var.tags
}

# Subnet A1 — Con NSG correcto (caso OK)
resource "azurerm_subnet" "subnet_a1" {
  name                 = "subnet-a1-with-nsg"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet_a.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Subnet A2 — SIN NSG (provoca WARNING)
resource "azurerm_subnet" "subnet_a2" {
  name                 = "subnet-a2-no-nsg"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet_a.name
  address_prefixes     = ["10.0.2.0/24"]
}

# VNet C — Aislada, sin peerings (provoca INFO)
resource "azurerm_virtual_network" "vnet_c" {
  name                = "vnet-network-analyzer-c-isolated"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.2.0.0/16"]
  tags                = var.tags
}

# NSG con reglas correctas — asociado a subnet_a1
resource "azurerm_network_security_group" "nsg_correct" {
  name                = "nsg-with-rules"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "allow-https-inbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "deny-http-inbound"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  tags = var.tags
}
```

### Variables y outputs

```hcl
# variables.tf
variable "resource_group_name" {
  default = "rg-network-analyzer-test"
}

variable "location" {
  default = "westeurope"
}

variable "tags" {
  default = {
    environment = "test"
    project     = "azure-network-analyzer"
    managed_by  = "terraform"
  }
}
```

El `outputs.tf` incluye un resumen de los problemas esperados, útil para validar
que el analizador los detecta todos:

```hcl
output "problemas_esperados" {
  value = {
    warnings = [
      "subnet-a2-no-nsg → Subnet sin NSG asociado",
      "nsg-empty-no-custom-rules → NSG sin reglas personalizadas"
    ]
    info = [
      "vnet-network-analyzer-c-isolated → VNet sin peerings"
    ]
  }
}
```

---

## Despliegue del entorno de prueba

### Paso 1 — Autenticación y backend

```bash
# Login con Azure CLI
az login
az account set --subscription <SUBSCRIPTION_ID>

# Inicializar Terraform (descarga el provider azurerm ~3.90)
terraform init
```

<!-- SCREENSHOT: terraform init completado — output con "Terraform has been successfully initialized" -->

### Paso 2 — Plan y Apply

Sin `-auto-approve`, `terraform apply` presenta primero el plan completo y espera
confirmación explícita antes de crear nada. El plan muestra **16 recursos** a crear:
1 resource group, 3 VNets, 5 subnets, 2 peerings bidireccionales, 2 NSGs,
1 route table y 3 asociaciones.

<div style="margin:2.5rem 0;border-radius:.875rem;overflow:hidden;border:1px solid rgba(96,165,250,.15);box-shadow:0 8px 32px -12px rgba(0,0,0,.7),0 0 0 1px rgba(59,130,246,.08)">
  <div style="background:#1e1e20;padding:.55rem 1rem;display:flex;align-items:center;gap:.5rem;border-bottom:1px solid rgba(255,255,255,.06)">
    <span style="width:12px;height:12px;border-radius:50%;background:#ff5f57;flex-shrink:0;display:inline-block"></span>
    <span style="width:12px;height:12px;border-radius:50%;background:#febc2e;flex-shrink:0;display:inline-block"></span>
    <span style="width:12px;height:12px;border-radius:50%;background:#28c840;flex-shrink:0;display:inline-block"></span>
    <span style="flex:1;text-align:center;font-family:'JetBrains Mono',monospace;font-size:.72rem;color:#64748b;letter-spacing:.02em">az_deploy_network_resources — terraform apply</span>
  </div>
  <div style="background:linear-gradient(135deg,#0a0f1e,#050914);padding:1.25rem 1.5rem;overflow-x:auto;font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace;font-size:.78rem;line-height:1.7;color:#cbd5e1;white-space:pre"><span style="color:#e2e8f0;font-weight:600">angelluiscatalan@MacBook-M3-Pro-de-Angel</span><span style="color:#64748b"> az_deploy_network_resources</span><span style="color:#94a3b8"> % </span><span style="color:#f8fafc">terraform apply</span>

<span style="color:#94a3b8">Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:</span>
  <span style="color:#4ade80;font-weight:600">+</span><span style="color:#94a3b8"> create</span>

<span style="color:#94a3b8">Terraform will perform the following actions:</span>

  <span style="color:#64748b"># azurerm_resource_group.rg will be created</span>
  <span style="color:#4ade80">+</span> resource <span style="color:#67e8f9">"azurerm_resource_group"</span> <span style="color:#c084fc">"rg"</span> {
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">location</span> = <span style="color:#fde68a">"westeurope"</span>
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">name</span>     = <span style="color:#fde68a">"rg-network-analyzer-test"</span>
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">tags</span>     = { environment = <span style="color:#fde68a">"test"</span>, managed_by = <span style="color:#fde68a">"terraform"</span>, project = <span style="color:#fde68a">"azure-network-analyzer"</span> }
    }

  <span style="color:#64748b"># azurerm_virtual_network.vnet_a will be created</span>
  <span style="color:#4ade80">+</span> resource <span style="color:#67e8f9">"azurerm_virtual_network"</span> <span style="color:#c084fc">"vnet_a"</span> {
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">address_space</span> = [<span style="color:#fde68a">"10.0.0.0/16"</span>]
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">name</span>          = <span style="color:#fde68a">"vnet-network-analyzer-a"</span>
    }

  <span style="color:#64748b"># azurerm_virtual_network.vnet_b will be created</span>
  <span style="color:#4ade80">+</span> resource <span style="color:#67e8f9">"azurerm_virtual_network"</span> <span style="color:#c084fc">"vnet_b"</span> {
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">address_space</span> = [<span style="color:#fde68a">"10.1.0.0/16"</span>]
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">name</span>          = <span style="color:#fde68a">"vnet-network-analyzer-b"</span>
    }

  <span style="color:#64748b"># azurerm_virtual_network.vnet_c will be created</span>
  <span style="color:#4ade80">+</span> resource <span style="color:#67e8f9">"azurerm_virtual_network"</span> <span style="color:#c084fc">"vnet_c"</span> {
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">address_space</span> = [<span style="color:#fde68a">"10.2.0.0/16"</span>]
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">name</span>          = <span style="color:#fde68a">"vnet-network-analyzer-c-isolated"</span>
    }

  <span style="color:#64748b"># azurerm_network_security_group.nsg_correct will be created</span>
  <span style="color:#4ade80">+</span> resource <span style="color:#67e8f9">"azurerm_network_security_group"</span> <span style="color:#c084fc">"nsg_correct"</span> {
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">name</span> = <span style="color:#fde68a">"nsg-with-rules"</span>
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">security_rule</span> = [allow-https-inbound (100, Allow, Tcp:443), deny-http-inbound (200, Deny, Tcp:80)]
    }

  <span style="color:#64748b"># azurerm_network_security_group.nsg_empty will be created</span>
  <span style="color:#4ade80">+</span> resource <span style="color:#67e8f9">"azurerm_network_security_group"</span> <span style="color:#c084fc">"nsg_empty"</span> {
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">name</span>          = <span style="color:#fde68a">"nsg-empty-no-custom-rules"</span>
      <span style="color:#4ade80">+</span> <span style="color:#94a3b8">security_rule</span> = <span style="color:#64748b">(known after apply)</span>
    }

  <span style="color:#64748b"># azurerm_route_table.rt_basic / 4 subnets / 2 peerings / 3 associations will be created</span>
  <span style="color:#64748b">  [... 10 recursos adicionales omitidos por brevedad ...]</span>

<span style="color:#4ade80;font-weight:700">Plan: 16 to add, 0 to change, 0 to destroy.</span>

<span style="color:#94a3b8">Changes to Outputs:</span>
  <span style="color:#4ade80">+</span> <span style="color:#c084fc">problemas_esperados</span> = {
      <span style="color:#4ade80">+</span> <span style="color:#fbbf24">warnings</span> = [
          <span style="color:#4ade80">+</span> <span style="color:#fde68a">"subnet-a2-no-nsg → Subnet sin NSG asociado"</span>,
          <span style="color:#4ade80">+</span> <span style="color:#fde68a">"nsg-empty-no-custom-rules → NSG sin reglas personalizadas"</span>,
        ]
      <span style="color:#4ade80">+</span> <span style="color:#60a5fa">info</span>     = [
          <span style="color:#4ade80">+</span> <span style="color:#fde68a">"vnet-network-analyzer-c-isolated → VNet sin peerings"</span>,
        ]
    }
  <span style="color:#4ade80">+</span> <span style="color:#c084fc">resource_group_name</span>      = <span style="color:#fde68a">"rg-network-analyzer-test"</span>
  <span style="color:#4ade80">+</span> <span style="color:#c084fc">subscription_id_reminder</span> = <span style="color:#fde68a">"Ejecuta: az account show --query id -o tsv"</span>

<span style="color:#94a3b8">Do you want to perform these actions?
  Only 'yes' will be accepted to approve.

  Enter a value: </span><span style="color:#f8fafc;font-weight:600">yes</span>

<span style="color:#67e8f9">azurerm_resource_group.rg</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_resource_group.rg</span><span style="color:#fbbf24">: Still creating... [10s elapsed]</span>
<span style="color:#67e8f9">azurerm_resource_group.rg</span><span style="color:#4ade80">: Creation complete after 12s</span>
<span style="color:#67e8f9">azurerm_network_security_group.nsg_empty</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_virtual_network.vnet_a</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_virtual_network.vnet_b</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_virtual_network.vnet_c</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_network_security_group.nsg_correct</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_route_table.rt_basic</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_network_security_group.nsg_empty</span><span style="color:#4ade80">: Creation complete after 3s</span>
<span style="color:#67e8f9">azurerm_network_security_group.nsg_correct</span><span style="color:#4ade80">: Creation complete after 3s</span>
<span style="color:#67e8f9">azurerm_route_table.rt_basic</span><span style="color:#4ade80">: Creation complete after 4s</span>
<span style="color:#67e8f9">azurerm_virtual_network.vnet_b</span><span style="color:#4ade80">: Creation complete after 5s</span>
<span style="color:#67e8f9">azurerm_virtual_network.vnet_a</span><span style="color:#4ade80">: Creation complete after 5s</span>
<span style="color:#67e8f9">azurerm_virtual_network.vnet_c</span><span style="color:#4ade80">: Creation complete after 5s</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_a1</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_a2</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_b1</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_c1</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_virtual_network_peering.peering_a_to_b</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_virtual_network_peering.peering_b_to_a</span><span style="color:#94a3b8">: Creating...</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_a1</span><span style="color:#4ade80">: Creation complete after 5s</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_b1</span><span style="color:#4ade80">: Creation complete after 6s</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_c1</span><span style="color:#4ade80">: Creation complete after 6s</span>
<span style="color:#67e8f9">azurerm_subnet_network_security_group_association.nsg_empty_assoc</span><span style="color:#4ade80">: Creation complete after 6s</span>
<span style="color:#67e8f9">azurerm_subnet.subnet_a2</span><span style="color:#4ade80">: Creation complete after 10s</span>
<span style="color:#67e8f9">azurerm_subnet_network_security_group_association.nsg_correct_assoc</span><span style="color:#4ade80">: Creation complete after 11s</span>
<span style="color:#67e8f9">azurerm_subnet_route_table_association.rt_assoc</span><span style="color:#4ade80">: Creation complete after 12s</span>
<span style="color:#67e8f9">azurerm_virtual_network_peering.peering_a_to_b</span><span style="color:#4ade80">: Creation complete after 27s</span>
<span style="color:#67e8f9">azurerm_virtual_network_peering.peering_b_to_a</span><span style="color:#fbbf24">: Still creating... [30s elapsed]</span>
<span style="color:#67e8f9">azurerm_virtual_network_peering.peering_b_to_a</span><span style="color:#fbbf24">: Still creating... [40s elapsed]</span>
<span style="color:#67e8f9">azurerm_virtual_network_peering.peering_b_to_a</span><span style="color:#fbbf24">: Still creating... [50s elapsed]</span>
<span style="color:#67e8f9">azurerm_virtual_network_peering.peering_b_to_a</span><span style="color:#4ade80">: Creation complete after 53s</span>

<span style="color:#4ade80;font-weight:700">Apply complete! Resources: 16 added, 0 changed, 0 destroyed.</span>

<span style="color:#94a3b8">Outputs:</span>

<span style="color:#c084fc">problemas_esperados</span> = {
  <span style="color:#fbbf24">"warnings"</span> = [
    <span style="color:#fde68a">"subnet-a2-no-nsg → Subnet sin NSG asociado"</span>,
    <span style="color:#fde68a">"nsg-empty-no-custom-rules → NSG sin reglas personalizadas"</span>,
  ]
  <span style="color:#60a5fa">"info"</span> = [
    <span style="color:#fde68a">"vnet-network-analyzer-c-isolated → VNet sin peerings"</span>,
  ]
}
<span style="color:#c084fc">resource_group_name</span>      = <span style="color:#fde68a">"rg-network-analyzer-test"</span>
<span style="color:#c084fc">subscription_id_reminder</span> = <span style="color:#fde68a">"Ejecuta: az account show --query id -o tsv"</span></div>
</div>

### Verificación en el portal de Azure

Con el entorno aprovisionado, compruebo en el portal que la topología es la
esperada antes de ejecutar el analizador.

<!-- SCREENSHOT: Portal Azure — Resource Group con los 14 recursos listados -->

<!-- SCREENSHOT: Portal Azure — Topología de VNet A mostrando las dos subnets y el peering -->

---

## Ejecución del analizador

Con el entorno desplegado, arranco la herramienta localmente:

```bash
cd azure-network-analyzer
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# DefaultAzureCredential usa el az login activo
uvicorn main:app --reload
```

Abro `http://localhost:8000`, introduzco el Subscription ID y pulso **Analizar**.

<!-- SCREENSHOT: UI del analizador — campo Subscription ID antes de analizar -->

---

## Validación de resultados

El analizador tarda unos segundos en llamar a la API de Azure y construir el
grafo. El resultado muestra exactamente los problemas que definí en el entorno
de prueba.

<!-- SCREENSHOT: Grafo completo — las tres VNets, las subnets, los NSGs y el peering, con nodos en naranja/azul marcados -->

### Problemas detectados

El panel lateral agrupa los hallazgos por severidad:

**Advertencias (🟡)**
- `subnet-a2-no-nsg` — La subnet `10.0.2.0/24` en `vnet-network-analyzer-a`
  no tiene NSG asociado. El tráfico no está filtrado.
- `nsg-empty-no-custom-rules` — El NSG `nsg-empty-no-custom-rules` solo contiene
  las reglas por defecto de Azure. No hay control de tráfico real.

**Info (🔵)**
- `vnet-network-analyzer-c-isolated` — La VNet `10.2.0.0/16` no tiene ningún
  peering configurado. Está aislada del resto de la red.

<!-- SCREENSHOT: Panel lateral con los problemas listados por severidad -->

### Detalle de nodo — Subnet con NSG correcto

Al hacer clic en `subnet-a1-with-nsg`, el panel de detalle muestra las reglas
NSG asociadas: `allow-https-inbound (100, Allow, TCP:443)` y
`deny-http-inbound (200, Deny, TCP:80)`.

<!-- SCREENSHOT: Panel de detalle de subnet-a1-with-nsg con reglas NSG expandidas -->

### Detalle de nodo — VNet aislada

Al hacer clic en `vnet-network-analyzer-c-isolated`, el panel confirma que
no tiene peerings y la marca como recurso a revisar.

<!-- SCREENSHOT: Panel de detalle de vnet-c con el aviso de VNet sin peerings -->

---

## Estado actual y próximos pasos

La herramienta funciona en local contra suscripciones reales con `az login` y
contra service principals. Los próximos pasos en desarrollo:

- **Soporte multi-suscripción**: iterar sobre todas las suscripciones del tenant.
- **Exportación de informe**: generar un PDF/HTML con los problemas detectados
  para adjuntar a tickets de ITSM.
- **Despliegue en Azure Container Apps**: imagen Docker + Managed Identity para
  correr sin credenciales locales.
- **Integración con Azure Policy**: correlacionar las detecciones con el
  Compliance State de los recursos.

> El entorno de prueba se destruye con `terraform destroy` cuando no está en uso.
> Coste en Azure: prácticamente cero — solo VNets y NSGs, sin VMs ni servicios
> de pago activos.
