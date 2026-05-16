import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { AlertItem } from '@/components/AlertItem';
import { RiskGauge } from '@/components/RiskGauge';
import { FactorChart } from '@/components/FactorChart';

function FlagRow({ flags }: { flags: number }) {
  const items = [
    { bit: 1, label: 'Freeze Enabled',   warn: true  },
    { bit: 2, label: 'Clawback Enabled', warn: true  },
    { bit: 4, label: 'Auth Required',    warn: false },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ bit, label, warn }) => (
        <span
          key={bit}
          className={`text-xs px-2 py-1 rounded font-medium ${
            flags & bit
              ? warn ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'
              : 'bg-gray-800 text-gray-500'
          }`}
        >
          {flags & bit ? '⚠ ' : '✓ '}{label}
        </span>
      ))}
    </div>
  );
}

export default async function TokenDetailPage({ params }: { params: { assetCode: string } }) {
  let token;
  let alerts = [];
  try {
    [token, alerts] = await Promise.all([
      api.getToken(params.assetCode),
      api.getTokenAlerts(params.assetCode),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {token.asset_code}
            {token.verified && <span className="text-green-400 text-lg" title="Verified">✓ Verified</span>}
          </h1>
          <p className="text-gray-400 font-mono text-sm mt-1">{token.issuer}</p>
        </div>
      </div>

      {/* Risk gauge + flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-sm font-semibold text-gray-400 mb-2 self-start">RISK SCORE</h2>
          <RiskGauge score={token.risk_score} />
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400">ISSUER FLAGS</h2>
          <FlagRow flags={token.flags} />

          <div className="pt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Last Updated</span>
              <span>{new Date(token.updated_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Alerts</span>
              <span className={alerts.length > 0 ? 'text-red-400 font-semibold' : 'text-green-400'}>
                {alerts.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">RISK FACTOR BREAKDOWN</h2>
        <FactorChart score={token.risk_score} />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Active Alerts</h2>
          {alerts.map(a => <AlertItem key={a.id} alert={a} />)}
        </div>
      )}
    </div>
  );
}
