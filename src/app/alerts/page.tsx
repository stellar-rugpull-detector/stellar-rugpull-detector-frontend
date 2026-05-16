'use client';
import { useEffect, useState } from 'react';
import { Alert } from '@/lib/types';
import { AlertItem } from '@/components/AlertItem';
import { getSocket } from '@/lib/socket';

const SEVERITY_ORDER = { Critical: 0, Warning: 1, Info: 2 };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'All' | Alert['severity']>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/alerts?limit=50`)
      .then(r => r.json())
      .then((data: Alert[]) => setAlerts(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = getSocket();
    const handler = (data: Alert) => setAlerts(prev => [data, ...prev]);
    socket.on('alert', handler);
    return () => { socket.off('alert', handler); };
  }, []);

  const visible = alerts
    .filter(a => filter === 'All' || a.severity === filter)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Live Alert Feed</h1>
        <p className="text-gray-400 text-sm">Real-time alerts from the on-chain alert feed</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['All', 'Critical', 'Warning', 'Info'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-gray-500 text-sm self-center">{visible.length} alerts</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-500">No alerts.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map(a => <AlertItem key={a.id} alert={a} />)}
        </div>
      )}
    </div>
  );
}
