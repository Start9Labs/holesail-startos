<p align="center">
  <img src="icon.png" alt="Holesail Logo" width="21%">
</p>

# Holesail on StartOS

> **Upstream docs:** <https://docs.holesail.io/>
>
> Everything not listed in this document should behave the same as upstream
> Holesail. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

[Holesail](https://github.com/holesail/holesail) is a peer-to-peer tunneling system that creates direct, encrypted connections between devices using Hyperswarm DHT. No port forwarding, static IPs, or firewall configuration required.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [How It Works on StartOS](#how-it-works-on-startos)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Dependencies](#dependencies)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property | Value |
|----------|-------|
| Image | `holesail/holesail:latest` (upstream unmodified) |
| Architectures | x86_64, aarch64 |
| Runtime | Multiple daemons (one per configured tunnel) |

---

## Volume and Data Layout

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `holesail` | `/usr/src/app/data` | Holesail data directory |
| `startos` | — | StartOS-managed state (`store.json`) |

**StartOS-specific files:**

- `store.json` — tunnel configurations (service → interface → connection string)

---

## How It Works on StartOS

Holesail on StartOS operates in **server mode only**, creating P2P tunnels to expose your StartOS services to remote clients.

### Setup Flow

1. Install Holesail
2. Run "Manage Tunnels" action to select which services to expose
3. Run "View Connections" action to get connection strings
4. Share connection strings with clients who need access

### Connection Strings

StartOS generates connection strings in the format:

```
hs://{visibility}000{42-character-key}
```

- `hs://0000...` — Public tunnel (discoverable)
- `hs://s000...` — Private tunnel (requires the exact key)

Clients use these strings with Holesail client apps to connect directly to your services.

### Dynamic Daemons

Each tunnel runs as a separate daemon. When you add or remove tunnels via the action, the service restarts with the updated configuration.

---

## Actions (StartOS UI)

### Manage Tunnels

| Property | Value |
|----------|-------|
| ID | `manage-tunnels` |
| Name | Manage Tunnels |
| Visibility | Enabled |
| Availability | Any status |
| Purpose | Add and remove P2P tunnels |

**How it works:**

1. Select a service (any installed StartOS service, or StartOS itself)
2. Select an interface from that service
3. Choose public or private visibility
4. Save to create/update tunnels

**Features:**

- Tunnel any installed service's interfaces
- Tunnel the StartOS UI itself
- Mix of public and private tunnels supported

### View Connections

| Property | Value |
|----------|-------|
| ID | `view-connections` |
| Name | View Connections |
| Visibility | Enabled (if tunnels exist) / Disabled otherwise |
| Availability | Any status |
| Purpose | Display connection strings for sharing |

**Output:** Lists all configured tunnels with:

- Service and interface name
- Connection string (masked, copyable)
- QR code for easy sharing

---

## Dependencies

None. Holesail is a standalone tunneling service.

---

## Backups and Restore

**Included in backup:**

- `holesail` volume — Holesail data
- `startos` volume — tunnel configurations

**Restore behavior:**

- All tunnel configurations are restored
- Connection strings are preserved (clients don't need new strings)

---

## Health Checks

| Check | Display Name | Method |
|-------|--------------|--------|
| Per-tunnel | `{Service} - {Interface}` | Always succeeds when daemon starts |

Each configured tunnel has its own health check displayed in the StartOS UI.

---

## Limitations and Differences

1. **Server mode only** — cannot use as a client to connect to external Holesail services
2. **No CLI access** — all configuration via StartOS actions (no direct holesail command)
3. **No custom ports** — tunnels use internal service ports automatically
4. **No UDP tunnels** — TCP only (upstream supports both)
5. **No file sharing** — upstream's file transfer feature not exposed
6. **No network interfaces** — Holesail uses DHT for discovery; no ports exposed on StartOS

---

## What Is Unchanged from Upstream

- Peer-to-peer architecture (no relay servers)
- Hyperswarm DHT for peer discovery
- End-to-end encryption (automatic, always enabled)
- Zero-configuration networking
- Public and private tunnel options
- Connection string format and compatibility
- Cross-platform client compatibility

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: holesail
upstream_version: latest
image: holesail/holesail:latest
architectures: [x86_64, aarch64]
volumes:
  holesail: /usr/src/app/data
  startos: (StartOS state)
ports: none
dependencies: none
mode: server-only
connection_string_format: "hs://{0|s}000{42-char-key}"
env_per_tunnel:
  MODE: server
  PORT: (from service interface)
  HOST: "{packageId}.startos"
  KEY: (connection string)
  LOG: "true"
  NODE_ENV: production
actions:
  - manage-tunnels (enabled, any)
  - view-connections (enabled if tunnels exist, any)
health_checks:
  - per-tunnel daemon status
backup_volumes:
  - holesail
  - startos
not_available:
  - Client mode
  - CLI access
  - UDP tunnels
  - File sharing feature
  - Custom port configuration
```
