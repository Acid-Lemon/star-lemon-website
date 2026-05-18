import { NextRequest } from 'next/server';
import { toCnProvince, toCnCity } from './cn-location-map';

function normalizeIp(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const ip = raw.split(',')[0].trim();
  if (!ip) return null;
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  if (ip === '::1') return '127.0.0.1';
  return ip;
}

export function getClientIP(request: NextRequest): string | null {
  return (
    normalizeIp(request.headers.get('x-forwarded-for')) ||
    normalizeIp(request.headers.get('x-real-ip')) ||
    null
  );
}

interface IpApiIsResult {
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
}

async function lookupIpApiIs(ip: string): Promise<string | null> {
  const key = process.env.IPAPI_IS_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`https://api.ipapi.is?q=${encodeURIComponent(ip)}&key=${key}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data: IpApiIsResult = await res.json();
    if (!data.location) return null;

    const province = toCnProvince(data.location.state) || data.location.state;
    const city = toCnCity(data.location.city, data.location.state) || data.location.city;

    if (province && city && province !== city) return province + '·' + city;
    if (province) return province;
    if (city) return city;

    return data.location.country || null;
  } catch {
    return null;
  }
}

interface IpApiResponse {
  status?: string;
  regionName?: string;
  city?: string;
  country?: string;
}

async function lookupIpApi(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data: IpApiResponse = await res.json();
    if (data.status !== 'success') return null;

    const parts = [data.regionName, data.city].filter(Boolean);
    if (parts.length > 0) return parts.join('·');

    return data.country || null;
  } catch {
    return null;
  }
}

export async function lookupLocation(ip: string | null): Promise<{ location: string; ip_address: string } | null> {
  if (!ip) return null;
  if (ip === '127.0.0.1' || ip === '0.0.0.0') return { location: '本机', ip_address: ip };

  const location = await lookupIpApi(ip) || await lookupIpApiIs(ip);

  if (!location) return null;
  return { location, ip_address: ip };
}