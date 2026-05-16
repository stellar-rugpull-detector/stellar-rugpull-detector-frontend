# Frontend Flow — What's Implemented

> Next.js 14 (App Router) · Tailwind CSS · Recharts · Socket.io-client

---

## 1. Stack

```
Next.js 14 (App Router, TypeScript)
Tailwind CSS
Recharts          — risk gauge (RadialBarChart), factor breakdown (BarChart)
Socket.io-client  — real-time alert + risk-update streams
```

---

## 2. Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — Navbar + dark bg
│   ├── page.tsx                    # / — Dashboard
│   ├── tokens/
│   │   └── page.tsx                # /tokens — Token list
│   ├── token/
│   │   └── [assetCode]/
│   │       └── page.tsx            # /token/:assetCode — Token detail
│   └── alerts/
│       └── page.tsx                # /alerts — Live alert feed
│
├── components/
│   ├── Navbar.tsx                  # Top nav (Dashboard / Tokens / Alerts)
│   ├── RiskBadge.tsx               # Colored score pill (Safe/Info/Warning/Critical)
│   ├── AlertItem.tsx               # Single alert row with severity icon + color
│   ├── LiveAlertTicker.tsx         # Client component — WebSocket alert stream
│   ├── RiskGauge.tsx               # Radial gauge showing 0–100 risk score
│   └── FactorChart.tsx             # Horizontal bar chart — 7 risk factors
│
└── lib/
    ├── types.ts                    # Shared types + RISK_BANDS + FACTOR_WEIGHTS
    ├── api.ts                      # Typed fetch wrapper for backend REST API
    └── socket.ts                   # Socket.io singleton (auto-subscribes on connect)
```

---

## 3. Pages

### `/` — Dashboard
- Fetches top 10 assets (`GET /api/tokens?limit=10`) and latest 5 alerts (`GET /api/alerts?limit=5`)
- Two-column layout: risky assets table + live alert ticker
- `LiveAlertTicker` appends new alerts in real-time via WebSocket

### `/tokens` — Token List
- Fetches all assets (`GET /api/tokens?limit=50`)
- Sortable table: asset code, issuer (truncated), flag badges, risk score badge, last updated
- Flag decoder: `flags & 1` = Freeze, `flags & 2` = Clawback, `flags & 4` = Auth Required
- Rows link to `/token/[assetCode]`

### `/token/[assetCode]` — Token Detail
- Fetches asset + active alerts in parallel (`GET /api/tokens/:code`, `GET /api/tokens/:code/alerts`)
- `RiskGauge` — radial chart showing score 0–100, color-coded by severity band
- `FactorChart` — horizontal bar chart for all 7 risk factors with weights
- Flag decoder panel (Freeze / Clawback / Auth Required)
- Active alerts list below

### `/alerts` — Live Alert Feed
- Initial load from `GET /api/alerts?limit=50`
- Real-time append via `socket.on('alert', ...)`
- Severity filter tabs: All · Critical · Warning · Info
- Sorted Critical → Warning → Info

---

## 4. Shared Library

### `lib/types.ts`
- `Asset`, `Alert`, `RiskFactors` interfaces
- `RISK_BANDS` — score ranges mapped to label + Tailwind color + hex
- `getRiskBand(score)` — returns the matching band for a score
- `FACTOR_WEIGHTS` — 7 factors with keys, display labels, and percentage weights

### `lib/api.ts`
- `api.getTokens(limit, offset)` → `Asset[]`
- `api.getToken(assetCode)` → `Asset`
- `api.getTokenAlerts(assetCode)` → `Alert[]`
- `api.getAlerts(limit, offset)` → `Alert[]`
- Base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:3000`)

### `lib/socket.ts`
- Singleton `getSocket()` — creates one Socket.io connection per session
- Auto-emits `subscribe:alerts` and `subscribe:risk-updates` on connect
- WS URL from `NEXT_PUBLIC_WS_URL` (default `http://localhost:3000`)

---

## 5. Risk Score Bands

| Score | Label    | Color  |
|-------|----------|--------|
| 0–39  | Safe     | Green  |
| 40–69 | Info     | Blue   |
| 70–84 | Warning  | Orange |
| 85–100| Critical | Red    |

---

## 6. Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## 7. What's NOT Yet Built (remaining 50%)

| Page / Feature | Notes |
|---|---|
| `/issuers` | Issuer reputation list (`GET /api/issuers` not yet in backend) |
| `/wallets/[address]` | Wallet reputation + stake lookup (`GET /api/wallet/:address`) |
| `/leaderboard` | Safest / riskiest assets (`GET /api/leaderboard` not yet in backend) |
| `/analytics` | Ecosystem-wide charts (liquidity, volume, trustline trends) |
| `/explore` | Browse + search all tracked assets |
| Community report form | `POST /api/reports` — submit scam report |
| Voting UI | `POST /api/reports/:id/vote` |
| Staking UI | `POST /api/stake` — stake tokens, view reputation |
| Admin pages | `/admin`, `/admin/reports`, `/admin/risk-rules`, `/admin/moderation` |
| Freighter wallet connect | `@stellar/stellar-sdk` browser wallet integration |
| Pagination controls | Offset-based pagination on `/tokens` and `/alerts` |
| Risk score history chart | Append-only changelog (backend not yet built) |
| Liquidity chart | `GET /api/liquidity/:pool` (backend not yet built) |
