# Backend Flow — What's Built & Frontend Integration Guide

---

## 1. What's Implemented

### Services (all compile, all dockerized)

```
shared/                        ✅ Types, computeRiskScore(), SorobanClient
services/stellar-indexer/      ✅ Horizon poller → Kafka
services/risk-engine/          ✅ 7-factor scorer → on-chain + Postgres
services/soroban-event-listener/ ✅ Contract events → Kafka
services/scoring-service/      ✅ Thresholds → on-chain alerts → Kafka
services/notification-service/ ✅ Kafka → Telegram / Discord
services/api-gateway/          ✅ REST + WebSocket (Socket.io)
databases/migrations/          ✅ Full Postgres schema
docker-compose.yml             ✅ All services + Postgres/Redis/Kafka
```

### Data Flow

```
Stellar Network
    │
    ▼
stellar-indexer  ──── ledger.events ────► risk-engine
    │                                         │
    │                                    writes score
    │                                    on-chain (verification-registry)
    │                                    + mirrors to Postgres
    │                                         │
soroban-event-listener                   risk.scores ──► scoring-service
    │                                                         │
    └── soroban.events ──► (future: re-score triggers)   alerts topic
                                                              │
                                              ┌───────────────┤
                                              ▼               ▼
                                    notification-service   api-gateway
                                    (Telegram / Discord)   (REST + WS)
                                                              │
                                                           Frontend
```

### Postgres Tables

| Table | Purpose |
|---|---|
| `assets` | Mirrored risk scores, flags, verified status |
| `alerts` | Published alerts (Info / Warning / Critical) |
| `reports` | Community scam reports |
| `reputation` | Staker reputation scores |
| `trades` | DEX trade history (wash trading analysis) |
| `trustlines` | Trustline events (manipulation detection) |

---

## 2. REST API Reference

Base URL: `http://localhost:3000/api`

### Tokens

```
GET  /tokens                    List all assets, sorted by risk_score DESC
     ?limit=50&offset=0

GET  /tokens/:assetCode         Single asset detail
GET  /tokens/:assetCode/risk-score   { assetCode, risk_score, verified }
GET  /tokens/:assetCode/alerts  Active alerts for this asset
```

Response shape (`/tokens/:assetCode`):
```json
{
  "asset_code": "SCAM",
  "issuer": "GABC...XYZ",
  "verified": false,
  "risk_score": 87,
  "flags": 3,
  "updated_at": "2026-05-16T11:00:00Z"
}
```

### Alerts

```
GET  /alerts                    All active alerts, newest first
     ?limit=50&offset=0
```

Response item:
```json
{
  "id": 1,
  "publisher": "system",
  "asset_code": "SCAM",
  "severity": "Critical",
  "message": "POTENTIAL RUG PULL DETECTED for asset SCAM. Risk score: 91/100.",
  "timestamp": "2026-05-16T11:00:00Z",
  "active": true
}
```

### Reports

```
GET  /reports                   List all reports
     ?limit=50&offset=0

POST /reports                   Submit a scam report
     Body: { reporter, asset_code, description }
     Returns: { report_id }

POST /reports/:id/vote          Vote on a report
     Body: { voter, confirm: true|false }
```

### Wallet

```
GET  /wallet/:address           Reputation + stake info
     Returns: { address, reputation, stake_amount }
```

---

## 3. WebSocket (Socket.io)

Connect to: `ws://localhost:3000`

### Subscribe to channels

```js
socket.emit('subscribe:alerts')        // real-time alert stream
socket.emit('subscribe:risk-updates')  // risk score changes
```

### Incoming events

```js
socket.on('alert', (data) => {
  // { assetCode, severity, score, message, timestamp }
})

socket.on('risk-update', (data) => {
  // { assetCode, issuer, score, severity, factors, computedAt }
})
```

---

## 4. Risk Score

Score is 0–100. Higher = riskier.

