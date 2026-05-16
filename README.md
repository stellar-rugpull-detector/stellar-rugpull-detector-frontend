# Stellar Rug-Pull Detector — Frontend

Real-time risk intelligence dashboard for Stellar DeFi. Scans tokens, issuers, liquidity pools, and DEX activity to detect scams, rug pulls, wash trading, and supply concentration before users interact with risky assets.

> Think **TokenSniffer + RugCheck + DEXTools** — built natively for Stellar.

---

## Screenshots

| Dashboard | Token Detail | Live Alerts |
|---|---|---|
| Top risky assets + live feed | Risk gauge + factor breakdown | Real-time WebSocket stream |

---

## Features

- **Risk Score Dashboard** — top risky assets ranked 0–100, color-coded by severity
- **Token Detail Page** — radial risk gauge, 7-factor breakdown chart, issuer flag decoder
- **Live Alert Feed** — real-time Critical/Warning/Info alerts via WebSocket, filterable by severity
- **Token List** — full asset table with freeze/clawback/auth flags decoded
- **Real-time Updates** — Socket.io streams push new alerts and risk score changes without page refresh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Charts | Recharts (RadialBarChart, BarChart) |
| Real-time | Socket.io-client |
| Backend API | NestJS REST + WebSocket (see backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see [backend.flow.md](./backend.flow.md))

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Environment Variables

Create a `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # / — Dashboard
│   ├── tokens/page.tsx             # /tokens — Token list
│   ├── token/[assetCode]/page.tsx  # /token/:code — Token detail
│   └── alerts/page.tsx             # /alerts — Live alert feed
├── components/
│   ├── Navbar.tsx
│   ├── RiskBadge.tsx               # Score pill (Safe / Info / Warning / Critical)
│   ├── AlertItem.tsx               # Alert row with severity icon
│   ├── LiveAlertTicker.tsx         # WebSocket-driven alert stream
│   ├── RiskGauge.tsx               # Radial 0–100 score gauge
│   └── FactorChart.tsx             # 7-factor horizontal bar chart
└── lib/
    ├── types.ts                    # Shared types + risk band helpers
    ├── api.ts                      # Typed REST client
    └── socket.ts                   # Socket.io singleton
```

---

## Risk Score Model

| Score | Label | Meaning |
|---|---|---|
| 0–39 | ✅ Safe | No significant risk indicators |
| 40–69 | ℹ️ Info | Some flags, proceed with caution |
| 70–84 | ⚠️ Warning | Multiple red flags detected |
| 85–100 | ☠️ Critical | Active rug indicators present |

Scores are computed by the backend risk engine across 7 weighted factors:

| Factor | Weight |
|---|---|
| Issuer concentration | 25% |
| LP ownership | 20% |
| Wallet clustering | 15% |
| Sudden minting | 15% |
| Wash trading | 10% |
| Trustline manipulation | 10% |
| Fake metadata | 5% |

---

## API Integration

The frontend consumes the NestJS `api-gateway` service:

```
GET  /api/tokens                    All assets, sorted by risk_score DESC
GET  /api/tokens/:assetCode         Single asset detail
GET  /api/tokens/:assetCode/alerts  Active alerts for an asset
GET  /api/alerts                    All active alerts

WS   subscribe:alerts               Real-time alert stream
WS   subscribe:risk-updates         Real-time risk score changes
```

See [backend.flow.md](./backend.flow.md) for full API reference and data shapes.

---

## Implementation Status

### Done (50%)

| Feature | Route |
|---|---|
| Dashboard — top risky assets + live alerts | `/` |
| Token list with flag decoder | `/tokens` |
| Token detail — risk gauge + factor chart | `/token/[assetCode]` |
| Live alert feed with severity filter | `/alerts` |
| WebSocket real-time updates | all pages |

### Remaining (50%)

| Feature | Route |
|---|---|
| Issuer reputation profiles | `/issuers` |
| Wallet risk lookup | `/wallets/[address]` |
| Leaderboard (safest / riskiest) | `/leaderboard` |
| Ecosystem analytics | `/analytics` |
| Community scam report form | `/reports` |
| Staking + reputation UI | `/stake` |
| Admin moderation panel | `/admin/*` |
| Freighter wallet connect | global |
| Pagination on token + alert lists | `/tokens`, `/alerts` |

---

## Related Docs

- [project.md](./project.md) — Full product spec and roadmap
- [structure.md](./structure.md) — Smart contract architecture and backend integration guide
- [backend.flow.md](./backend.flow.md) — Backend services, REST API reference, WebSocket events
- [frontend.flow.md](./frontend.flow.md) — Frontend implementation details and remaining work
