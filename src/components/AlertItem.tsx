import { Alert } from '@/lib/types';

const ICONS: Record<Alert['severity'], string> = {
  Info: 'ℹ️',
  Warning: '⚠️',
  Critical: '☠️',
};

const COLORS: Record<Alert['severity'], string> = {
  Info: 'border-blue-500 bg-blue-950/40',
  Warning: 'border-orange-500 bg-orange-950/40',
  Critical: 'border-red-600 bg-red-950/40',
};

export function AlertItem({ alert }: { alert: Alert }) {
  return (
    <div className={`border-l-4 ${COLORS[alert.severity]} px-4 py-3 rounded-r`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{ICONS[alert.severity]}</span>
        <span className="font-semibold text-white">{alert.asset_code}</span>
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(alert.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm text-gray-300">{alert.message}</p>
    </div>
  );
}
