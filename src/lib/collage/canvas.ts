import type { BackgroundPreset, ExportFormat, FrameStyle, ImageFit, PhotoFilter, SizePreset, TextAlign } from './templates';

export interface DrawablePhoto {
	id: string;
	image: HTMLImageElement;
}

export interface BaseLayer {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation: number;
}

export interface PhotoLayer extends BaseLayer {
	kind: 'photo';
	photoId: string | null;
	frame: FrameStyle;
	fit: ImageFit;
	filter: PhotoFilter;
	cropX: number;
	cropY: number;
	scale: number;
	radius: number;
}

export interface TextLayer extends BaseLayer {
	kind: 'text';
	text: string;
	fontFamily: string;
	fontSize: number;
	color: string;
	bold: boolean;
	italic: boolean;
	align: TextAlign;
}

export interface StickerLayer extends BaseLayer {
	kind: 'sticker';
	content: string;
	color: string;
	background: string;
	opacity: number;
}

export type DesignLayer = PhotoLayer | TextLayer | StickerLayer;

export interface ExportDesign {
	background: BackgroundPreset;
	backgroundPhoto?: DrawablePhoto | null;
	backgroundTone?: number;
	format: ExportFormat;
	layers: DesignLayer[];
	photos: DrawablePhoto[];
	size: SizePreset;
}

interface PixelRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export async function renderDesignToCanvas(canvas: HTMLCanvasElement, design: ExportDesign): Promise<void> {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Canvas rendering is unavailable in this browser.');
	}

	canvas.width = design.size.width;
	canvas.height = design.size.height;
	context.clearRect(0, 0, canvas.width, canvas.height);
	await drawBackground(context, design.background, canvas.width, canvas.height, design.backgroundPhoto ?? null);
	drawBackgroundTone(context, design.backgroundTone ?? 50, canvas.width, canvas.height);

	for (const layer of design.layers) {
		if (layer.kind === 'photo') {
			await drawPhotoLayer(context, layer, design.photos, canvas.width, canvas.height);
		}
		if (layer.kind === 'text') {
			drawTextLayer(context, layer, canvas.width, canvas.height);
		}
		if (layer.kind === 'sticker') {
			await drawStickerLayer(context, layer, canvas.width, canvas.height);
		}
	}
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: ExportFormat): Promise<Blob> {
	const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
					return;
				}

				reject(new Error('Could not create the collage image.'));
			},
			mime,
			0.95,
		);
	});
}

async function drawBackground(
	context: CanvasRenderingContext2D,
	background: BackgroundPreset,
	width: number,
	height: number,
	backgroundPhoto: DrawablePhoto | null,
): Promise<void> {
	if (background.css.startsWith('linear-gradient')) {
		const gradient = context.createLinearGradient(0, 0, width, height);
		const colors = gradientStops(background.id);
		gradient.addColorStop(0, colors[0]);
		gradient.addColorStop(1, colors[1]);
		context.fillStyle = gradient;
	} else {
		context.fillStyle = background.base;
	}

	context.fillRect(0, 0, width, height);
	drawPattern(context, background, width, height);

	if (!backgroundPhoto) return;
	await ensureLoaded(backgroundPhoto.image);
	if (!backgroundPhoto.image.naturalWidth || !backgroundPhoto.image.naturalHeight) return;
	drawImageFit(context, backgroundPhoto.image, { x: 0, y: 0, w: width, h: height }, 'cover', 50, 50, 1);
}

function gradientStops(id: string): [string, string] {
	const map: Record<string, [string, string]> = {
		butter: ['#fff8d8', '#ffe3b3'],
		aurora: ['#ccfbf1', '#a78bfa'],
		candy: ['#fed7e2', '#bfdbfe'],
		'editorial-blush': ['#fff7ed', '#e0f2fe'],
		forest: ['#ecfccb', '#134e4a'],
		graphite: ['#18181b', '#52525b'],
		'crumpled-paper': ['#f4f4f2', '#d9d9d6'],
		lavender: ['#f4edff', '#ffdff3'],
		midnight: ['#111827', '#312e81'],
		mint: ['#e3fff6', '#f8ffe3'],
		ocean: ['#dff7ff', '#0f766e'],
		prism: ['#fdf2f8', '#fde68a'],
		rose: ['#fff1f2', '#ffd6e4'],
		sky: ['#e8f4ff', '#d7fff6'],
		sunset: ['#fff7ad', '#fb7185'],
	};

	return map[id] ?? ['#ffffff', '#f5f5f5'];
}

