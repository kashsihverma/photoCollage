export type TemplateCategory =
	| 'Love'
	| 'Birthday'
	| 'Friends'
	| 'Family'
	| 'Wedding'
	| 'Travel'
	| 'Cute'
	| 'Aesthetic'
	| 'Instagram Story'
	| 'Instagram Post'
	| 'Poster';

export type SizeId = 'square' | 'instagram-post' | 'story' | 'poster' | 'a4' | 'wide';
export type ExportFormat = 'png' | 'jpeg';
export type ImageFit = 'cover' | 'contain';
export type FrameStyle = 'clean' | 'paper' | 'polaroid' | 'film' | 'stamp' | 'soft' | 'shadow';
export type TextAlign = 'left' | 'center' | 'right';

export interface SizePreset {
	id: SizeId;
	name: string;
	label: string;
	width: number;
	height: number;
	css: string;
}

export interface BackgroundPreset {
	id: string;
	name: string;
	css: string;
	base: string;
	pattern?: 'none' | 'dots' | 'grid' | 'paper' | 'crumpled' | 'hearts' | 'stripes' | 'stars' | 'bubbles' | 'waves' | 'confetti' | 'mesh';
}

export interface PhotoSlotPreset {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation?: number;
	radius?: number;
	frame?: FrameStyle;
	fit?: ImageFit;
	cropX?: number;
	cropY?: number;
	scale?: number;
}

export interface TextPresetLayer {
	id: string;
	text: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation?: number;
	fontFamily: string;
	fontSize: number;
	color: string;
	bold?: boolean;
	italic?: boolean;
	align?: TextAlign;
}

export interface StickerPresetLayer {
	id: string;
	content: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation?: number;
	color?: string;
	background?: string;
	opacity?: number;
}

export interface CollageTemplate {
	id: string;
	name: string;
	category: TemplateCategory;
	size: SizeId;
	backgroundId: string;
	slots: PhotoSlotPreset[];
	texts: TextPresetLayer[];
	stickers: StickerPresetLayer[];
	tags: string[];
	previewImages?: string[];
	premium?: boolean;
}

export interface ElementPreset {
	id: string;
	name: string;
	content: string;
	color?: string;
	background?: string;
}

export interface TextStylePreset {
	id: string;
	name: string;
	text: string;
	fontFamily: string;
	fontSize: number;
	color: string;
	bold?: boolean;
	italic?: boolean;
	align?: TextAlign;
}

export const categories: TemplateCategory[] = [
	'Love',
	'Birthday',
	'Friends',
	'Family',
	'Wedding',
	'Travel',
	'Cute',
	'Aesthetic',
	'Instagram Story',
	'Instagram Post',
	'Poster',
];

export const sizePresets: Record<SizeId, SizePreset> = {
	square: { id: 'square', name: 'Square', label: '2000 x 2000', width: 2000, height: 2000, css: '1 / 1' },
	'instagram-post': {
		id: 'instagram-post',
		name: 'Instagram post',
		label: '1080 x 1350',
		width: 1080,
		height: 1350,
		css: '4 / 5',
	},
	story: { id: 'story', name: 'Story', label: '1080 x 1920', width: 1080, height: 1920, css: '9 / 16' },
	poster: { id: 'poster', name: 'Poster', label: '2400 x 3000', width: 2400, height: 3000, css: '4 / 5' },
	a4: { id: 'a4', name: 'A4 poster', label: '2480 x 3508', width: 2480, height: 3508, css: '210 / 297' },
	wide: { id: 'wide', name: 'Wide', label: '1920 x 1080', width: 1920, height: 1080, css: '16 / 9' },
};

