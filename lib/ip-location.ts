import { NextRequest } from 'next/server';

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

interface KugouResponse {
  errcode?: number;
  country?: string;
  province?: string;
  city?: string;
}

async function lookupKugou(ip: string): Promise<string | null> {
  try {
    const res = await fetch('http://mips.kugou.com/check/iscn', {
      headers: { 'X-Forwarded-For': ip },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;

    const data: KugouResponse = await res.json();
    if (data.errcode !== 0) return null;

    const parts = [data.province, data.city].filter(Boolean);
    if (parts.length > 0) return parts.join('·');

    return data.country || null;
  } catch {
    return null;
  }
}

interface IpApiResult {
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  success?: boolean;
}

async function lookupIpApiIs(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`https://ipapi.is/json/?ip=${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data: IpApiResult = await res.json();
    if (!data.success || !data.location) return null;

    const parts = [data.location.region, data.location.city].filter(Boolean);
    if (parts.length > 0) return parts.join('·');

    return data.location.country || null;
  } catch {
    return null;
  }
}

export async function lookupLocation(ip: string | null): Promise<{ location: string; ip_address: string } | null> {
  if (!ip) return null;
  if (ip === '127.0.0.1' || ip === '0.0.0.0') return { location: '本机', ip_address: ip };

  const location = await lookupKugou(ip) || await lookupIpApiIs(ip);

  if (!location) return null;
  return { location, ip_address: ip };
}