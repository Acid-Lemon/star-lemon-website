import type { MetadataRoute } from 'next';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const settings = await getSettings();
    const siteUrl = settings.site_url || `https://${process.env.VERCEL_URL || 'localhost:3000'}`;

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/login', '/register'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