export const backgrounds: BackgroundPreset[] = [
	{ id: 'milk', name: 'Milk paper', css: '#fbfaf7', base: '#fbfaf7', pattern: 'paper' },
	{
		id: 'crumpled-paper',
		name: 'Crumpled paper',
		css: 'linear-gradient(112deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 26%), linear-gradient(28deg, rgba(0,0,0,.09) 0%, rgba(0,0,0,0) 34%), linear-gradient(155deg, transparent 0 31%, rgba(255,255,255,.46) 32%, transparent 34% 100%), linear-gradient(32deg, transparent 0 42%, rgba(0,0,0,.07) 43%, transparent 45% 100%), linear-gradient(78deg, transparent 0 62%, rgba(255,255,255,.34) 63%, transparent 65% 100%), linear-gradient(145deg, #f4f4f2 0%, #d9d9d6 100%)',
		base: '#ececea',
		pattern: 'crumpled',
	},
	{ id: 'charcoal', name: 'Camera black', css: '#151515', base: '#151515', pattern: 'dots' },
	{ id: 'rose', name: 'Rose blush', css: 'linear-gradient(135deg, #fff1f2 0%, #ffd6e4 100%)', base: '#fff1f2', pattern: 'hearts' },
	{ id: 'butter', name: 'Butter cream', css: 'linear-gradient(135deg, #fff8d8 0%, #ffe3b3 100%)', base: '#fff8d8', pattern: 'paper' },
	{ id: 'sky', name: 'Soft sky', css: 'linear-gradient(135deg, #e8f4ff 0%, #d7fff6 100%)', base: '#e8f4ff', pattern: 'grid' },
	{ id: 'lavender', name: 'Lavender', css: 'linear-gradient(135deg, #f4edff 0%, #ffdff3 100%)', base: '#f4edff', pattern: 'dots' },
	{ id: 'linen', name: 'Linen', css: '#f4efe7', base: '#f4efe7', pattern: 'stripes' },
	{ id: 'mint', name: 'Mint poster', css: 'linear-gradient(135deg, #e3fff6 0%, #f8ffe3 100%)', base: '#e3fff6', pattern: 'grid' },
	{ id: 'film', name: 'Film grain', css: '#101010', base: '#101010', pattern: 'paper' },
	{ id: 'clean', name: 'Clean white', css: '#ffffff', base: '#ffffff', pattern: 'none' },
	{ id: 'aurora', name: 'Aurora glass', css: 'linear-gradient(135deg, #ccfbf1 0%, #a78bfa 100%)', base: '#ccfbf1', pattern: 'mesh' },
	{ id: 'sunset', name: 'Sunset pop', css: 'linear-gradient(135deg, #fff7ad 0%, #fb7185 100%)', base: '#fff7ad', pattern: 'confetti' },
	{ id: 'ocean', name: 'Ocean glass', css: 'linear-gradient(135deg, #dff7ff 0%, #0f766e 100%)', base: '#dff7ff', pattern: 'waves' },
	{ id: 'midnight', name: 'Midnight stars', css: 'linear-gradient(135deg, #111827 0%, #312e81 100%)', base: '#111827', pattern: 'stars' },
	{ id: 'candy', name: 'Candy cloud', css: 'linear-gradient(135deg, #fed7e2 0%, #bfdbfe 100%)', base: '#fed7e2', pattern: 'bubbles' },
	{ id: 'forest', name: 'Forest mist', css: 'linear-gradient(135deg, #ecfccb 0%, #134e4a 100%)', base: '#ecfccb', pattern: 'paper' },
	{ id: 'graphite', name: 'Graphite grid', css: 'linear-gradient(135deg, #18181b 0%, #52525b 100%)', base: '#18181b', pattern: 'grid' },
	{ id: 'prism', name: 'Prism paper', css: 'linear-gradient(135deg, #fdf2f8 0%, #fde68a 100%)', base: '#fdf2f8', pattern: 'mesh' },
];

export const templateImages = [
	'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
	'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
	'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
	'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
	'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
	'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
	'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
	'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=600&q=80',
] as const;

const romanticFont = 'Georgia, Times New Roman, serif';
const handwrittenFont = 'Comic Sans MS, Bradley Hand, cursive';
const cleanFont = 'Inter, Arial, sans-serif';
const monoFont = 'Courier New, monospace';

const slot = (
	id: string,
	x: number,
	y: number,
	w: number,
	h: number,
	frame: FrameStyle = 'paper',
	rotation = 0,
	radius = 2,
): PhotoSlotPreset => ({ id, x, y, w, h, frame, rotation, radius, fit: 'cover', cropX: 50, cropY: 50, scale: 1 });

const text = (
	id: string,
	value: string,
	x: number,
	y: number,
	w: number,
	h: number,
	fontSize: number,
	color: string,
	fontFamily = cleanFont,
	align: TextAlign = 'center',
): TextPresetLayer => ({ id, text: value, x, y, w, h, fontFamily, fontSize, color, align, bold: true });

const sticker = (
	id: string,
	content: string,
	x: number,
	y: number,
	w: number,
	h: number,
	rotation = 0,
	color = '#171717',
): StickerPresetLayer => ({ id, content, x, y, w, h, rotation, color, opacity: 1 });