function drawPattern(context: CanvasRenderingContext2D, background: BackgroundPreset, width: number, height: number): void {
	const dark = isDarkColor(background.base);

	context.save();
	context.globalAlpha = dark ? 0.16 : 0.28;
	context.strokeStyle = dark ? '#ffffff' : '#171717';
	context.fillStyle = context.strokeStyle;

	if (background.pattern === 'dots') {
		const step = Math.max(24, width / 28);
		for (let x = step / 2; x < width; x += step) {
			for (let y = step / 2; y < height; y += step) {
				context.beginPath();
				context.arc(x, y, Math.max(1, width / 360), 0, Math.PI * 2);
				context.fill();
			}
		}
	}

	if (background.pattern === 'grid') {
		const step = Math.max(48, width / 18);
		context.lineWidth = Math.max(1, width / 1200);
		for (let x = 0; x <= width; x += step) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, height);
			context.stroke();
		}
		for (let y = 0; y <= height; y += step) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(width, y);
			context.stroke();
		}
	}

	if (background.pattern === 'paper') {
		for (let index = 0; index < 220; index += 1) {
			const x = seededNoise(index * 17) * width;
			const y = seededNoise(index * 31) * height;
			context.globalAlpha = 0.06;
			context.fillRect(x, y, Math.max(1, width / 420), Math.max(1, height / 420));
		}
	}

	if (background.pattern === 'crumpled') {
		context.globalAlpha = dark ? 0.2 : 0.16;
		context.lineWidth = Math.max(1, width / 900);
		for (let index = 0; index < 34; index += 1) {
			const startX = seededNoise(index * 13) * width;
			const startY = seededNoise(index * 23) * height;
			context.beginPath();
			context.moveTo(startX, startY);
			for (let step = 1; step <= 5; step += 1) {
				const nextX = startX + (seededNoise(index * 31 + step * 7) - 0.5) * width * 0.52;
				const nextY = startY + step * height * 0.1 + (seededNoise(index * 43 + step * 11) - 0.5) * height * 0.18;
				context.lineTo(nextX, nextY);
			}
			context.stroke();
		}
		context.globalAlpha = dark ? 0.12 : 0.1;
		for (let index = 0; index < 420; index += 1) {
			const x = seededNoise(index * 17) * width;
			const y = seededNoise(index * 31) * height;
			context.fillRect(x, y, Math.max(1, width / 520), Math.max(1, height / 520));
		}
	}

	if (background.pattern === 'hearts') {
		const step = Math.max(120, width / 7);
		context.font = `${Math.max(18, width / 44)}px Georgia, serif`;
		for (let x = step / 2; x < width; x += step) {
			for (let y = step / 2; y < height; y += step) {
				context.fillText('♡', x, y);
			}
		}
	}

	if (background.pattern === 'stripes') {
		const step = Math.max(34, width / 36);
		context.lineWidth = Math.max(8, width / 80);
		for (let x = -width; x < width * 1.5; x += step) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x + height, height);
			context.stroke();
		}
	}

	if (background.pattern === 'stars') {
		const step = Math.max(72, width / 13);
		context.globalAlpha = dark ? 0.42 : 0.18;
		context.font = `${Math.max(10, width / 72)}px Georgia, serif`;
		for (let x = step / 2; x < width; x += step) {
			for (let y = step / 2; y < height; y += step) {
				context.fillText(seededNoise(x + y) > 0.5 ? '✦' : '+', x, y);
			}
		}
	}

	if (background.pattern === 'bubbles') {
		const step = Math.max(80, width / 12);
		context.globalAlpha = dark ? 0.18 : 0.22;
		context.lineWidth = Math.max(1, width / 900);
		for (let x = step / 2; x < width; x += step) {
			for (let y = step / 2; y < height; y += step) {
				const radius = Math.max(10, step * (0.16 + seededNoise(x * 7 + y * 11) * 0.16));
				context.beginPath();
				context.arc(x, y, radius, 0, Math.PI * 2);
				context.stroke();
			}
		}
	}

	if (background.pattern === 'waves') {
		const step = Math.max(80, height / 14);
		context.globalAlpha = dark ? 0.2 : 0.18;
		context.lineWidth = Math.max(2, width / 540);
		for (let y = step / 2; y < height; y += step) {
			context.beginPath();
			context.moveTo(-width * 0.08, y);
			for (let x = -width * 0.08; x < width * 1.08; x += width / 4) {
				context.bezierCurveTo(x + width / 12, y - step * 0.45, x + width / 6, y + step * 0.45, x + width / 4, y);
			}
			context.stroke();
		}
	}

	if (background.pattern === 'confetti') {
		context.globalAlpha = dark ? 0.26 : 0.2;
		for (let index = 0; index < 90; index += 1) {
			const x = seededNoise(index * 19) * width;
			const y = seededNoise(index * 29) * height;
			const size = Math.max(5, width / 190);
			context.save();
			context.translate(x, y);
			context.rotate(seededNoise(index * 37) * Math.PI);
			context.fillRect(-size / 2, -size / 2, size * 1.6, size * 0.45);
			context.restore();
		}
	}

	if (background.pattern === 'mesh') {
		const blobs = [
			[0.18, 0.18, 0.32],
			[0.82, 0.22, 0.28],
			[0.35, 0.82, 0.26],
			[0.78, 0.78, 0.34],
		] as const;
		for (const [x, y, radius] of blobs) {
			const gradient = context.createRadialGradient(x * width, y * height, 0, x * width, y * height, radius * width);
			gradient.addColorStop(0, dark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.48)');
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
			context.fillStyle = gradient;
			context.globalAlpha = 1;
			context.fillRect(0, 0, width, height);
		}
	}

	context.restore();
}

