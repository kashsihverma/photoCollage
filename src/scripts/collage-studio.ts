import { canvasToBlob, drawCollage } from '../lib/collage/canvas';
import { type CollageTemplate, type ImageFit, type RatioId, getTemplate, ratios, smartTemplateForCount, templateImages, templates } from '../lib/collage/templates';

interface UploadedPhoto {
	id: string;
	image: HTMLImageElement;
	name: string;
	url: string;
}

interface StudioState {
	autoApplyTemplate: boolean;
	background: string;
	corner: number;
	dragIndex: number | null;
	exportUrl: string | null;
	fit: ImageFit;
	finished: boolean;
	photos: UploadedPhoto[];
	ratio: RatioId;
	spacing: number;
	templateId: string;
}

const MAX_PHOTOS = 30;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const DEFAULT_STATE = {
	autoApplyTemplate: true,
	background: '#ffffff',
	corner: 10,
	fit: 'cover' as const,
	ratio: '1:1' as const,
	spacing: 12,
	templateId: 'custom-default',
};

const state: StudioState = {
	...DEFAULT_STATE,
	dragIndex: null,
	exportUrl: null,
	finished: false,
	photos: [],
};

const el = {
	activeSizeLabel: byId<HTMLSpanElement>('active-size-label'),
	activeTemplateLabel: byId<HTMLSpanElement>('active-template-label'),
	addMore: byId<HTMLButtonElement>('add-more'),
	bgColor: byId<HTMLInputElement>('bg-color'),
	canvas: byId<HTMLCanvasElement>('export-canvas'),
	clearPhotos: byId<HTMLButtonElement>('clear-photos'),
	corner: byId<HTMLInputElement>('corner-control'),
	cornerValue: byId<HTMLSpanElement>('corner-value'),
	downloadLink: byId<HTMLAnchorElement>('download-link'),
	downloadPanel: byId<HTMLDivElement>('download-panel'),
	dropZone: byId<HTMLLabelElement>('drop-zone'),
	exportEmpty: byId<HTMLParagraphElement>('export-empty'),
	finish: byId<HTMLButtonElement>('finish-collage'),
	input: byId<HTMLInputElement>('photo-input'),
	photoCount: byId<HTMLParagraphElement>('photo-count'),
	photoTray: byId<HTMLDivElement>('photo-tray'),
	preview: byId<HTMLDivElement>('collage-preview'),
	ratioReadout: byId<HTMLSpanElement>('ratio-readout'),
	shuffle: byId<HTMLButtonElement>('shuffle-photos'),
	smartTemplate: byId<HTMLButtonElement>('smart-template'),
	spacing: byId<HTMLInputElement>('spacing-control'),
	spacingValue: byId<HTMLSpanElement>('spacing-value'),
	statusLine: byId<HTMLParagraphElement>('status-line'),
	templateList: byId<HTMLDivElement>('template-list'),
};

function byId<T extends HTMLElement>(id: string): T {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Missing required element: #${id}`);
	}

	return element as T;
}

function getActiveTemplate(): CollageTemplate {
	return getTemplate(state.templateId);
}

function getActiveSlotCount(template = getActiveTemplate()): number {
	return Math.max(1, state.photos.length || template.sampleCount || 4);
}

function getActiveLayout(count = getActiveSlotCount()) {
	return getActiveTemplate().build(count);
}

function setStatus(message: string): void {
	el.statusLine.textContent = message;
}

function markDirty(message?: string): void {
	state.finished = false;
	revokeExportUrl();
	el.downloadPanel.classList.add('hidden');
	el.exportEmpty.classList.remove('hidden');
	if (message) setStatus(message);
}

function revokeExportUrl(): void {
	if (!state.exportUrl) return;
	URL.revokeObjectURL(state.exportUrl);
	state.exportUrl = null;
	el.downloadLink.href = '#';
}

function fileToPhoto(file: File): UploadedPhoto {
	const url = URL.createObjectURL(file);
	const image = new Image();
	image.decoding = 'async';
	image.src = url;

	return {
		id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
		image,
		name: file.name,
		url,
	};
}