export const templates: CollageTemplate[] = [
	{
		id: 'love-polaroid-stack',
		name: 'Love Polaroids',
		category: 'Love',
		size: 'instagram-post',
		backgroundId: 'rose',
		slots: [
			slot('p1', 11, 12, 44, 34, 'polaroid', -6),
			slot('p2', 43, 31, 43, 34, 'polaroid', 7),
			slot('p3', 18, 60, 52, 30, 'polaroid', -2),
		],
		texts: [text('t1', 'Forever Together', 18, 5, 64, 8, 5.1, '#be123c', romanticFont)],
		stickers: [sticker('s1', '♡', 72, 11, 11, 11, 12, '#fb7185'), sticker('s2', '✦', 8, 57, 8, 8, 0, '#be123c')],
		tags: ['romantic', 'polaroid', 'pink'],
		premium: true,
	},
	{
		id: 'crumpled-sparkle-story',
		name: 'Crumpled Sparkle Stack',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'crumpled-paper',
		slots: [
			slot('p1', 52, 12, 35, 27, 'shadow', 0, 1),
			slot('p2', 14, 31, 43, 29, 'shadow', -4, 1),
			slot('p3', 50, 50, 39, 28, 'shadow', 4, 1),
			slot('p4', 16, 68, 41, 25, 'shadow', 0, 1),
		],
		texts: [],
		stickers: [
			sticker('s1', '✧', 25, 10, 8, 8, -8, '#333333'),
			sticker('s2', '✧', 31, 15, 13, 13, -8, '#333333'),
			sticker('s3', '✧', 23, 16, 8, 8, -8, '#333333'),
			sticker('s4', '✦', 9, 54, 7, 7, -18, '#333333'),
			sticker('s5', '✦', 6, 57, 5, 5, -18, '#333333'),
			sticker('s6', '✦', 12, 58, 5, 5, -18, '#333333'),
			sticker('s7', '+', 84, 42, 6, 6, -14, '#333333'),
			sticker('s8', '+', 88, 45, 6, 6, -14, '#333333'),
			sticker('s9', '+', 81, 45, 6, 6, -14, '#333333'),
			sticker('s10', '✧', 69, 82, 12, 12, 0, '#333333'),
			sticker('s11', '✧', 82, 84, 7, 7, 0, '#333333'),
			sticker('s12', '✧', 76, 91, 7, 7, 0, '#333333'),
		],
		tags: ['story', 'paper', 'crumpled', 'sparkle', 'stack', 'aesthetic'],
		previewImages: [
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
		],
		premium: true,
	},
	{
		id: 'birthday-film',
		name: 'Birthday Film',
		category: 'Birthday',
		size: 'story',
		backgroundId: 'charcoal',
		slots: [
			slot('p1', 18, 8, 64, 25, 'film', 0, 1),
			slot('p2', 18, 36, 64, 25, 'film', 0, 1),
			slot('p3', 18, 64, 64, 24, 'film', 0, 1),
		],
		texts: [text('t1', 'Happy Birthday', 20, 48, 60, 8, 5.6, '#ffffff', handwrittenFont)],
		stickers: [sticker('s1', '✧', 82, 20, 7, 7, 0, '#ffffff'), sticker('s2', '18/02/25', 18, 91, 20, 4, -5, '#ffffff')],
		tags: ['film', 'party', 'story'],
	},
	{
		id: 'friends-camera-play',
		name: 'Camera Play',
		category: 'Friends',
		size: 'instagram-post',
		backgroundId: 'charcoal',
		slots: [
			slot('p1', 12, 31, 34, 24, 'paper', -7),
			slot('p2', 52, 15, 34, 27, 'paper', 10),
			slot('p3', 41, 60, 43, 27, 'paper', -4),
		],
		texts: [text('t1', 'CAMERA1 PLAY', 8, 7, 34, 6, 3.1, '#f8fafc', monoFont, 'left')],
		stickers: [sticker('s1', '00:23:59', 68, 92, 23, 5, 0, '#f8fafc')],
		tags: ['vhs', 'night', 'friends'],
		premium: true,
	},
	{
		id: 'family-soft-grid',
		name: 'Family Soft Grid',
		category: 'Family',
		size: 'square',
		backgroundId: 'butter',
		slots: [
			slot('p1', 8, 10, 42, 38, 'soft', 0, 4),
			slot('p2', 54, 10, 38, 38, 'soft', 0, 4),
			slot('p3', 8, 53, 38, 37, 'soft', 0, 4),
			slot('p4', 50, 53, 42, 37, 'soft', 0, 4),
		],
		texts: [text('t1', 'Best Memories', 21, 46, 58, 8, 4.8, '#7c2d12', romanticFont)],
		stickers: [sticker('s1', '✿', 8, 47, 9, 9, -8, '#fb923c')],
		tags: ['family', 'soft', 'warm'],
	},
	{
		id: 'wedding-classic',
		name: 'Wedding Classic',
		category: 'Wedding',
		size: 'poster',
		backgroundId: 'clean',
		slots: [slot('p1', 12, 11, 76, 42, 'paper', 0, 0), slot('p2', 19, 58, 62, 28, 'paper', 0, 0)],
		texts: [text('t1', 'Our Day', 22, 88, 56, 7, 6, '#171717', romanticFont)],
		stickers: [sticker('s1', '—', 18, 55, 64, 3, 0, '#d4af37')],
		tags: ['wedding', 'minimal', 'poster'],
		premium: true,
	},
	{
		id: 'travel-paper-tape',
		name: 'Travel Tape',
		category: 'Travel',
		size: 'instagram-post',
		backgroundId: 'linen',
		slots: [
			slot('p1', 22, 11, 58, 25, 'polaroid', 5),
			slot('p2', 13, 35, 61, 25, 'polaroid', -3),
			slot('p3', 25, 60, 52, 25, 'polaroid', 6),
		],
		texts: [text('t1', 'memories', 31, 84, 38, 6, 4.5, '#57534e', handwrittenFont)],
		stickers: [sticker('s1', '▰', 41, 6, 20, 6, 8, '#e7cf8c'), sticker('s2', '▰', 44, 56, 18, 5, -12, '#e7cf8c')],
		tags: ['travel', 'tape', 'beach'],
	},
	{
		id: 'cute-kawaii',
		name: 'Kawaii Hearts',
		category: 'Cute',
		size: 'square',
		backgroundId: 'lavender',
		slots: [
			slot('p1', 10, 18, 36, 34, 'stamp', -4, 4),
			slot('p2', 54, 18, 36, 34, 'stamp', 4, 4),
			slot('p3', 28, 56, 44, 34, 'stamp', 0, 4),
		],
		texts: [text('t1', 'cute day', 24, 7, 52, 8, 5.2, '#7c3aed', handwrittenFont)],
		stickers: [sticker('s1', '♥', 7, 9, 10, 10, -12, '#ff6b9a'), sticker('s2', '✿', 80, 51, 11, 11, 12, '#8b5cf6')],
		tags: ['cute', 'kawaii', 'pastel'],
	},
	{
		id: 'aesthetic-zine',
		name: 'Aesthetic Zine',
		category: 'Aesthetic',
		size: 'instagram-post',
		backgroundId: 'milk',
		slots: [
			slot('p1', 10, 10, 40, 28, 'paper', -2, 1),
			slot('p2', 54, 8, 34, 36, 'paper', 4, 1),
			slot('p3', 17, 48, 68, 34, 'paper', -1, 1),
		],
		texts: [text('t1', 'soft focus', 10, 85, 80, 6, 3.8, '#171717', monoFont)],
		stickers: [sticker('s1', '✧', 78, 45, 8, 8, 0, '#171717'), sticker('s2', '○', 11, 42, 7, 7, 0, '#171717')],
		tags: ['editorial', 'zine', 'neutral'],
	},
	{
		id: 'story-sparkle',
		name: 'Story Sparkle',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'film',
		slots: [slot('p1', 17, 10, 66, 38, 'polaroid', 0), slot('p2', 17, 52, 66, 28, 'paper', 0)],
		texts: [text('t1', 'Best Night', 18, 82, 64, 7, 5.8, '#ffffff', handwrittenFont)],
		stickers: [sticker('s1', '✦', 11, 47, 8, 8, 0, '#ffffff'), sticker('s2', '✦', 82, 8, 7, 7, 0, '#ffffff')],
		tags: ['story', 'sparkle', 'night'],
		premium: true,
	},
	{
		id: 'poster-gallery',
		name: 'Gallery Poster',
		category: 'Poster',
		size: 'a4',
		backgroundId: 'clean',
		slots: [
			slot('p1', 10, 9, 80, 24, 'clean', 0, 0),
			slot('p2', 10, 37, 38, 24, 'clean', 0, 0),
			slot('p3', 52, 37, 38, 24, 'clean', 0, 0),
			slot('p4', 10, 65, 80, 22, 'clean', 0, 0),
		],
		texts: [text('t1', 'PHOTO COLLAGE', 10, 90, 80, 5, 3.4, '#171717', cleanFont)],
		stickers: [],
		tags: ['poster', 'gallery', 'print'],
	},
	{
		id: 'love-heart-grid',
		name: 'Heart Grid',
		category: 'Love',
		size: 'square',
		backgroundId: 'rose',
		slots: [
			slot('p1', 12, 15, 34, 31, 'soft', -3, 6),
			slot('p2', 54, 15, 34, 31, 'soft', 3, 6),
			slot('p3', 30, 51, 40, 35, 'polaroid', 0, 4),
		],
		texts: [text('t1', 'Love You', 24, 7, 52, 8, 5.8, '#be123c', romanticFont)],
		stickers: [sticker('s1', '♥', 45, 41, 10, 10, 0, '#fb7185'), sticker('s2', '♡', 76, 8, 9, 9, 10, '#be123c')],
		tags: ['heart', 'love', 'grid'],
	},
	{
		id: 'birthday-cake',
		name: 'Birthday Pop',
		category: 'Birthday',
		size: 'square',
		backgroundId: 'butter',
		slots: [
			slot('p1', 9, 15, 55, 41, 'paper', -4, 2),
			slot('p2', 53, 45, 38, 35, 'paper', 5, 2),
			slot('p3', 12, 62, 34, 27, 'paper', -2, 2),
		],
		texts: [text('t1', 'Happy Birthday', 9, 6, 82, 9, 5.4, '#c2410c', handwrittenFont)],
		stickers: [sticker('s1', '★', 77, 20, 9, 9, 15, '#f59e0b'), sticker('s2', '✦', 5, 54, 8, 8, 0, '#ec4899')],
		tags: ['birthday', 'party', 'warm'],
	},
	{
		id: 'friends-photo-booth',
		name: 'Photo Booth',
		category: 'Friends',
		size: 'story',
		backgroundId: 'milk',
		slots: [
			slot('p1', 22, 8, 56, 23, 'film', 0, 0),
			slot('p2', 22, 33, 56, 23, 'film', 0, 0),
			slot('p3', 22, 58, 56, 23, 'film', 0, 0),
		],
		texts: [text('t1', 'besties', 29, 84, 42, 6, 4.6, '#111827', handwrittenFont)],
		stickers: [sticker('s1', '♡', 76, 84, 8, 8, 0, '#111827')],
		tags: ['booth', 'friends', 'film'],
	},
	{
		id: 'family-weekend',
		name: 'Weekend Album',
		category: 'Family',
		size: 'wide',
		backgroundId: 'sky',
		slots: [
			slot('p1', 5, 10, 41, 78, 'soft', 0, 3),
			slot('p2', 50, 10, 21, 36, 'soft', 0, 3),
			slot('p3', 74, 10, 21, 36, 'soft', 0, 3),
			slot('p4', 50, 52, 45, 36, 'soft', 0, 3),
		],
		texts: [text('t1', 'Weekend', 52, 45, 42, 6, 4.5, '#164e63', romanticFont, 'left')],
		stickers: [sticker('s1', '✿', 45, 11, 7, 7, 0, '#0e7490')],
		tags: ['family', 'weekend', 'wide'],
	},
	{
		id: 'wedding-vows',
		name: 'Vows Collage',
		category: 'Wedding',
		size: 'instagram-post',
		backgroundId: 'linen',
		slots: [slot('p1', 14, 8, 72, 42, 'polaroid', -1), slot('p2', 20, 51, 30, 30, 'polaroid', -5), slot('p3', 50, 54, 31, 27, 'polaroid', 5)],
		texts: [text('t1', 'Forever starts here', 19, 84, 62, 7, 4.1, '#44403c', romanticFont)],
		stickers: [sticker('s1', '✦', 83, 49, 8, 8, 0, '#d4af37')],
		tags: ['wedding', 'vows', 'romantic'],
		premium: true,
	},
	{
		id: 'travel-postcard',
		name: 'Postcard',
		category: 'Travel',
		size: 'wide',
		backgroundId: 'mint',
		slots: [slot('p1', 6, 10, 55, 79, 'paper', -1, 1), slot('p2', 65, 15, 29, 35, 'polaroid', 6), slot('p3', 65, 55, 29, 34, 'polaroid', -5)],
		texts: [text('t1', 'wish you were here', 64, 8, 31, 5, 3.2, '#0f766e', monoFont)],
		stickers: [sticker('s1', '✈', 75, 48, 9, 9, -12, '#0f766e')],
		tags: ['travel', 'postcard', 'wide'],
	},
	{
		id: 'cute-ribbon',
		name: 'Ribbon Frames',
		category: 'Cute',
		size: 'instagram-post',
		backgroundId: 'lavender',
		slots: [slot('p1', 20, 13, 60, 28, 'stamp', 0, 3), slot('p2', 20, 50, 60, 28, 'stamp', 0, 3)],
		texts: [text('t1', 'sweet memories', 17, 82, 66, 7, 4.5, '#7c3aed', handwrittenFont)],
		stickers: [sticker('s1', '୨୧', 36, 42, 28, 8, 0, '#7c3aed'), sticker('s2', '♥', 80, 8, 8, 8, 0, '#ec4899')],
		tags: ['ribbon', 'cute', 'pastel'],
	},
	{
		id: 'aesthetic-minimal',
		name: 'Minimal Mood',
		category: 'Aesthetic',
		size: 'square',
		backgroundId: 'clean',
		slots: [slot('p1', 14, 12, 68, 48, 'clean', 0, 0), slot('p2', 14, 65, 32, 22, 'clean', 0, 0), slot('p3', 50, 65, 32, 22, 'clean', 0, 0)],
		texts: [text('t1', 'visual diary', 14, 90, 68, 4, 2.8, '#171717', monoFont)],
		stickers: [],
		tags: ['minimal', 'aesthetic', 'clean'],
	},
	{
		id: 'story-pastel',
		name: 'Pastel Story',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'lavender',
		slots: [slot('p1', 12, 9, 76, 36, 'soft', 0, 5), slot('p2', 18, 51, 64, 31, 'polaroid', -2)],
		texts: [text('t1', 'today was cute', 18, 84, 64, 7, 4.6, '#6d28d9', handwrittenFont)],
		stickers: [sticker('s1', '✦', 83, 47, 7, 7, 0, '#6d28d9'), sticker('s2', '♡', 10, 81, 8, 8, -10, '#ec4899')],
		tags: ['story', 'pastel', 'cute'],
	},
	{
		id: 'poster-film-board',
		name: 'Film Board',
		category: 'Poster',
		size: 'a4',
		backgroundId: 'milk',
		slots: [
			slot('p1', 18, 9, 64, 20, 'film', -2, 0),
			slot('p2', 18, 32, 64, 20, 'film', 2, 0),
			slot('p3', 18, 55, 64, 20, 'film', -1, 0),
		],
		texts: [text('t1', 'CAMERA ROLL', 20, 82, 60, 5, 3.2, '#171717', monoFont)],
		stickers: [sticker('s1', '▰', 41, 29, 22, 5, -2, '#ef4444')],
		tags: ['poster', 'film', 'print'],
		premium: true,
	},
	{
		id: 'story-daily-dump',
		name: 'Daily Dump',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'milk',
		slots: [
			slot('p1', 8, 8, 58, 31, 'paper', -5, 2),
			slot('p2', 47, 31, 44, 25, 'polaroid', 6, 2),
			slot('p3', 13, 55, 40, 25, 'paper', -3, 2),
			slot('p4', 45, 67, 42, 22, 'paper', 4, 2),
		],
		texts: [text('t1', 'daily dump', 10, 90, 80, 5, 4.1, '#171717', monoFont)],
		stickers: [sticker('s1', '✦', 76, 8, 8, 8, 0, '#171717'), sticker('s2', '▰', 39, 51, 22, 4, -8, '#ef4444')],
		tags: ['story', 'dump', 'social'],
		premium: true,
	},
	{
		id: 'story-clean-recap',
		name: 'Clean Recap',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'clean',
		slots: [
			slot('p1', 10, 9, 80, 38, 'clean', 0, 2),
			slot('p2', 10, 51, 38, 25, 'clean', 0, 2),
			slot('p3', 52, 51, 38, 25, 'clean', 0, 2),
		],
		texts: [text('t1', 'WEEKEND RECAP', 10, 81, 80, 4.5, 3.1, '#171717', monoFont)],
		stickers: [sticker('s1', '01', 10, 5, 12, 4, 0, '#171717')],
		tags: ['story', 'minimal', 'recap'],
	},
	{
		id: 'story-birthday-invite',
		name: 'Birthday Invite',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'butter',
		slots: [slot('p1', 13, 10, 74, 39, 'polaroid', -2, 2), slot('p2', 19, 55, 62, 26, 'soft', 2, 5)],
		texts: [
			text('t1', 'Birthday Party', 12, 4, 76, 7, 5.2, '#c2410c', handwrittenFont),
			text('t2', 'tonight at 8', 20, 84, 60, 5, 3.2, '#7c2d12', monoFont),
		],
		stickers: [sticker('s1', '★', 78, 49, 9, 9, 12, '#f59e0b'), sticker('s2', '🎈', 8, 53, 9, 9, -8, '#ef4444')],
		tags: ['story', 'birthday', 'invite'],
		premium: true,
	},
	{
		id: 'story-love-note',
		name: 'Love Note',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'rose',
		slots: [
			slot('p1', 15, 12, 58, 29, 'polaroid', -6, 2),
			slot('p2', 34, 42, 51, 28, 'polaroid', 7, 2),
		],
		texts: [text('t1', 'love you more', 12, 76, 76, 7, 5.2, '#be123c', romanticFont)],
		stickers: [sticker('s1', '♡', 73, 9, 10, 10, 8, '#fb7185'), sticker('s2', '♥', 18, 67, 9, 9, -8, '#e11d48')],
		tags: ['story', 'love', 'couple'],
	},
	{
		id: 'story-travel-map',
		name: 'Travel Story',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'mint',
		slots: [
			slot('p1', 9, 9, 82, 34, 'paper', 0, 1),
			slot('p2', 13, 49, 36, 28, 'polaroid', -5, 2),
			slot('p3', 52, 48, 36, 29, 'polaroid', 6, 2),
		],
		texts: [text('t1', 'OUT OF OFFICE', 12, 82, 76, 5, 3.4, '#0f766e', monoFont)],
		stickers: [sticker('s1', '✈', 77, 43, 9, 9, -16, '#0f766e'), sticker('s2', '▰', 41, 6, 20, 4, 7, '#e7cf8c')],
		tags: ['story', 'travel', 'vacation'],
	},
	{
		id: 'story-night-out',
		name: 'Night Out',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'film',
		slots: [
			slot('p1', 16, 9, 68, 24, 'film', 0, 0),
			slot('p2', 16, 36, 68, 24, 'film', 0, 0),
			slot('p3', 16, 63, 68, 24, 'film', 0, 0),
		],
		texts: [text('t1', 'CAMERA ROLL', 22, 90, 56, 4.5, 3.3, '#ffffff', monoFont)],
		stickers: [sticker('s1', '✦', 82, 34, 8, 8, 0, '#ffffff'), sticker('s2', 'PLAY', 12, 4, 18, 4, 0, '#ffffff')],
		tags: ['story', 'night', 'film'],
		premium: true,
	},
	{
		id: 'story-social-cover',
		name: 'Social Cover',
		category: 'Instagram Story',
		size: 'story',
		backgroundId: 'clean',
		slots: [
			slot('p1', 9, 8, 82, 38, 'clean', 0, 0),
			slot('p2', 10, 52, 37, 25, 'paper', -4, 1),
			slot('p3', 53, 50, 37, 27, 'paper', 5, 1),
		],
		texts: [
			text('t1', 'new post', 10, 80, 80, 5.5, 4.5, '#171717', romanticFont),
			text('t2', 'share your favorite moments', 13, 87, 74, 4, 2.5, '#737373', monoFont),
		],
		stickers: [
			sticker('s1', '✦', 83, 46, 8, 8, 0, '#171717'),
			sticker('s2', '♡', 10, 47, 8, 8, -12, '#ef476f'),
			sticker('s3', '▰', 39, 48, 22, 4, -8, '#e7cf8c'),
		],
		tags: ['story', 'cover', 'social'],
		premium: true,
	},
	{
		id: 'post-photo-dump',
		name: 'Photo Dump',
		category: 'Instagram Post',
		size: 'instagram-post',
		backgroundId: 'milk',
		slots: [
			slot('p1', 7, 8, 43, 29, 'paper', -3, 1),
			slot('p2', 52, 8, 41, 29, 'paper', 3, 1),
			slot('p3', 8, 42, 36, 24, 'paper', 5, 1),
			slot('p4', 47, 40, 45, 29, 'paper', -4, 1),
			slot('p5', 19, 70, 62, 20, 'paper', 0, 1),
		],
		texts: [text('t1', 'photo dump', 12, 92, 76, 4.5, 3.4, '#171717', monoFont)],
		stickers: [sticker('s1', '✦', 84, 70, 7, 7, 0, '#171717'), sticker('s2', '○', 8, 68, 6, 6, 0, '#171717')],
		tags: ['post', 'dump', 'carousel'],
		premium: true,
	},
	{
		id: 'post-soft-grid',
		name: 'Soft Grid Post',
		category: 'Instagram Post',
		size: 'instagram-post',
		backgroundId: 'rose',
		slots: [
			slot('p1', 8, 12, 41, 28, 'soft', 0, 4),
			slot('p2', 51, 12, 41, 28, 'soft', 0, 4),
			slot('p3', 8, 42, 41, 28, 'soft', 0, 4),
			slot('p4', 51, 42, 41, 28, 'soft', 0, 4),
		],
		texts: [text('t1', 'little moments', 13, 76, 74, 6, 4.5, '#be123c', romanticFont)],
		stickers: [sticker('s1', '♡', 81, 6, 8, 8, 10, '#fb7185'), sticker('s2', '✿', 10, 73, 8, 8, -10, '#e11d48')],
		tags: ['post', 'grid', 'pink'],
	},
	{
		id: 'post-editorial-cover',
		name: 'Editorial Cover',
		category: 'Instagram Post',
		size: 'instagram-post',
		backgroundId: 'clean',
		slots: [slot('p1', 8, 8, 84, 58, 'clean', 0, 0), slot('p2', 54, 61, 36, 25, 'paper', 0, 1)],
		texts: [
			text('t1', 'THE WEEKEND', 9, 70, 46, 5, 3.7, '#171717', monoFont, 'left'),
			text('t2', 'visual diary', 9, 76, 44, 5, 3.9, '#171717', romanticFont, 'left'),
		],
		stickers: [sticker('s1', '01', 80, 89, 10, 4, 0, '#171717')],
		tags: ['post', 'editorial', 'cover'],
		premium: true,
	},
	{
		id: 'post-polaroid-carousel',
		name: 'Polaroid Post',
		category: 'Instagram Post',
		size: 'square',
		backgroundId: 'linen',
		slots: [
			slot('p1', 10, 13, 38, 35, 'polaroid', -7, 2),
			slot('p2', 52, 10, 38, 35, 'polaroid', 6, 2),
			slot('p3', 29, 50, 43, 36, 'polaroid', -1, 2),
		],
		texts: [text('t1', 'memories', 31, 88, 38, 5, 4.2, '#57534e', handwrittenFont)],
		stickers: [sticker('s1', '▰', 39, 47, 22, 5, -9, '#e7cf8c'), sticker('s2', '✦', 78, 47, 8, 8, 0, '#57534e')],
		tags: ['post', 'polaroid', 'square'],
	},
	{
		id: 'post-birthday-recap',
		name: 'Birthday Recap',
		category: 'Instagram Post',
		size: 'instagram-post',
		backgroundId: 'butter',
		slots: [
			slot('p1', 9, 14, 82, 32, 'soft', 0, 4),
			slot('p2', 9, 51, 39, 27, 'paper', -4, 1),
			slot('p3', 52, 51, 39, 27, 'paper', 4, 1),
		],
		texts: [text('t1', 'birthday recap', 10, 5, 80, 6, 5.1, '#c2410c', handwrittenFont)],
		stickers: [sticker('s1', '★', 83, 44, 8, 8, 14, '#f59e0b'), sticker('s2', '🎈', 8, 80, 8, 8, -6, '#ef4444')],
		tags: ['post', 'birthday', 'recap'],
	},
	{
		id: 'post-travel-itinerary',
		name: 'Travel Mood',
		category: 'Instagram Post',
		size: 'instagram-post',
		backgroundId: 'sky',
		slots: [
			slot('p1', 7, 9, 50, 38, 'paper', -2, 1),
			slot('p2', 60, 12, 33, 24, 'polaroid', 6, 1),
			slot('p3', 13, 53, 36, 31, 'polaroid', -5, 1),
			slot('p4', 52, 49, 39, 31, 'paper', 2, 1),
		],
		texts: [text('t1', 'wish you were here', 10, 86, 80, 5, 3.4, '#164e63', monoFont)],
		stickers: [sticker('s1', '✈', 80, 39, 8, 8, -12, '#164e63'), sticker('s2', '▰', 42, 48, 20, 4, 7, '#e7cf8c')],
		tags: ['post', 'travel', 'mood'],
	},
	{
		id: 'post-cute-sticker',
		name: 'Sticker Post',
		category: 'Instagram Post',
		size: 'square',
		backgroundId: 'lavender',
		slots: [
			slot('p1', 12, 17, 34, 35, 'stamp', -5, 4),
			slot('p2', 53, 17, 35, 35, 'stamp', 5, 4),
			slot('p3', 18, 57, 64, 28, 'soft', 0, 4),
		],
		texts: [text('t1', 'sweet day', 20, 7, 60, 7, 5.1, '#6d28d9', handwrittenFont)],
		stickers: [sticker('s1', '୨୧', 37, 50, 26, 8, 0, '#ec4899'), sticker('s2', '✿', 81, 55, 9, 9, 10, '#8b5cf6')],
		tags: ['post', 'cute', 'sticker'],
	},
	{
		id: 'post-minimal-quote',
		name: 'Quote Photo',
		category: 'Instagram Post',
		size: 'square',
		backgroundId: 'clean',
		slots: [slot('p1', 10, 10, 80, 52, 'clean', 0, 0)],
		texts: [
			text('t1', 'best memories', 14, 67, 72, 6, 4.9, '#171717', romanticFont),
			text('t2', 'save this moment', 14, 75, 72, 4, 2.8, '#737373', monoFont),
		],
		stickers: [sticker('s1', '—', 25, 64, 50, 3, 0, '#171717')],
		tags: ['post', 'quote', 'minimal'],
	},
	{
		id: 'post-film-diary',
		name: 'Film Diary',
		category: 'Instagram Post',
		size: 'instagram-post',
		backgroundId: 'film',
		slots: [
			slot('p1', 13, 12, 74, 24, 'film', 0, 0),
			slot('p2', 13, 39, 74, 24, 'film', 0, 0),
			slot('p3', 13, 66, 74, 22, 'film', 0, 0),
		],
		texts: [text('t1', 'CAMERA1 PLAY', 10, 5, 36, 4, 2.8, '#ffffff', monoFont, 'left')],
		stickers: [sticker('s1', '00:23', 70, 92, 18, 4, 0, '#ffffff'), sticker('s2', '✦', 85, 36, 7, 7, 0, '#ffffff')],
		tags: ['post', 'film', 'diary'],
		premium: true,
	},
	{
		id: 'post-summer-photo-set',
		name: 'Summer Set',
		category: 'Instagram Post',
		size: 'instagram-post',
		backgroundId: 'mint',
		slots: [
			slot('p1', 8, 10, 84, 35, 'soft', 0, 3),
			slot('p2', 8, 50, 27, 25, 'paper', -4, 1),
			slot('p3', 36.5, 49, 27, 26, 'paper', 2, 1),
			slot('p4', 65, 50, 27, 25, 'paper', 5, 1),
		],
		texts: [text('t1', 'summer set', 13, 81, 74, 5, 4.4, '#0f766e', handwrittenFont)],
		stickers: [sticker('s1', '✿', 8, 77, 8, 8, -8, '#0f766e'), sticker('s2', '♡', 83, 6, 8, 8, 8, '#0f766e')],
		tags: ['post', 'summer', 'set'],
	},
];

