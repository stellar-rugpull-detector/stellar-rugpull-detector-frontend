'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FACTOR_WEIGHTS, RiskFactors, getRiskBand } from '@/lib/types';

interface Props {
  score: number;
  factors?: Partial<RiskFactors>;
}

export function FactorChart({ score, factors }: Props) {
  // If no real factor data, distribute score proportionally by weight
  const data = FACTOR_WEIGHTS.map(f => {
    const raw = factors?.[f.key] ?? score;
    const band = getRiskBand(raw);
    return { name: f.label, value: raw, weight: f.weight, fill: band.hex };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#d1d5db', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6 }}
          labelStyle={{ color: '#f9fafb' }}
          formatter={(v, _, entry) =>
            [`${v}/100 (weight ${(entry.payload as { weight: number }).weight}%)`, 'Score']
          }
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