| Score | Label | Color |
|---|---|---|
| 0–39 | Safe | green |
| 40–69 | Info | blue |
| 70–84 | Warning | orange |
| 85–100 | Critical | red |

Factors (shown in token detail page):
```
issuerConcentration  25%
lpOwnership          20%
walletClustering     15%
suddenMinting        15%
washTrading          10%
trustlineManipulation 10%
fakeMetadata          5%
```

---

## 5. Frontend — Core Pages & What to Fetch

### `/tokens` — Token List

```
GET /api/tokens?limit=50&offset=0
```
- Table: asset_code, issuer (truncated), risk_score badge, verified checkmark
- Sort by risk_score DESC (already default)
- Color-code rows by severity band
- Pagination via offset

### `/token/[assetCode]` — Token Detail

```
GET /api/tokens/:assetCode
GET /api/tokens/:assetCode/alerts
```
- Risk score gauge (0–100 radial)
- Factor breakdown bar chart (7 factors with weights)
- Active alerts list
- Flags decoded: `flags & 1` = freeze enabled, `flags & 2` = clawback, `flags & 4` = auth_required

### `/alerts` — Live Alert Feed

```
GET /api/alerts                  (initial load)
WS  subscribe:alerts             (real-time append)
```
- Severity icon: ℹ️ Info · ⚠️ Warning · ☠️ Critical
- Auto-prepend new alerts from WebSocket without page refresh

### `/wallet/[address]` — Wallet Lookup

```
GET /api/wallet/:address
```
- Show reputation score, stake amount
- Link to reports filed by this address

### `/explore` or `/` — Dashboard

```
GET /api/tokens?limit=10         (top risky assets)
GET /api/alerts?limit=5          (latest alerts)
WS  subscribe:alerts             (live ticker)
```

---

## 6. Frontend Stack (recommended, per project.md)

```
Next.js 14 (App Router)
Tailwind CSS
Recharts          — risk score gauges, factor bars, liquidity charts
Socket.io-client  — real-time alert feed
@stellar/stellar-sdk (browser) — wallet connect via Freighter
```

### Socket.io client setup

```ts
// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

socket.on('connect', () => {
  socket.emit('subscribe:alerts');
  socket.emit('subscribe:risk-updates');
});
```

### Risk score badge component

```tsx
// components/RiskBadge.tsx
const BANDS = [
  { max: 39,  label: 'Safe',     color: 'bg-green-500' },
  { max: 69,  label: 'Info',     color: 'bg-blue-500'  },
  { max: 84,  label: 'Warning',  color: 'bg-orange-500'},
  { max: 100, label: 'Critical', color: 'bg-red-600'   },
];

export function RiskBadge({ score }: { score: number }) {
  const band = BANDS.find(b => score <= b.max) ?? BANDS[3];
  return (
    <span className={`${band.color} text-white px-2 py-1 rounded text-sm font-bold`}>
      {band.label} {score}
    </span>
  );
}
```

---

## 7. Environment Variables (Frontend)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

---

## 8. What's NOT Yet Built (remaining 50%)

| Item | Service | Notes |
|---|---|---|
| `GET /risk-score/:asset` shorthand route | api-gateway | Minor alias |
| `GET /liquidity/:pool` | api-gateway | Needs AMM pool queries |
| `GET /issuers` | api-gateway | Issuer reputation list |
| Wallet clustering (Neo4j) | risk-engine | Phase 3 |
| ML anomaly engine | ml-anomaly-engine | Phase 3 (Python) |
| Stake endpoint `POST /stake` | api-gateway | Calls staking-reputation contract |
| Redis caching on hot routes | api-gateway | Rate limiting + cache |
| Risk score history | risk-engine | Append-only changelog table |
| Reputation-weighted voting | community-reporting contract | Cross-contract call |
| `GET /leaderboard` | api-gateway | Top safe / riskiest assets |
