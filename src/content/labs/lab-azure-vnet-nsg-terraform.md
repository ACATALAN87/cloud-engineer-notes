---
title: "Lab 03 — Azure Hub VNet with NSG and Bastion using Terraform"
description: "Deploying a secure Azure hub virtual network with subnet segmentation, NSG rules, Azure Bastion and diagnostic settings — fully automated with Terraform."
date: 2026-04-09
draft: false
stack: ["Terraform", "Azure", "Azure Networking", "Azure Bastion", "NSG"]
difficulty: "intermediate"
labType: "hands-on"
source: "https://learn.microsoft.com/en-us/azure/virtual-network/quick-create-terraform"
sourceName: "Microsoft Learn"
---

## Objective

Deploy a production-like Azure hub virtual network using Terraform. The goal is not just to create a VNet — it's to practise the decisions that matter in real environments: subnet segmentation, NSG design, secure remote access without public IPs and operational visibility through diagnostic settings.

This lab covers:

- Resource group and VNet provisioning
- Subnet segmentation with dedicated address spaces
- NSG creation and association with explicit inbound/outbound rules
- Azure Bastion for secure VM access
- Diagnostic settings logging NSG flow logs to a Storage Account
- Terraform structure with locals, variables and outputs

---

## Architecture overview

```
Resource Group: rg-hub-lab
│
├── vnet-hub (10.0.0.0/16)
│   ├── snet-management    10.0.1.0/24  ← admin/bastion subnet
│   ├── snet-workloads     10.0.2.0/24  ← application workloads
│   └── AzureBastionSubnet 10.0.3.0/27  ← required name and /27 minimum
│
├── nsg-management   → associated to snet-management
├── nsg-workloads    → associated to snet-workloads
├── pip-bastion      → public IP for Azure Bastion (Standard SKU)
├── bas-hub          → Azure Bastion (Basic tier)
└── st-nsgflow-[uid] → Storage Account for NSG flow logs
```

No VMs are deployed in this lab. The focus is purely on the networking and security layer.

---

## Implementation

### Provider and backend

```hcl
# versions.tf
terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state — replace with your own backend config
  # backend "azurerm" {
  #   resource_group_name  = "rg-tfstate"
  #   storage_account_name = "sttfstate<uid>"
  #   container_name       = "tfstate"
  #   key                  = "hub-vnet.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {}
}
```

### Variables

```hcl
# variables.tf
variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "westeurope"
}

variable "environment" {
  description = "Environment tag: dev, staging, prod."
  type        = string
  default     = "dev"
}

variable "project" {
  description = "Project identifier used in resource naming."
  type        = string
  default     = "hub-lab"
}
```

### Locals

```hcl
# locals.tf
locals {
  tags = {
    environment = var.environment
    project     = var.project
    managed_by  = "terraform"
  }

  vnet_address_space        = "10.0.0.0/16"
  snet_management_prefix    = "10.0.1.0/24"
  snet_workloads_prefix     = "10.0.2.0/24"
  snet_bastion_prefix       = "10.0.3.0/27"
}
```

### Resource group and VNet

```hcl
# main.tf
resource "azurerm_resource_group" "hub" {
  name     = "rg-${var.project}-${var.environment}"
  location = var.location
  tags     = local.tags
}

resource "azurerm_virtual_network" "hub" {
  name                = "vnet-hub-${var.environment}"
  location            = azurerm_resource_group.hub.location
  resource_group_name = azurerm_resource_group.hub.name
  address_space       = [local.vnet_address_space]
  tags                = local.tags
}
```

### Subnets

```hcl
resource "azurerm_subnet" "management" {
  name                 = "snet-management"
  resource_group_name  = azurerm_resource_group.hub.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = [local.snet_management_prefix]
}

resource "azurerm_subnet" "workloads" {
  name                 = "snet-workloads"
  resource_group_name  = azurerm_resource_group.hub.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = [local.snet_workloads_prefix]
}

# Azure Bastion requires a subnet named exactly "AzureBastionSubnet"
resource "azurerm_subnet" "bastion" {
  name                 = "AzureBastionSubnet"
  resource_group_name  = azurerm_resource_group.hub.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = [local.snet_bastion_prefix]
}
```

### NSGs

```hcl
# nsg-management
resource "azurerm_network_security_group" "management" {
  name                = "nsg-management-${var.environment}"
  location            = azurerm_resource_group.hub.location
  resource_group_name = azurerm_resource_group.hub.name
  tags                = local.tags

  # Allow SSH/RDP only from Bastion subnet
  security_rule {
    name                       = "Allow-Bastion-Inbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["22", "3389"]
    source_address_prefix      = local.snet_bastion_prefix
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Deny-All-Inbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "management" {
  subnet_id                 = azurerm_subnet.management.id
  network_security_group_id = azurerm_network_security_group.management.id
}

# nsg-workloads
resource "azurerm_network_security_group" "workloads" {
  name                = "nsg-workloads-${var.environment}"
  location            = azurerm_resource_group.hub.location
  resource_group_name = azurerm_resource_group.hub.name
  tags                = local.tags

  security_rule {
    name                       = "Allow-HTTPS-Inbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Deny-All-Inbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "workloads" {
  subnet_id                 = azurerm_subnet.workloads.id
  network_security_group_id = azurerm_network_security_group.workloads.id
}
```

### Azure Bastion