export type TemplateId = (typeof templates)[number]['id'];

export const elementPresets: ElementPreset[] = [
	{ id: 'heart', name: 'Heart', content: '♥', color: '#ef476f' },
	{ id: 'outline-heart', name: 'Love', content: '♡', color: '#fb7185' },
	{ id: 'sparkle', name: 'Sparkle', content: '✦', color: '#f59e0b' },
	{ id: 'outline-sparkle', name: 'Outline Sparkle', content: '✧', color: '#333333' },
	{ id: 'ink-plus', name: 'Ink Plus', content: '+', color: '#333333' },
	{ id: 'star', name: 'Star', content: '★', color: '#facc15' },
	{ id: 'flower', name: 'Flower', content: '✿', color: '#a855f7' },
	{ id: 'bow', name: 'Bow', content: '୨୧', color: '#ec4899' },
	{ id: 'ribbon', name: 'Ribbon', content: '▰', color: '#f7d37a' },
	{ id: 'butterfly', name: 'Butterfly', content: '🦋', color: '#0ea5e9' },
	{ id: 'camera', name: 'Camera', content: '📷', color: '#171717' },
	{ id: 'balloon', name: 'Balloon', content: '🎈', color: '#ef4444' },
	{ id: 'flower-emoji', name: 'Bouquet', content: '💐', color: '#16a34a' },
	{ id: 'tape', name: 'Tape', content: '▰', color: '#e9d39b' },
];