function drawBackgroundTone(context: CanvasRenderingContext2D, value: number, width: number, height: number): void {
	const tone = Math.min(100, Math.max(0, value));
	if (tone === 50) return;

	context.save();
	if (tone < 50) {
		context.fillStyle = '#ffffff';
		context.globalAlpha = ((50 - tone) / 50) * 0.72;
	} else {
		context.fillStyle = '#000000';
		context.globalAlpha = ((tone - 50) / 50) * 0.52;
	}
	context.fillRect(0, 0, width, height);
	context.restore();
}

function isDarkColor(value: string): boolean {
	if (!/^#[0-9a-f]{6}$/i.test(value)) return false;
	const red = Number.parseInt(value.slice(1, 3), 16);
	const green = Number.parseInt(value.slice(3, 5), 16);
	const blue = Number.parseInt(value.slice(5, 7), 16);
	const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
	return luminance < 0.28;
}

async function drawPhotoLayer(
	context: CanvasRenderingContext2D,
	layer: PhotoLayer,
	photos: DrawablePhoto[],
	canvasWidth: number,
	canvasHeight: number,
): Promise<void> {
	const rect = toPixelRect(layer, canvasWidth, canvasHeight);
	const photo = photos.find((item) => item.id === layer.photoId);

	context.save();
	applyLayerTransform(context, rect, layer.rotation);
	drawFrameBase(context, layer.frame, rect.w, rect.h, layer.radius);

	const imageRect = frameImageRect(layer.frame, rect.w, rect.h);
	const radius = frameRadius(layer.frame, layer.radius, rect.w, rect.h);

	if (photo) {
		await ensureLoaded(photo.image);
		if (photo.image.naturalWidth && photo.image.naturalHeight) {
			context.save();
			roundedRect(context, imageRect.x, imageRect.y, imageRect.w, imageRect.h, radius);
			context.clip();
			context.filter = canvasPhotoFilter(layer.filter);
			drawImageFit(context, photo.image, imageRect, layer.fit, layer.cropX, layer.cropY, layer.scale);
			context.filter = 'none';
			context.restore();
		}
	} else {
		context.save();
		roundedRect(context, imageRect.x, imageRect.y, imageRect.w, imageRect.h, radius);
		context.clip();
		context.fillStyle = '#f1f1f1';
		context.fillRect(imageRect.x, imageRect.y, imageRect.w, imageRect.h);
		context.fillStyle = '#8f8f8f';
		context.font = `${Math.max(20, rect.w * 0.18)}px Inter, Arial, sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('+', imageRect.x + imageRect.w / 2, imageRect.y + imageRect.h / 2);
		context.restore();
	}

	drawFrameDetails(context, layer.frame, rect.w, rect.h);
	context.restore();
}

function canvasPhotoFilter(filter: PhotoFilter): string {
	const map: Record<PhotoFilter, string> = {
		cool: 'saturate(0.92) contrast(1.04) brightness(1.03) sepia(0.08) hue-rotate(178deg)',
		matte: 'saturate(0.78) contrast(0.92) brightness(1.08) sepia(0.1)',
		mono: 'grayscale(1) contrast(1.08) brightness(1.02)',
		none: 'none',
		vivid: 'saturate(1.26) contrast(1.08) brightness(1.02)',
		warm: 'saturate(1.04) contrast(1.03) brightness(1.03) sepia(0.16)',
	};

	return map[filter] ?? 'none';
}

function drawTextLayer(context: CanvasRenderingContext2D, layer: TextLayer, canvasWidth: number, canvasHeight: number): void {
	const rect = toPixelRect(layer, canvasWidth, canvasHeight);
	const fontSize = Math.max(10, (layer.fontSize / 100) * canvasWidth);
	const fontStyle = `${layer.italic ? 'italic ' : ''}${layer.bold ? '700 ' : '400 '}${fontSize}px ${layer.fontFamily}`;

	context.save();
	applyLayerTransform(context, rect, layer.rotation);
	context.fillStyle = layer.color;
	context.font = fontStyle;
	context.textAlign = layer.align;
	context.textBaseline = 'top';

	const x = layer.align === 'center' ? rect.w / 2 : layer.align === 'right' ? rect.w : 0;
	drawWrappedText(context, layer.text, x, 0, rect.w, fontSize * 1.15, layer.align);
	context.restore();
}

async function drawStickerLayer(context: CanvasRenderingContext2D, layer: StickerLayer, canvasWidth: number, canvasHeight: number): Promise<void> {
	const rect = toPixelRect(layer, canvasWidth, canvasHeight);
	const fontSize = Math.max(12, Math.min(rect.w, rect.h) * 0.82);

	context.save();
	context.globalAlpha = layer.opacity;
	applyLayerTransform(context, rect, layer.rotation);
	if (isSvgMarkup(layer.content)) {
		await drawSvgMarkup(context, layer.content, rect.w, rect.h);
		context.restore();
		return;
	}
	if (layer.background !== 'transparent') {
		context.fillStyle = layer.background;
		roundedRect(context, 0, 0, rect.w, rect.h, Math.min(rect.w, rect.h) * 0.18);
		context.fill();
	}
	context.fillStyle = layer.color;
	context.font = `700 ${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", Inter, Arial, sans-serif`;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(layer.content, rect.w / 2, rect.h / 2 + fontSize * 0.03);
	context.restore();
}

async function drawSvgMarkup(context: CanvasRenderingContext2D, markup: string, width: number, height: number): Promise<void> {
	const image = new Image();
	image.decoding = 'async';
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
	await ensureLoaded(image);
	if (!image.naturalWidth || !image.naturalHeight) return;
	context.drawImage(image, 0, 0, width, height);
}

function isSvgMarkup(value: string): boolean {
	return value.trimStart().startsWith('<svg');
}

function toPixelRect(layer: BaseLayer, canvasWidth: number, canvasHeight: number): PixelRect {
	return {
		x: (layer.x / 100) * canvasWidth,
		y: (layer.y / 100) * canvasHeight,
		w: (layer.w / 100) * canvasWidth,
		h: (layer.h / 100) * canvasHeight,
	};
}

function applyLayerTransform(context: CanvasRenderingContext2D, rect: PixelRect, rotation: number): void {
	context.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
	context.rotate((rotation * Math.PI) / 180);
	context.translate(-rect.w / 2, -rect.h / 2);
}

function drawFrameBase(context: CanvasRenderingContext2D, frame: FrameStyle, width: number, height: number, radius: number): void {
	const corner = frameRadius(frame, radius, width, height) * 1.2;

	context.save();
	context.shadowColor = '#00000026';
	context.shadowBlur = Math.max(6, Math.min(width, height) * 0.045);
	context.shadowOffsetY = Math.max(3, height * 0.015);

	if (frame === 'film') {
		context.fillStyle = '#101010';
		roundedRect(context, 0, 0, width, height, corner);
		context.fill();
	} else if (frame === 'soft') {
		context.fillStyle = '#ffffffcc';
		roundedRect(context, 0, 0, width, height, corner);
		context.fill();
	} else if (frame === 'clean') {
		context.fillStyle = '#ffffff';
		roundedRect(context, 0, 0, width, height, corner);
		context.fill();
	} else if (frame === 'shadow') {
		context.fillStyle = '#333331';
		roundedRect(context, 0, 0, width, height, corner);
		context.fill();
	} else {
		context.fillStyle = '#fffdf6';
		roundedRect(context, 0, 0, width, height, corner);
		context.fill();
	}

	context.restore();
}

function drawFrameDetails(context: CanvasRenderingContext2D, frame: FrameStyle, width: number, height: number): void {
	context.save();
	if (frame === 'film') {
		const dotSize = Math.max(2, width * 0.025);
		const gap = dotSize * 1.9;
		context.fillStyle = '#f9fafb';
		for (let x = dotSize; x < width - dotSize; x += gap) {
			roundedRect(context, x, height * 0.045, dotSize, dotSize * 0.8, dotSize * 0.2);
			context.fill();
			roundedRect(context, x, height - height * 0.045 - dotSize * 0.8, dotSize, dotSize * 0.8, dotSize * 0.2);
			context.fill();
		}
	}

	if (frame === 'stamp') {
		context.strokeStyle = '#ffffff';
		context.lineWidth = Math.max(4, width * 0.025);
		context.setLineDash([Math.max(8, width * 0.04), Math.max(5, width * 0.025)]);
		context.strokeRect(width * 0.025, height * 0.025, width * 0.95, height * 0.95);
	}

	if (frame === 'polaroid') {
		context.fillStyle = '#c0392b';
		context.font = `700 ${Math.max(9, width * 0.04)}px Courier New, monospace`;
		context.textAlign = 'center';
		context.fillText('memories', width / 2, height - height * 0.055);
	}

	if (frame === 'shadow') {
		context.strokeStyle = '#242424';
		context.lineWidth = Math.max(2, Math.min(width, height) * 0.012);
		roundedRect(context, 0, 0, width, height, Math.min(width, height) * 0.012);
		context.stroke();
	}

	context.restore();
}

function frameImageRect(frame: FrameStyle, width: number, height: number): PixelRect {
	const inset = Math.min(width, height) * 0.045;
	if (frame === 'clean') return { x: 0, y: 0, w: width, h: height };
	if (frame === 'film') return { x: width * 0.075, y: height * 0.11, w: width * 0.85, h: height * 0.78 };
	if (frame === 'polaroid') return { x: inset, y: inset, w: width - inset * 2, h: height - inset * 2 - height * 0.14 };
	if (frame === 'stamp') return { x: inset * 1.2, y: inset * 1.2, w: width - inset * 2.4, h: height - inset * 2.4 };
	if (frame === 'shadow') return { x: inset * 0.82, y: inset * 0.82, w: width - inset * 1.64, h: height - inset * 1.64 };
	return { x: inset, y: inset, w: width - inset * 2, h: height - inset * 2 };
}

function frameRadius(frame: FrameStyle, radius: number, width: number, height: number): number {
	if (frame === 'clean' || frame === 'film') return Math.min(width, height) * (radius / 100);
	return Math.min(width, height) * Math.max(0.015, radius / 100);
}

function drawImageFit(
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	rect: PixelRect,
	fit: ImageFit,
	cropX: number,
	cropY: number,
	scaleValue: number,
): void {
	const baseScale =
		fit === 'cover'
			? Math.max(rect.w / image.naturalWidth, rect.h / image.naturalHeight)
			: Math.min(rect.w / image.naturalWidth, rect.h / image.naturalHeight);
	const scale = baseScale * Math.max(0.2, scaleValue);
	const drawWidth = image.naturalWidth * scale;
	const drawHeight = image.naturalHeight * scale;
	const offsetX = (rect.w - drawWidth) * (cropX / 100);
	const offsetY = (rect.h - drawHeight) * (cropY / 100);

	context.drawImage(image, rect.x + offsetX, rect.y + offsetY, drawWidth, drawHeight);
}

function drawWrappedText(
	context: CanvasRenderingContext2D,
	value: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number,
	align: TextAlign,
): void {
	const words = value.split(/\s+/);
	const lines: string[] = [];
	let current = '';

	for (const word of words) {
		const test = current ? `${current} ${word}` : word;
		if (context.measureText(test).width <= maxWidth || !current) {
			current = test;
		} else {
			lines.push(current);
			current = word;
		}
	}

	if (current) lines.push(current);

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const drawX = align === 'left' ? 0 : align === 'right' ? maxWidth : x;
		context.fillText(line, drawX, y + index * lineHeight);
	}
}

function roundedRect(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
): void {
	const safeRadius = Math.min(radius, width / 2, height / 2);

	context.beginPath();
	context.moveTo(x + safeRadius, y);
	context.lineTo(x + width - safeRadius, y);
	context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
	context.lineTo(x + width, y + height - safeRadius);
	context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
	context.lineTo(x + safeRadius, y + height);
	context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
	context.lineTo(x, y + safeRadius);
	context.quadraticCurveTo(x, y, x + safeRadius, y);
	context.closePath();
}

async function ensureLoaded(image: HTMLImageElement): Promise<void> {
	if (image.complete && image.naturalWidth) return;
	if (image.decode) {
		await image.decode().catch(() => undefined);
		return;
	}

	await new Promise<void>((resolve) => {
		image.onload = () => resolve();
		image.onerror = () => resolve();
	});
}

function seededNoise(seed: number): number {
	const value = Math.sin(seed * 999) * 10000;
	return value - Math.floor(value);
}
