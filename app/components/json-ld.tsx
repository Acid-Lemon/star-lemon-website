import { getSettings } from '../../lib/settings';

export async function JsonLd() {
    const settings = await getSettings();
    const siteTitle = settings.site_title || 'Star & Lemon 的小站';
    const siteDescription = settings.site_description || '两个开发者的代码世界';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteTitle,
        description: siteDescription,
        url: settings.site_url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${settings.site_url}/post?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
        author: [
            {
                '@type': 'Person',
                name: 'Star',
                url: 'https://github.com/star-starry-sea',
            },
            {
                '@type': 'Person',
                name: 'Lemon',
                url: 'https://github.com/Acid-Lemon',
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
