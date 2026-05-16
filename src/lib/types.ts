export type Severity = 'Safe' | 'Info' | 'Warning' | 'Critical';

export interface Asset {
  asset_code: string;
  issuer: string;
  verified: boolean;
  risk_score: number;
  flags: number;
  updated_at: string;
}

export interface Alert {
  id: number;
  publisher: string;
  asset_code: string;
  severity: 'Info' | 'Warning' | 'Critical';
  message: string;
  timestamp: string;
  active: boolean;
}

export interface RiskFactors {
  issuerConcentration: number;
  lpOwnership: number;
  walletClustering: number;
  suddenMinting: number;
  washTrading: number;
  trustlineManipulation: number;
  fakeMetadata: number;
}

export interface TokenDetail extends Asset {
  alerts?: Alert[];
}

export const RISK_BANDS = [
  { max: 39,  label: 'Safe',     color: 'bg-green-500',  text: 'text-green-400',  hex: '#22c55e' },
  { max: 69,  label: 'Info',     color: 'bg-blue-500',   text: 'text-blue-400',   hex: '#3b82f6' },
  { max: 84,  label: 'Warning',  color: 'bg-orange-500', text: 'text-orange-400', hex: '#f97316' },
  { max: 100, label: 'Critical', color: 'bg-red-600',    text: 'text-red-400',    hex: '#dc2626' },
] as const;

export function getRiskBand(score: number) {
  return RISK_BANDS.find(b => score <= b.max) ?? RISK_BANDS[3];
}

export const FACTOR_WEIGHTS: { key: keyof RiskFactors; label: string; weight: number }[] = [
  { key: 'issuerConcentration',   label: 'Issuer Concentration',    weight: 25 },
  { key: 'lpOwnership',           label: 'LP Ownership',            weight: 20 },
  { key: 'walletClustering',      label: 'Wallet Clustering',       weight: 15 },
  { key: 'suddenMinting',         label: 'Sudden Minting',          weight: 15 },
  { key: 'washTrading',           label: 'Wash Trading',            weight: 10 },
  { key: 'trustlineManipulation', label: 'Trustline Manipulation',  weight: 10 },
  { key: 'fakeMetadata',          label: 'Fake Metadata',           weight:  5 },
];