```hcl
resource "azurerm_public_ip" "bastion" {
  name                = "pip-bastion-${var.environment}"
  location            = azurerm_resource_group.hub.location
  resource_group_name = azurerm_resource_group.hub.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.tags
}

resource "azurerm_bastion_host" "hub" {
  name                = "bas-hub-${var.environment}"
  location            = azurerm_resource_group.hub.location
  resource_group_name = azurerm_resource_group.hub.name
  sku                 = "Basic"
  tags                = local.tags

  ip_configuration {
    name                 = "configuration"
    subnet_id            = azurerm_subnet.bastion.id
    public_ip_address_id = azurerm_public_ip.bastion.id
  }
}
```

### NSG flow logs (diagnostic settings)

```hcl
resource "random_string" "storage_suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_storage_account" "nsg_flow" {
  name                     = "stnsgflow${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.hub.name
  location                 = azurerm_resource_group.hub.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  tags                     = local.tags
}

# Flow logs require Network Watcher in the same region
data "azurerm_network_watcher" "default" {
  name                = "NetworkWatcher_${var.location}"
  resource_group_name = "NetworkWatcherRG"
}

resource "azurerm_network_watcher_flow_log" "management" {
  network_watcher_name      = data.azurerm_network_watcher.default.name
  resource_group_name       = "NetworkWatcherRG"
  name                      = "flowlog-nsg-management"
  network_security_group_id = azurerm_network_security_group.management.id
  storage_account_id        = azurerm_storage_account.nsg_flow.id
  enabled                   = true

  retention_policy {
    enabled = true
    days    = 7
  }

  tags = local.tags
}
```

### Outputs

```hcl
# outputs.tf
output "vnet_id" {
  description = "Resource ID of the hub VNet."
  value       = azurerm_virtual_network.hub.id
}

output "snet_management_id" {
  description = "Resource ID of the management subnet."
  value       = azurerm_subnet.management.id
}

output "snet_workloads_id" {
  description = "Resource ID of the workloads subnet."
  value       = azurerm_subnet.workloads.id
}

output "bastion_public_ip" {
  description = "Public IP of the Azure Bastion host."
  value       = azurerm_public_ip.bastion.ip_address
}
```

---

## Key considerations

**Subnet naming is enforced by Azure**
`AzureBastionSubnet` must be named exactly that. The minimum prefix is `/27` (32 addresses). Azure reserves 5 of those, leaving 27 usable — enough for Bastion.

**NSG on the Bastion subnet**
Azure Bastion has specific NSG requirements (GatewayManager inbound on 443, AzureLoadBalancer inbound, BastionHostCommunication within the subnet). In this lab the Bastion subnet has no NSG attached to keep it simple — in production, apply the Microsoft-documented rules precisely.

**Flow logs need Network Watcher**
Azure automatically creates a Network Watcher per region in `NetworkWatcherRG`. This lab uses a `data` source to reference it instead of managing it with Terraform, which avoids accidental destruction.

**Priority gaps in NSG rules**
Rules are numbered 100, then jump to 4096 (Deny-All). This leaves room to insert new rules in between (200, 300...) without renumbering. Always plan for extensibility.

**Standard SKU public IP for Bastion**
Bastion requires a Standard SKU public IP with static allocation. Basic SKU does not work and the error from Azure is not always obvious — worth knowing before troubleshooting.

---

## Troubleshooting

**`Error: A resource with the ID already exists`**
Happens when you import an existing resource or when a previous partial apply left orphaned resources. Run `terraform state list` and `terraform import` if needed, or `terraform destroy` the specific resource.

**Flow log: `NetworkWatcher not found in NetworkWatcherRG`**
If Network Watcher was not auto-created (uncommon but possible on new subscriptions), create it manually in the portal or via CLI:
```bash
az network watcher configure --locations westeurope --enabled true --resource-group NetworkWatcherRG
```

**Bastion deployment takes 5–10 minutes**
Normal. The `azurerm_bastion_host` resource has a long provisioning time. Terraform will wait. Do not interrupt.

**NSG association returns 409 Conflict**
Can occur if a previous association exists and was not cleaned up. Run:
```bash
terraform state rm azurerm_subnet_network_security_group_association.management
terraform apply
```

---

## What I learned

- Subnet sizing matters early. `/27` for Bastion is the absolute minimum; a `/26` gives more headroom if you plan to add features like Bastion Premium or VNet peering later.
- NSG rule priority design is not just functional — it's documentation. Leaving gaps is a deliberate choice.
- Flow logs are underused in dev/test environments. Enabling them from the start, even with a 7-day retention, catches unexpected traffic patterns before they become incidents.
- The Terraform `data` source pattern for pre-existing resources (like Network Watcher) is cleaner than importing them into state — it makes the dependency explicit without putting Azure-managed resources under your Terraform lifecycle.
- Azure Bastion Basic tier removes the need for jump boxes or public IPs on VMs. The cost (~$140/month) is non-trivial for dev, but for any production or sensitive environment it is the right default.

---

## Source

This lab is based on practical experience and informed by the official Microsoft documentation:

- [Create a virtual network using Terraform — Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-network/quick-create-terraform)
- [Azure Bastion documentation](https://learn.microsoft.com/en-us/azure/bastion/bastion-overview)
- [NSG flow logs overview](https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-nsg-flow-logging-overview)
- [HashiCorp AzureRM provider — azurerm_virtual_network](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/virtual_network)
