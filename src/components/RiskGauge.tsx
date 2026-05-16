'use client';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { getRiskBand } from '@/lib/types';

export function RiskGauge({ score }: { score: number }) {
  const band = getRiskBand(score);
  const data = [{ value: score, fill: band.hex }];

  return (
    <div className="flex flex-col items-center">
      <RadialBarChart
        width={200}
        height={200}
        cx={100}
        cy={100}
        innerRadius={60}
        outerRadius={90}
        startAngle={180}
        endAngle={-180}
        data={data}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" angleAxisId={0} background={{ fill: '#1f2937' }} cornerRadius={6} />
      </RadialBarChart>
      <div className="-mt-24 text-center">
        <div className="text-4xl font-bold" style={{ color: band.hex }}>{score}</div>
        <div className="text-sm text-gray-400 mt-1">{band.label}</div>
      </div>
      <div className="mt-16" />
    </div>
  );
}
