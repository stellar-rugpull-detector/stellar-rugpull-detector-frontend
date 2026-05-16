import Link from 'next/link';
import { api } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { LiveAlertTicker } from '@/components/LiveAlertTicker';
import { Asset, Alert } from '@/lib/types';

function truncate(s: string, n = 12) {
  return s.length > n ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

export default async function DashboardPage() {
  let tokens: Asset[] = [];
  let alerts: Alert[] = [];
  try {
    [tokens, alerts] = await Promise.all([api.getTokens(10), api.getAlerts(5)]);
  } catch {
    // backend offline — show empty state
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Risk Dashboard</h1>
        <p className="text-gray-400 text-sm">Real-time rug-pull detection for Stellar DeFi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Risky Assets */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">⚠️ Top Risky Assets</h2>
            <Link href="/tokens" className="text-blue-400 text-sm hover:underline">View all →</Link>
          </div>
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left px-4 py-2">Asset</th>
                  <th className="text-left px-4 py-2">Issuer</th>
                  <th className="text-right px-4 py-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {tokens.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No data — backend offline</td></tr>
                ) : tokens.map(t => (
                  <tr key={t.asset_code} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/token/${t.asset_code}`} className="font-medium hover:text-blue-400">
                        {t.asset_code}
                      </Link>
                      {t.verified && <span className="ml-1 text-green-400 text-xs">✓</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{truncate(t.issuer)}</td>
                    <td className="px-4 py-3 text-right"><RiskBadge score={t.risk_score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Alert Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">🚨 Live Alerts</h2>
            <Link href="/alerts" className="text-blue-400 text-sm hover:underline">View all →</Link>
          </div>
          <LiveAlertTicker initial={alerts} />
        </section>
      </div>
    </div>
  );
}
