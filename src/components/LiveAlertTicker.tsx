'use client';
import { useEffect, useState } from 'react';
import { Alert } from '@/lib/types';
import { AlertItem } from './AlertItem';
import { getSocket } from '@/lib/socket';

export function LiveAlertTicker({ initial }: { initial: Alert[] }) {
  const [alerts, setAlerts] = useState<Alert[]>(initial);

  useEffect(() => {
    const socket = getSocket();
    const handler = (data: Alert) => setAlerts(prev => [data, ...prev].slice(0, 20));
    socket.on('alert', handler);
    return () => { socket.off('alert', handler); };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {alerts.map(a => <AlertItem key={a.id} alert={a} />)}
      {alerts.length === 0 && <p className="text-gray-500 text-sm">No alerts yet.</p>}
    </div>
  );
}