export const textPresets: TextStylePreset[] = [
	{ id: 'love-you', name: 'Love You', text: 'Love You', fontFamily: romanticFont, fontSize: 6, color: '#be123c', bold: true, align: 'center' },
	{
		id: 'best-memories',
		name: 'Best Memories',
		text: 'Best Memories',
		fontFamily: romanticFont,
		fontSize: 5.4,
		color: '#171717',
		bold: true,
		align: 'center',
	},
	{
		id: 'happy-birthday',
		name: 'Happy Birthday',
		text: 'Happy Birthday',
		fontFamily: handwrittenFont,
		fontSize: 5.6,
		color: '#c2410c',
		bold: true,
		align: 'center',
	},
	{
		id: 'forever',
		name: 'Forever Together',
		text: 'Forever Together',
		fontFamily: romanticFont,
		fontSize: 5,
		color: '#7f1d1d',
		bold: true,
		align: 'center',
	},
	{ id: 'camera-roll', name: 'Camera Roll', text: 'CAMERA ROLL', fontFamily: monoFont, fontSize: 3.2, color: '#171717', align: 'center' },
];

export function getTemplate(id: string): CollageTemplate {
	return templates.find((template) => template.id === id) ?? templates[0];
}

export function getBackground(id: string): BackgroundPreset {
	return backgrounds.find((background) => background.id === id) ?? backgrounds[0];
}

export function getSize(id: SizeId): SizePreset {
	return sizePresets[id] ?? sizePresets.square;
}

export function smartTemplateForCount(count: number): CollageTemplate {
	if (count <= 2) return getTemplate('love-polaroid-stack');
	if (count === 3) return getTemplate('friends-camera-play');
	if (count <= 5) return getTemplate('family-soft-grid');
	return getTemplate('poster-gallery');
}
