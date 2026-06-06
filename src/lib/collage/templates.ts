import {
	buildEditorialLayout,
	buildFilmStripLayout,
	buildGridLayout,
	buildHeroSideLayout,
	buildMoodBoardLayout,
	buildMosaicLayout,
	buildPanoramaLayout,
	buildProductLayout,
	buildScrapbookLayout,
	buildSocialStoryLayout,
	buildStoryLayout,
	buildTravelLayout,
	buildWeddingLayout,
	type LayoutBuilder,
} from './layouts';

export type RatioId = '1:1' | '4:5' | '16:9' | '9:16' | '3:2';
export type ImageFit = 'cover' | 'contain';

export interface RatioSpec {
	width: number;
	height: number;
	css: string;
}

export interface CollageTemplate {
	id: string;
	name: string;
	label: string;
	sampleCount: number;
	ratio: RatioId;
	background?: string;
	spacing?: number;
	corner?: number;
	build: LayoutBuilder;
}

export const ratios: Record<RatioId, RatioSpec> = {
	'1:1': { width: 1600, height: 1600, css: '1 / 1' },
	'4:5': { width: 1600, height: 2000, css: '4 / 5' },
	'16:9': { width: 1920, height: 1080, css: '16 / 9' },
	'9:16': { width: 1080, height: 1920, css: '9 / 16' },
	'3:2': { width: 1800, height: 1200, css: '3 / 2' },
};

export const templateImages = [
	'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=360&q=70',
	'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&w=360&q=70',
] as const;

export const templates = [
	{
		id: 'custom-default',
		name: 'Custom default',
		label: 'Recommended',
		sampleCount: 4,
		ratio: '1:1',
		build: buildGridLayout,
	},
	{
		id: 'hero-side',
		name: 'Hero side',
		label: 'Focus',
		sampleCount: 4,
		ratio: '1:1',
		build: buildHeroSideLayout,
	},
	{
		id: 'editorial',
		name: 'Editorial',
		label: 'Balanced',
		sampleCount: 6,
		ratio: '3:2',
		build: buildEditorialLayout,
	},
	{
		id: 'mosaic',
		name: 'Mosaic',
		label: 'Dynamic',
		sampleCount: 6,
		ratio: '16:9',
		build: buildMosaicLayout,
	},
	{
		id: 'story-stack',
		name: 'Story stack',
		label: 'Vertical',
		sampleCount: 4,
		ratio: '9:16',
		build: buildStoryLayout,
	},
	{
		id: 'panorama',
		name: 'Panorama',
		label: 'Wide',
		sampleCount: 5,
		ratio: '16:9',
		build: buildPanoramaLayout,
	},
	{
		id: 'film-strip',
		name: 'Film strip',
		label: 'Cinematic',
		sampleCount: 5,
		ratio: '16:9',
		background: '#171717',
		spacing: 10,
		corner: 4,
		build: buildFilmStripLayout,
	},
	{
		id: 'scrapbook',
		name: 'Scrapbook',
		label: 'Warm',
		sampleCount: 6,
		ratio: '4:5',
		background: '#ffefcf',
		spacing: 18,
		corner: 14,
		build: buildScrapbookLayout,
	},
	{
		id: 'mood-board',
		name: 'Mood board',
		label: 'Curated',
		sampleCount: 8,
		ratio: '3:2',
		background: '#fafafa',
		spacing: 12,
		corner: 8,
		build: buildMoodBoardLayout,
	},
	{
		id: 'social-story',
		name: 'Social story',
		label: 'Stories',
		sampleCount: 5,
		ratio: '9:16',
		background: '#ffffff',
		spacing: 12,
		corner: 16,
		build: buildSocialStoryLayout,
	},
	{
		id: 'wedding-soft',
		name: 'Wedding soft',
		label: 'Elegant',
		sampleCount: 5,
		ratio: '4:5',
		background: '#ffffff',
		spacing: 16,
		corner: 18,
		build: buildWeddingLayout,
	},
	{
		id: 'travel-postcard',
		name: 'Travel card',
		label: 'Postcard',
		sampleCount: 4,
		ratio: '16:9',
		background: '#d3e5ff',
		spacing: 14,
		corner: 12,
		build: buildTravelLayout,
	},
	{
		id: 'portfolio-grid',
		name: 'Portfolio',
		label: 'Gallery',
		sampleCount: 9,
		ratio: '1:1',
		background: '#171717',
		spacing: 8,
		corner: 2,
		build: buildGridLayout,
	},
	{
		id: 'product-board',
		name: 'Product board',
		label: 'Showcase',
		sampleCount: 5,
		ratio: '1:1',
		background: '#f5f5f5',
		spacing: 14,
		corner: 10,
		build: buildProductLayout,
	},
	{
		id: 'canvas-print',
		name: 'Canvas print',
		label: 'Wall art',
		sampleCount: 12,
		ratio: '3:2',
		background: '#ffffff',
		spacing: 6,
		corner: 0,
		build: buildGridLayout,
	},
] as const satisfies readonly CollageTemplate[];

export type TemplateId = (typeof templates)[number]['id'];

export function getTemplate(id: string): CollageTemplate {
	return templates.find((template) => template.id === id) ?? templates[0];
}

export function smartTemplateForCount(count: number): CollageTemplate {
	if (count <= 2) return getTemplate('custom-default');
	if (count === 3) return getTemplate('hero-side');
	if (count <= 6) return getTemplate('mosaic');
	return getTemplate('editorial');
}