function addFiles(files: Iterable<File> | ArrayLike<File> | null | undefined): void {
	const incoming = Array.from(files ?? []);
	const accepted = incoming.filter((file) => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE);
	const remainingSlots = Math.max(0, MAX_PHOTOS - state.photos.length);
	const nextPhotos = accepted.slice(0, remainingSlots);

	if (!nextPhotos.length) {
		setStatus(
			incoming.length
				? `No images added. Use image files under ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`
				: 'Choose one or more images to begin.',
		);
		return;
	}

	state.photos.push(...nextPhotos.map(fileToPhoto));
	if (state.autoApplyTemplate) {
		applyTemplateDefaults(smartTemplateForCount(state.photos.length));
	}

	const rejectedCount = incoming.length - nextPhotos.length;
	markDirty(
		rejectedCount > 0
			? `${nextPhotos.length} photos added. ${rejectedCount} skipped because of type, size, or the ${MAX_PHOTOS} photo limit.`
			: `${state.photos.length} photos loaded.`,
	);
	renderAll();
}

function applyTemplateDefaults(template: CollageTemplate): void {
	state.templateId = template.id;
	state.ratio = template.ratio;
	state.spacing = template.spacing ?? DEFAULT_STATE.spacing;
	state.corner = template.corner ?? DEFAULT_STATE.corner;
	state.background = template.background ?? DEFAULT_STATE.background;
}

function renderAll(): void {
	renderTemplates();
	renderTray();
	renderPreview();
	renderControls();
}

function renderTemplates(): void {
	el.templateList.innerHTML = '';

	for (const template of templates) {
		const layout = template.build(Math.max(1, template.sampleCount || state.photos.length || 4));
		const button = document.createElement('button');
		button.className = 'pc-template';
		button.type = 'button';
		button.setAttribute('aria-pressed', String(template.id === state.templateId));
		button.dataset.template = template.id;

		const mini = document.createElement('span');
		mini.className = 'pc-mini-layout mb-2';
		mini.style.gridTemplateColumns = `repeat(${layout.columns}, minmax(0, 1fr))`;
		mini.style.gridTemplateRows = `repeat(${layout.rows}, minmax(0, 1fr))`;

		layout.cells.forEach((cell, index) => {
			const miniCell = document.createElement('span');
			miniCell.className = 'pc-mini-cell';
			miniCell.style.gridColumn = `${cell.x + 1} / span ${cell.w}`;
			miniCell.style.gridRow = `${cell.y + 1} / span ${cell.h}`;
			miniCell.style.backgroundImage = `linear-gradient(135deg, #00000010, #00000000), url("${templateImages[index % templateImages.length]}")`;
			mini.append(miniCell);
		});

		const name = document.createElement('span');
		name.className = 'block text-sm font-medium';
		name.textContent = template.name;

		const label = document.createElement('span');
		label.className = 'mt-0.5 block text-xs opacity-70';
		label.textContent = template.label;

		const hover = document.createElement('span');
		hover.className = 'pc-template-hover';
		hover.textContent = 'Enter image here';

		button.append(mini, name, label, hover);
		button.addEventListener('click', () => {
			applyTemplateDefaults(template);
			state.autoApplyTemplate = false;
			markDirty(`${template.name} selected.`);
			renderAll();
		});
		el.templateList.append(button);
	}
}

function renderTray(): void {
	el.photoTray.innerHTML = '';
	const count = state.photos.length;
	el.photoCount.textContent = `${count} ${count === 1 ? 'photo' : 'photos'}`;
	el.finish.disabled = count === 0;

	if (!count) {
		const empty = document.createElement('div');
		empty.className = 'col-span-4 rounded-vercel border border-hairline bg-canvas-soft p-4 text-sm text-mute';
		empty.textContent = 'No photos yet.';
		el.photoTray.append(empty);
		return;
	}

	state.photos.forEach((photo, index) => {
		const thumb = document.createElement('button');
		thumb.className = 'pc-thumb';
		thumb.type = 'button';
		thumb.draggable = true;
		thumb.dataset.index = String(index);
		thumb.title = 'Drag to reorder';
		thumb.setAttribute('aria-label', `Photo ${index + 1}: ${photo.name}. Drag to reorder.`);

		const image = document.createElement('img');
		image.src = photo.url;
		image.alt = '';
		thumb.append(image);
		wirePhotoDrag(thumb, index);
		el.photoTray.append(thumb);
	});
}

