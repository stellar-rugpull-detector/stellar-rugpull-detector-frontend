import { Asset, Alert } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  getTokens: (limit = 50, offset = 0) =>
    get<Asset[]>(`/tokens?limit=${limit}&offset=${offset}`),

  getToken: (assetCode: string) =>
    get<Asset>(`/tokens/${assetCode}`),

  getTokenAlerts: (assetCode: string) =>
    get<Alert[]>(`/tokens/${assetCode}/alerts`),

  getAlerts: (limit = 50, offset = 0) =>
    get<Alert[]>(`/alerts?limit=${limit}&offset=${offset}`),
};
