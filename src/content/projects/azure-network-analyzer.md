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

### Paso 2 — Plan

Antes de aplicar, verifico que el plan coincide exactamente con el diseño:

```bash
terraform plan
```

El plan debe mostrar **14 recursos** a crear: 1 resource group, 3 VNets,
5 subnets, 2 peerings, 2 NSGs, 1 route table y 2 asociaciones.

<!-- SCREENSHOT: terraform plan output — 14 to add, 0 to change, 0 to destroy -->

### Paso 3 — Apply

```bash
terraform apply -auto-approve
```

<!-- SCREENSHOT: terraform apply completado — outputs con los IDs de las VNets y el resumen de problemas esperados -->

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
