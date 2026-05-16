import { getRiskBand } from '@/lib/types';

export function RiskBadge({ score }: { score: number }) {
  const band = getRiskBand(score);
  return (
    <span className={`${band.color} text-white px-2 py-0.5 rounded text-xs font-bold`}>
      {band.label} {score}
    </span>
  );
}
