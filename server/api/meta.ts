import * as cheerio from 'cheerio';
import { z } from 'zod';
import type { OgMeta } from '~/types/common';
import { fetchPublicHtml } from '~~/server/utils/safeFetch';

type MetaData = Record<string, string>;

const querySchema = z.object({
    url: z.string().trim().min(1).max(2048),
});

/**
* Link preview (Open Graph) for a user-supplied URL.
* Login required; the URL must be public http(s) — see server/utils/safeFetch.ts (SSRF protection).
*/
export default defineEventHandler(async (event): Promise<OgMeta> => {
    getAuthUser(event);
    const { url } = await getValidatedQuery(event, querySchema.parse);

    let html: string;
    try {
        html = await fetchPublicHtml(url);
    } catch (error: any) {
        // Keep authored 4xx/5xx from the URL checks; hide network/driver details.
        if (error?.statusCode) throw error;
        console.error('Error fetching meta:', error);
        throw createError({
            statusCode: 502,
            statusMessage: 'Failed to fetch metadata',
        });
    }

    const $ = cheerio.load(html);
    const metaData: MetaData = {};

    $('meta').each((_, element) => {
        const property = $(element).attr('property') || $(element).attr('name');
        if (property && property.startsWith('og:')) {
            metaData[property] = $(element).attr('content') || '';
        }
    });

    return {
        domain: metaData['og:site_name'] || '',
        url: metaData['og:url'] || '',
        title: metaData['og:title'] || '',
        desc: metaData['og:description'] || '',
        image: metaData['og:image'] || '',
    };
});
