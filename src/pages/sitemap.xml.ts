import type { APIRoute } from 'astro';

const sitemapPages = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/about-us/', changefreq: 'monthly', priority: '0.7' },
	{ path: '/contact-us/', changefreq: 'monthly', priority: '0.6' },
	{ path: '/privacy-policy/', changefreq: 'yearly', priority: '0.3' },
	{ path: '/terms-and-conditions/', changefreq: 'yearly', priority: '0.3' },
] as const;

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');

export const GET: APIRoute = ({ site }) => {
	const baseUrl = site ?? new URL('https://onlinephotocollage.com');
	const urls = sitemapPages
		.map(({ path, changefreq, priority }) => {
			const loc = new URL(path, baseUrl).toString();

			return [
				'\t<url>',
				`\t\t<loc>${escapeXml(loc)}</loc>`,
				`\t\t<changefreq>${changefreq}</changefreq>`,
				`\t\t<priority>${priority}</priority>`,
				'\t</url>',
			].join('\n');
		})
		.join('\n');

	return new Response(
		[
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
			urls,
			'</urlset>',
		].join('\n'),
		{
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
			},
		},
	);
};
