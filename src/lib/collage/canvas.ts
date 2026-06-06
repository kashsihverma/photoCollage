import type { CollageLayout } from './layouts';
import type { ImageFit, RatioSpec } from './templates';

export interface DrawablePhoto {
	image: HTMLImageElement;
}

export interface DrawOptions {
	background: string;
	corner: number;
	fit: ImageFit;
	ratio: RatioSpec;
	spacing: number;
}

export async function drawCollage(
	canvas: HTMLCanvasElement,
	layout: CollageLayout,
	photos: DrawablePhoto[],
	options: DrawOptions,
): Promise<void> {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Canvas rendering is unavailable in this browser.');
	}

	canvas.width = options.ratio.width;
	canvas.height = options.ratio.height;

	const scale = options.ratio.width / 760;
	const gap = Math.round(options.spacing * scale);
	const padding = gap;
	const corner = Math.round(options.corner * scale);

	context.fillStyle = options.background;
	context.fillRect(0, 0, canvas.width, canvas.height);

	const unitWidth = (canvas.width - padding * 2 - gap * (layout.columns - 1)) / layout.columns;
	const unitHeight = (canvas.height - padding * 2 - gap * (layout.rows - 1)) / layout.rows;

	for (let index = 0; index < layout.cells.length; index += 1) {
		const cell = layout.cells[index];
		const photo = photos[index];
		if (!photo) continue;

		await ensureLoaded(photo.image);
		if (!photo.image.naturalWidth || !photo.image.naturalHeight) continue;

		const x = padding + cell.x * (unitWidth + gap);
		const y = padding + cell.y * (unitHeight + gap);
		const width = unitWidth * cell.w + gap * (cell.w - 1);
		const height = unitHeight * cell.h + gap * (cell.h - 1);

		context.save();
		roundedRect(context, x, y, width, height, corner);
		context.clip();
		drawImageFit(context, photo.image, x, y, width, height, options.fit);
		context.restore();
	}
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
				return;
			}

			reject(new Error('Could not create the collage image.'));
		}, 'image/png');
	});
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

function drawImageFit(
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	x: number,
	y: number,
	width: number,
	height: number,
	fit: ImageFit,
): void {
	const scale =
		fit === 'cover'
			? Math.max(width / image.naturalWidth, height / image.naturalHeight)
			: Math.min(width / image.naturalWidth, height / image.naturalHeight);
	const drawWidth = image.naturalWidth * scale;
	const drawHeight = image.naturalHeight * scale;
	const drawX = x + (width - drawWidth) / 2;
	const drawY = y + (height - drawHeight) / 2;

	context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}
