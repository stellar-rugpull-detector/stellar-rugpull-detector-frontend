import Link from 'next/link';
import { api } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { Asset } from '@/lib/types';

function truncate(s: string, n = 20) {
  return s.length > n ? `${s.slice(0, 8)}…${s.slice(-6)}` : s;
}

function FlagBadges({ flags }: { flags: number }) {
  const tags = [];
  if (flags & 1) tags.push({ label: 'Freeze', cls: 'bg-yellow-700' });
  if (flags & 2) tags.push({ label: 'Clawback', cls: 'bg-orange-700' });
  if (flags & 4) tags.push({ label: 'Auth Req', cls: 'bg-purple-700' });
  return (
    <div className="flex gap-1 flex-wrap">
      {tags.map(t => (
        <span key={t.label} className={`${t.cls} text-white text-xs px-1.5 py-0.5 rounded`}>{t.label}</span>
      ))}
    </div>
  );
}

export default async function TokensPage() {
  let tokens: Asset[] = [];
  try { tokens = await api.getTokens(50); } catch { /* offline */ }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Token Risk Scores</h1>
        <p className="text-gray-400 text-sm">{tokens.length} assets tracked, sorted by risk</p>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-left">
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Issuer</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3 text-right">Risk Score</th>
              <th className="px-4 py-3 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tokens.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No data — backend offline</td></tr>
            ) : tokens.map(t => (
              <tr key={t.asset_code} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/token/${t.asset_code}`} className="font-semibold hover:text-blue-400">
                    {t.asset_code}
                  </Link>
                  {t.verified && <span className="ml-1 text-green-400 text-xs" title="Verified">✓</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{truncate(t.issuer)}</td>
                <td className="px-4 py-3"><FlagBadges flags={t.flags} /></td>
                <td className="px-4 py-3 text-right"><RiskBadge score={t.risk_score} /></td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">
                  {new Date(t.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
