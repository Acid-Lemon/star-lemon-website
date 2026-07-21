import type { MetadataRoute } from 'next';
import db from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const settings = await getSettings();
    const siteUrl = settings.site_url || `https://${process.env.VERCEL_URL || 'localhost:3000'}`;

    const staticPages: MetadataRoute.Sitemap = [
        { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${siteUrl}/post`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${siteUrl}/moments`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/quotes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${siteUrl}/guestbook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${siteUrl}/friends`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
        { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ];

    try {
        const result = await db.query(
            'SELECT id, title, updated_at FROM posts ORDER BY updated_at DESC'
        );
        const postPages: MetadataRoute.Sitemap = result.rows.map((row) => ({
            url: `${siteUrl}/post/${row.id}`,
            lastModified: new Date(row.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
        return [...staticPages, ...postPages];
    } catch {
        return staticPages;
    }
}