function renderPreview(): void {
	const layout = getActiveLayout();
	const ratio = ratios[state.ratio];
	el.preview.innerHTML = '';
	el.preview.style.aspectRatio = ratio.css;
	el.preview.style.gridTemplateColumns = `repeat(${layout.columns}, minmax(0, 1fr))`;
	el.preview.style.gridTemplateRows = `repeat(${layout.rows}, minmax(0, 1fr))`;
	el.preview.style.gap = `${state.spacing}px`;
	el.preview.style.padding = `${state.spacing}px`;
	el.preview.style.borderRadius = `${state.corner + state.spacing}px`;
	el.preview.style.background = state.background;

	layout.cells.forEach((cell, index) => {
		const wrapper = document.createElement('div');
		wrapper.className = 'pc-cell';
		wrapper.style.gridColumn = `${cell.x + 1} / span ${cell.w}`;
		wrapper.style.gridRow = `${cell.y + 1} / span ${cell.h}`;
		wrapper.style.borderRadius = `${state.corner}px`;

		const photo = state.photos[index];
		if (photo) {
			const image = document.createElement('img');
			image.src = photo.url;
			image.alt = '';
			image.style.objectFit = state.fit;
			wrapper.append(image);
		} else {
			const placeholder = document.createElement('div');
			placeholder.className =
				'flex h-full w-full flex-col items-center justify-center gap-1 text-center text-mute';

			const plus = document.createElement('span');
			plus.className = 'text-2xl leading-none';
			plus.textContent = '+';

			const prompt = document.createElement('span');
			prompt.className = 'hidden px-2 text-xs font-medium sm:inline';
			prompt.textContent = 'Enter image here';

			placeholder.append(plus, prompt);
			wrapper.append(placeholder);
		}

		const drop = document.createElement('button');
		drop.type = 'button';
		drop.draggable = Boolean(photo);
		drop.setAttribute('aria-label', photo ? `Collage cell ${index + 1}. Drag to reorder.` : `Add a photo to collage cell ${index + 1}.`);
		drop.addEventListener('click', () => {
			if (!photo) el.input.click();
		});
		wirePhotoDrag(drop, index);
		wrapper.append(drop);
		el.preview.append(wrapper);
	});
}

function renderControls(): void {
	const template = getActiveTemplate();
	el.activeTemplateLabel.textContent = template.name;
	el.activeSizeLabel.textContent = state.ratio;
	el.ratioReadout.textContent = state.ratio;
	el.spacingValue.textContent = `${state.spacing} px`;
	el.cornerValue.textContent = `${state.corner} px`;
	el.spacing.value = String(state.spacing);
	el.corner.value = String(state.corner);
	el.bgColor.value = state.background;

	document.querySelectorAll<HTMLButtonElement>('[data-ratio]').forEach((button) => {
		button.setAttribute('aria-pressed', String(button.dataset.ratio === state.ratio));
	});
	document.querySelectorAll<HTMLButtonElement>('[data-fit]').forEach((button) => {
		button.setAttribute('aria-pressed', String(button.dataset.fit === state.fit));
	});
}

function wirePhotoDrag(element: HTMLElement, index: number): void {
	element.addEventListener('dragstart', (event) => {
		state.dragIndex = index;
		event.dataTransfer?.setData('text/plain', String(index));
	});
	element.addEventListener('dragend', () => {
		state.dragIndex = null;
	});
	element.addEventListener('dragover', (event) => event.preventDefault());
	element.addEventListener('drop', (event) => {
		event.preventDefault();
		if (event.dataTransfer?.files.length) {
			addFiles(event.dataTransfer.files);
			return;
		}

		swapPhotos(getDragIndex(event), index);
	});
}

function getDragIndex(event: DragEvent): number | null {
	const raw = event.dataTransfer?.getData('text/plain');
	if (!raw) return state.dragIndex;

	const parsed = Number(raw);
	if (Number.isInteger(parsed)) return parsed;
	return state.dragIndex;
}

function swapPhotos(from: number | null, to: number): void {
	if (!Number.isInteger(from) || from === null || from === to || !state.photos[from] || !state.photos[to]) {
		return;
	}

	[state.photos[from], state.photos[to]] = [state.photos[to], state.photos[from]];
	markDirty('Photo order updated.');
	renderAll();
}

function shufflePhotos(): void {
	for (let index = state.photos.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[state.photos[index], state.photos[swapIndex]] = [state.photos[swapIndex], state.photos[index]];
	}

	markDirty(state.photos.length ? 'Photos shuffled.' : 'Add photos before shuffling.');
	renderAll();
}

function clearPhotos(): void {
	for (const photo of state.photos) {
		URL.revokeObjectURL(photo.url);
	}

	state.photos = [];
	state.autoApplyTemplate = DEFAULT_STATE.autoApplyTemplate;
	state.templateId = DEFAULT_STATE.templateId;
	state.ratio = DEFAULT_STATE.ratio;
	state.spacing = DEFAULT_STATE.spacing;
	state.corner = DEFAULT_STATE.corner;
	state.background = DEFAULT_STATE.background;
	state.fit = DEFAULT_STATE.fit;
	state.dragIndex = null;
	markDirty('Waiting for photos.');
	renderAll();
}

async function finishCollage(): Promise<void> {
	if (!state.photos.length) return;

	el.finish.disabled = true;
	setStatus('Rendering collage...');

	try {
		await drawCollage(el.canvas, getActiveLayout(state.photos.length), state.photos, {
			background: state.background,
			corner: state.corner,
			fit: state.fit,
			ratio: ratios[state.ratio],
			spacing: state.spacing,
		});
		const blob = await canvasToBlob(el.canvas);
		revokeExportUrl();
		state.exportUrl = URL.createObjectURL(blob);
		el.downloadLink.href = state.exportUrl;
		el.downloadLink.download = `photo-collage-${state.ratio.replace(':', 'x')}.png`;
		state.finished = true;
		el.downloadPanel.classList.remove('hidden');
		el.exportEmpty.classList.add('hidden');
		setStatus('Finished. Download is ready.');
	} catch (error) {
		setStatus(error instanceof Error ? error.message : 'Could not render the collage.');
	} finally {
		el.finish.disabled = state.photos.length === 0;
	}
}

function setupEvents(): void {
	el.input.addEventListener('change', () => {
		addFiles(el.input.files);
		el.input.value = '';
	});

	el.addMore.addEventListener('click', () => el.input.click());
	el.clearPhotos.addEventListener('click', clearPhotos);
	el.smartTemplate.addEventListener('click', () => {
		const template = smartTemplateForCount(state.photos.length);
		applyTemplateDefaults(template);
		state.autoApplyTemplate = true;
		markDirty(`${template.name} selected.`);
		renderAll();
	});
	el.shuffle.addEventListener('click', shufflePhotos);
	el.finish.addEventListener('click', () => void finishCollage());

	el.dropZone.addEventListener('dragover', (event) => {
		event.preventDefault();
		el.dropZone.classList.add('border-ink', 'bg-canvas');
	});
	el.dropZone.addEventListener('dragleave', () => {
		el.dropZone.classList.remove('border-ink', 'bg-canvas');
	});
	el.dropZone.addEventListener('drop', (event) => {
		event.preventDefault();
		el.dropZone.classList.remove('border-ink', 'bg-canvas');
		addFiles(event.dataTransfer?.files);
	});

	document.querySelectorAll<HTMLButtonElement>('[data-ratio]').forEach((button) => {
		button.addEventListener('click', () => {
			if (isRatio(button.dataset.ratio)) {
				state.ratio = button.dataset.ratio;
				state.autoApplyTemplate = false;
				markDirty(`${state.ratio} selected.`);
				renderAll();
			}
		});
	});

	document.querySelectorAll<HTMLButtonElement>('[data-fit]').forEach((button) => {
		button.addEventListener('click', () => {
			if (button.dataset.fit === 'cover' || button.dataset.fit === 'contain') {
				state.fit = button.dataset.fit;
				state.autoApplyTemplate = false;
				markDirty(`${state.fit} fit selected.`);
				renderAll();
			}
		});
	});

	document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) => {
		button.addEventListener('click', () => {
			state.background = button.dataset.color || DEFAULT_STATE.background;
			state.autoApplyTemplate = false;
			markDirty('Background color updated.');
			renderAll();
		});
	});

	el.spacing.addEventListener('input', () => {
		state.spacing = Number(el.spacing.value);
		state.autoApplyTemplate = false;
		markDirty('Spacing updated.');
		renderAll();
	});

	el.corner.addEventListener('input', () => {
		state.corner = Number(el.corner.value);
		state.autoApplyTemplate = false;
		markDirty('Corner radius updated.');
		renderAll();
	});

	el.bgColor.addEventListener('input', () => {
		state.background = el.bgColor.value;
		state.autoApplyTemplate = false;
		markDirty('Background color updated.');
		renderAll();
	});

	document.addEventListener('paste', (event) => {
		const files = Array.from(event.clipboardData?.items ?? [])
			.filter((item) => item.kind === 'file')
			.map((item) => item.getAsFile())
			.filter(isFile);

		if (!files.length) return;
		event.preventDefault();
		addFiles(files);
	});

	window.addEventListener('beforeunload', () => {
		revokeExportUrl();
		for (const photo of state.photos) {
			URL.revokeObjectURL(photo.url);
		}
	});
}

function isRatio(value: string | undefined): value is RatioId {
	return Boolean(value && value in ratios);
}

function isFile(file: File | null): file is File {
	return file instanceof File;
}

setupEvents();
renderAll();
