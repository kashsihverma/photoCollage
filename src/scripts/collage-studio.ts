import {
	type BaseLayer,
	canvasToBlob,
	type DesignLayer,
	type DrawablePhoto,
	type PhotoLayer,
	type StickerLayer,
	type TextLayer,
	renderDesignToCanvas,
} from '../lib/collage/canvas';
import {
	backgrounds,
	categories,
	elementPresets,
	type ExportFormat,
	type FrameStyle,
	type PhotoFilter,
	getBackground,
	getSize,
	getTemplate,
	sizePresets,
	type SizeId,
	smartTemplateForCount,
	type TemplateCategory,
	templateImages,
	templates,
	textPresets,
} from '../lib/collage/templates';

interface UploadedPhoto extends DrawablePhoto {
	name: string;
	url: string;
}

interface Snapshot {
	backgroundId: string;
	backgroundPhotoId: string | null;
	backgroundTone: number;
	format: ExportFormat;
	layers: DesignLayer[];
	sizeId: SizeId;
	templateId: string;
}

interface PointerSession {
	id: string;
	mode: 'move' | 'resize';
	startLayer: DesignLayer;
	startX: number;
	startY: number;
	surfaceRect: DOMRect;
}

interface StudioState extends Snapshot {
	activeCategory: TemplateCategory | 'All';
	activePanel: 'templates' | 'uploads' | 'text' | 'elements' | 'backgrounds' | 'layers';
	assetSearch: string;
	exportUrl: string | null;
	future: Snapshot[];
	history: Snapshot[];
	photos: UploadedPhoto[];
	pointer: PointerSession | null;
	selectedId: string | null;
	snap: boolean;
}

interface AddFileOptions {
	assignToSlots?: boolean;
	useFirstAsBackground?: boolean;
}

type ShareTarget = 'copy' | 'download' | 'instagram' | 'native' | 'snapchat' | 'whatsapp';

const MAX_PHOTOS = 40;
const MAX_FILE_SIZE = 18 * 1024 * 1024;
const HISTORY_LIMIT = 50;
const STORAGE_KEY = 'photo-collage-premium-design';
const THEME_STORAGE_KEY = 'photo-collage-theme';
const AUTOSAVE_DELAY = 900;

const initialTemplate = templates[0];
let activeLiveEditKey: string | null = null;
let autosaveTimer = 0;
let canvasResizeAnimationFrame = 0;
let pointerAnimationFrame = 0;

const layerActionIcons = {
	copy:
		'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" /></svg>',
	trash:
		'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>',
} as const;

const state: StudioState = {
	activeCategory: 'All',
	activePanel: 'templates',
	assetSearch: '',
	backgroundId: initialTemplate.backgroundId,
	backgroundPhotoId: null,
	backgroundTone: 50,
	exportUrl: null,
	format: 'png',
	future: [],
	history: [],
	layers: [],
	photos: [],
	pointer: null,
	selectedId: null,
	sizeId: initialTemplate.size,
	snap: true,
	templateId: initialTemplate.id,
};

const el = {
	activeSizeLabel: byId<HTMLSpanElement>('active-size-label'),
	activeTemplateLabel: byId<HTMLSpanElement>('active-template-label'),
	addBackgroundPhoto: byId<HTMLButtonElement>('add-background-photo'),
	addText: byId<HTMLButtonElement>('add-text'),
	assetSearch: byId<HTMLInputElement>('asset-search'),
	backgroundList: byId<HTMLDivElement>('background-list'),
	backgroundPhotoInput: byId<HTMLInputElement>('background-photo-input'),
	backgroundPhotoList: byId<HTMLDivElement>('background-photo-list'),
	backgroundTone: byId<HTMLInputElement>('background-tone-control'),
	backgroundToneValue: byId<HTMLSpanElement>('background-tone-value'),
	canvas: byId<HTMLCanvasElement>('export-canvas'),
	categoryList: byId<HTMLDivElement>('category-list'),
	clearPhotos: byId<HTMLButtonElement>('clear-photos'),
	clearBackgroundPhoto: byId<HTMLButtonElement>('clear-background-photo'),
	deleteLayer: byId<HTMLButtonElement>('delete-layer'),
	downloadLink: byId<HTMLAnchorElement>('download-link'),
	downloadPanel: byId<HTMLDivElement>('download-panel'),
	dropZone: byId<HTMLLabelElement>('drop-zone'),
	duplicateLayer: byId<HTMLButtonElement>('duplicate-layer'),
	elementList: byId<HTMLDivElement>('element-list'),
	exportEmpty: byId<HTMLParagraphElement>('export-empty'),
	finish: byId<HTMLButtonElement>('finish-collage'),
	formatSelect: byId<HTMLSelectElement>('format-select'),
	guideX: byId<HTMLDivElement>('snap-guide-x'),
	guideY: byId<HTMLDivElement>('snap-guide-y'),
	input: byId<HTMLInputElement>('photo-input'),
	inspector: byId<HTMLDivElement>('inspector-panel'),
	layerList: byId<HTMLDivElement>('layer-list'),
	photoCount: byId<HTMLParagraphElement>('photo-count'),
	photoTray: byId<HTMLDivElement>('photo-tray'),
	preview: byId<HTMLDivElement>('collage-preview'),
	quickRemix: byId<HTMLButtonElement>('quick-remix'),
	quickTemplate: byId<HTMLButtonElement>('quick-template'),
	quickUpload: byId<HTMLButtonElement>('quick-upload'),
	redo: byId<HTMLButtonElement>('redo-action'),
	save: byId<HTMLButtonElement>('save-design'),
	share: byId<HTMLButtonElement>('share-collage'),
	shareClose: byId<HTMLButtonElement>('share-close'),
	sharePanel: byId<HTMLDivElement>('share-panel'),
	sizeSelect: byId<HTMLSelectElement>('size-select'),
	smartBalanced: byId<HTMLButtonElement>('smart-balanced'),
	smartMoodboard: byId<HTMLButtonElement>('smart-moodboard'),
	smartStory: byId<HTMLButtonElement>('smart-story'),
	stage: byId<HTMLDivElement>('editor-stage'),
	statusLine: byId<HTMLParagraphElement>('status-line'),
	templateList: byId<HTMLDivElement>('template-list'),
	textPresetList: byId<HTMLDivElement>('text-preset-list'),
	themeToggle: byId<HTMLButtonElement>('theme-toggle'),
	undo: byId<HTMLButtonElement>('undo-action'),
};

const downloadButtonIdleHtml = el.finish.innerHTML;
const shareButtonIdleHtml = el.share.innerHTML;

function byId<T extends HTMLElement>(id: string): T {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Missing required element: #${id}`);
	}

	return element as T;
}

function createId(prefix: string): string {
	return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
}

function cloneLayers(layers: DesignLayer[]): DesignLayer[] {
	return structuredClone(layers) as DesignLayer[];
}

function snapshot(): Snapshot {
	return {
		backgroundId: state.backgroundId,
		backgroundPhotoId: state.backgroundPhotoId,
		backgroundTone: state.backgroundTone,
		format: state.format,
		layers: cloneLayers(state.layers),
		sizeId: state.sizeId,
		templateId: state.templateId,
	};
}

function commitHistory(): void {
	state.history.push(snapshot());
	if (state.history.length > HISTORY_LIMIT) state.history.shift();
	state.future = [];
	renderToolbarState();
}

function beginLiveEdit(key: string): void {
	if (activeLiveEditKey === key) return;
	activeLiveEditKey = key;
	commitHistory();
}

function endLiveEdit(key: string): void {
	if (activeLiveEditKey === key) activeLiveEditKey = null;
}

function restoreSnapshot(next: Snapshot): void {
	state.backgroundId = next.backgroundId;
	state.backgroundPhotoId = next.backgroundPhotoId ?? null;
	if (state.backgroundPhotoId && !state.photos.some((photo) => photo.id === state.backgroundPhotoId)) {
		state.backgroundPhotoId = null;
	}
	state.backgroundTone = next.backgroundTone ?? 50;
	state.format = next.format;
	state.layers = cloneLayers(next.layers);
	state.sizeId = next.sizeId;
	state.templateId = next.templateId;
	state.selectedId = null;
	markDirty();
	renderAll();
}

function setStatus(message: string): void {
	el.statusLine.textContent = message;
}

function markDirty(message?: string): void {
	revokeExportUrl();
	el.downloadPanel.classList.add('hidden');
	el.exportEmpty.classList.remove('sr-only');
	if (message) setStatus(message);
	scheduleAutosave();
}

function revokeExportUrl(): void {
	if (!state.exportUrl) return;
	URL.revokeObjectURL(state.exportUrl);
	state.exportUrl = null;
	el.downloadLink.href = '#';
}

function scheduleAutosave(): void {
	if (autosaveTimer) window.clearTimeout(autosaveTimer);
	autosaveTimer = window.setTimeout(() => {
		autosaveTimer = 0;
		persistDesign();
	}, AUTOSAVE_DELAY);
}

function wait(milliseconds: number): Promise<void> {
	return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

type ThemeMode = 'light' | 'dark';

function currentTheme(): ThemeMode {
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: ThemeMode, persist = true): void {
	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
	document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#fafafa');

	if (persist) {
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		} catch {
			setStatus('Theme changed for this session.');
		}
	}

	renderThemeToggle(theme);
}

function renderThemeToggle(theme = currentTheme()): void {
	const nextTheme = theme === 'dark' ? 'light' : 'dark';
	const label = nextTheme === 'dark' ? 'Dark' : 'Light';
	el.themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
	el.themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
	el.themeToggle.querySelector('.pc-theme-label')?.replaceChildren(label);
}

function setupTheme(): void {
	let savedTheme: string | null = null;
	try {
		savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	} catch {
		savedTheme = null;
	}

	applyTheme(savedTheme === 'dark' ? 'dark' : 'light', false);
	el.themeToggle.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
}

function setDownloadButtonBusy(isBusy: boolean): void {
	el.finish.disabled = isBusy;
	el.share.disabled = isBusy;
	el.finish.classList.toggle('is-loading', isBusy);

	if (isBusy) {
		el.finish.setAttribute('aria-busy', 'true');
		el.finish.innerHTML = '<span class="pc-button-spinner" aria-hidden="true"></span><span>Downloading...</span>';
		return;
	}

	el.finish.removeAttribute('aria-busy');
	el.finish.innerHTML = downloadButtonIdleHtml;
}

function setShareButtonBusy(isBusy: boolean): void {
	el.share.disabled = isBusy;
	el.finish.disabled = isBusy;
	el.share.classList.toggle('is-loading', isBusy);
	el.sharePanel.querySelectorAll<HTMLButtonElement>('.pc-share-option').forEach((button) => {
		button.disabled = isBusy;
	});

	if (isBusy) {
		el.share.setAttribute('aria-busy', 'true');
		el.share.innerHTML = '<span class="pc-button-spinner" aria-hidden="true"></span><span>Sharing...</span>';
		return;
	}

	el.share.removeAttribute('aria-busy');
	el.share.innerHTML = shareButtonIdleHtml;
}

function getSelectedLayer(): DesignLayer | null {
	return state.layers.find((layer) => layer.id === state.selectedId) ?? null;
}

function searchMatches(...values: Array<string | number | null | undefined>): boolean {
	const query = state.assetSearch.trim().toLowerCase();
	if (!query) return true;
	return values.some((value) => String(value ?? '').toLowerCase().includes(query));
}

function layerName(layer: DesignLayer, index = state.layers.indexOf(layer)): string {
	if (layer.kind === 'photo') return `Photo ${index + 1}`;
	if (layer.kind === 'text') return layer.text.trim() || `Text ${index + 1}`;
	return layer.content.trim() || `Sticker ${index + 1}`;
}

function layerDetail(layer: DesignLayer): string {
	if (layer.kind === 'photo') return `${layer.frame} frame`;
	if (layer.kind === 'text') return 'Text box';
	return 'Sticker';
}

function getBackgroundPhoto(): UploadedPhoto | null {
	if (!state.backgroundPhotoId) return null;
	return state.photos.find((photo) => photo.id === state.backgroundPhotoId) ?? null;
}

function layersFromTemplate(templateId: string): DesignLayer[] {
	const template = getTemplate(templateId);
	const photoLayers: PhotoLayer[] = template.slots.map((slot, index) => ({
		cropX: slot.cropX ?? 50,
		cropY: slot.cropY ?? 50,
		fit: slot.fit ?? 'cover',
		filter: slot.filter ?? 'none',
		frame: slot.frame ?? 'paper',
		h: slot.h,
		id: createId('photo'),
		kind: 'photo',
		photoId: state.photos[index]?.id ?? null,
		radius: slot.radius ?? 3,
		rotation: slot.rotation ?? 0,
		scale: slot.scale ?? 1,
		w: slot.w,
		x: slot.x,
		y: slot.y,
	}));

	const textLayers: TextLayer[] = template.texts.map((item) => ({
		align: item.align ?? 'center',
		bold: Boolean(item.bold),
		color: item.color,
		fontFamily: item.fontFamily,
		fontSize: item.fontSize,
		h: item.h,
		id: createId('text'),
		italic: Boolean(item.italic),
		kind: 'text',
		rotation: item.rotation ?? 0,
		text: item.text,
		w: item.w,
		x: item.x,
		y: item.y,
	}));

	const stickerLayers: StickerLayer[] = template.stickers.map((item) => ({
		background: item.background ?? 'transparent',
		color: item.color ?? '#171717',
		content: item.content,
		h: item.h,
		id: createId('sticker'),
		kind: 'sticker',
		opacity: item.opacity ?? 1,
		rotation: item.rotation ?? 0,
		w: item.w,
		x: item.x,
		y: item.y,
	}));

	return [...photoLayers, ...textLayers, ...stickerLayers];
}

function applyTemplate(templateId: string, withHistory = true): void {
	const template = getTemplate(templateId);
	if (withHistory) commitHistory();
	state.templateId = template.id;
	state.sizeId = template.size;
	state.backgroundId = template.backgroundId;
	state.backgroundPhotoId = null;
	state.backgroundTone = 50;
	state.layers = layersFromTemplate(template.id);
	state.selectedId = null;
	markDirty(`${template.name} loaded.`);
	renderAll();
}

function addFiles(files: Iterable<File> | ArrayLike<File> | null | undefined, options: AddFileOptions = {}): void {
	const incoming = Array.from(files ?? []);
	const accepted = incoming.filter((file) => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE);
	const remainingSlots = Math.max(0, MAX_PHOTOS - state.photos.length);
	const nextPhotos = accepted.slice(0, remainingSlots);
	const hadPhotos = state.photos.length > 0;

	if (!nextPhotos.length) {
		setStatus(
			incoming.length
				? `Use image files under ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`
				: 'Choose one or more photos.',
		);
		return;
	}

	const addedPhotos = nextPhotos.map(fileToPhoto);
	state.photos.push(...addedPhotos);

	if (options.assignToSlots ?? true) {
		assignPhotosToEmptySlots();
	}

	if (options.useFirstAsBackground && addedPhotos[0]) {
		commitHistory();
		state.backgroundPhotoId = addedPhotos[0].id;
	}

	const rejectedCount = incoming.length - nextPhotos.length;
	if (!options.useFirstAsBackground && !hadPhotos && state.photos.length >= 2) {
		applySmartLayout('balanced', false);
		setStatus(
			rejectedCount > 0
				? `Smart layout generated with ${nextPhotos.length} photos. ${rejectedCount} skipped.`
				: `Smart layout generated with ${nextPhotos.length} photos.`,
		);
		return;
	}

	markDirty(
		options.useFirstAsBackground
			? rejectedCount > 0
				? `Background photo added. ${rejectedCount} skipped.`
				: 'Background photo added.'
			: rejectedCount > 0
			? `${nextPhotos.length} photos added. ${rejectedCount} skipped.`
			: `${nextPhotos.length} photos added.`,
	);
	renderAll();
}

type SmartLayoutMode = 'balanced' | 'story' | 'moodboard';

function applySmartLayout(mode: SmartLayoutMode, withHistory = true): void {
	const nextTemplate = smartLayoutTemplate(mode);
	applyTemplate(nextTemplate.id, withHistory);
	assignPhotosToEmptySlots();
	state.activePanel = 'uploads';
	markDirty(`${nextTemplate.name} generated.`);
	renderAll();
}

function smartLayoutTemplate(mode: SmartLayoutMode): ReturnType<typeof getTemplate> {
	const count = state.photos.length;
	if (mode === 'story') {
		if (count >= 5) return getTemplate('story-year-recap-gallery');
		if (count >= 4) return getTemplate('story-scrapbook-zine');
		return getTemplate('story-clean-recap');
	}

	if (mode === 'moodboard') {
		if (count >= 5) return getTemplate('post-moodboard-studio');
		if (count >= 4) return getTemplate('post-photo-dump');
		return getTemplate('aesthetic-zine');
	}

	if (count >= 5) return getTemplate('post-photo-dump');
	if (count === 4) return getTemplate('family-soft-grid');
	if (count === 3) return getTemplate('post-editorial-cover');
	return getTemplate('story-clean-recap');
}

function remixSmartLayout(): void {
	if (state.photos.length < 2) {
		state.activePanel = 'uploads';
		setStatus('Upload at least two photos, then Remix will generate a fresh layout.');
		renderAll();
		el.input.click();
		return;
	}

	const candidates = smartRemixCandidates();
	const currentIndex = candidates.findIndex((template) => template.id === state.templateId);
	const nextTemplate = candidates[(currentIndex + 1 + candidates.length) % candidates.length] ?? candidates[0];
	applyTemplate(nextTemplate.id);
	assignPhotosToEmptySlots();
	state.activePanel = 'uploads';
	markDirty(`${nextTemplate.name} remix generated.`);
	renderAll();
}

function smartRemixCandidates(): ReturnType<typeof getTemplate>[] {
	const count = state.photos.length;
	const ids =
		count >= 5
			? ['post-photo-dump', 'story-year-recap-gallery', 'post-moodboard-studio', 'story-scrapbook-zine']
			: count === 4
			? ['family-soft-grid', 'post-clean-commerce-grid', 'story-scrapbook-zine', 'post-photo-dump']
			: count === 3
			? ['post-editorial-cover', 'friends-camera-play', 'aesthetic-zine', 'story-clean-recap']
			: ['story-clean-recap', 'love-polaroid-stack', 'post-minimal-quote'];

	return ids.map((id) => getTemplate(id));
}

function fileToPhoto(file: File): UploadedPhoto {
	const url = URL.createObjectURL(file);
	const image = new Image();
	image.decoding = 'async';
	image.src = url;

	return {
		id: createId('upload'),
		image,
		name: file.name,
		url,
	};
}

function assignPhotosToEmptySlots(): void {
	const slots = state.layers.filter((layer): layer is PhotoLayer => layer.kind === 'photo');
	const used = new Set(slots.map((slot) => slot.photoId).filter(Boolean));
	const available = state.photos.filter((photo) => !used.has(photo.id));

	for (const slot of slots) {
		if (slot.photoId) continue;
		const next = available.shift();
		if (!next) break;
		slot.photoId = next.id;
	}
}

function assignPhotoToLayer(photoId: string, layerId = state.selectedId): void {
	const target =
		(layerId && state.layers.find((layer): layer is PhotoLayer => layer.id === layerId && layer.kind === 'photo')) ??
		state.layers.find((layer): layer is PhotoLayer => layer.kind === 'photo' && !layer.photoId) ??
		state.layers.find((layer): layer is PhotoLayer => layer.kind === 'photo');

	if (!target) return;

	commitHistory();
	target.photoId = photoId;
	target.cropX = 50;
	target.cropY = 50;
	target.scale = 1;
	state.selectedId = target.id;
	markDirty('Photo placed.');
	renderAll();
}

function clearPhotos(): void {
	if (!state.photos.length) return;
	for (const photo of state.photos) URL.revokeObjectURL(photo.url);
	commitHistory();
	state.photos = [];
	state.backgroundPhotoId = null;
	for (const layer of state.layers) {
		if (layer.kind === 'photo') layer.photoId = null;
	}
	markDirty('Uploads cleared.');
	renderAll();
}

function deletePhoto(photoId: string): void {
	const photo = state.photos.find((item) => item.id === photoId);
	if (!photo) return;

	commitHistory();
	URL.revokeObjectURL(photo.url);
	state.photos = state.photos.filter((item) => item.id !== photoId);
	if (state.backgroundPhotoId === photoId) state.backgroundPhotoId = null;
	for (const layer of state.layers) {
		if (layer.kind === 'photo' && layer.photoId === photoId) layer.photoId = null;
	}
	markDirty('Photo deleted.');
	renderAll();
}

function renderAll(): void {
	renderPanelViews();
	renderPanelSearch();
	renderSizeSelect();
	renderCategories();
	renderTemplates();
	renderUploads();
	renderTextPresets();
	renderElements();
	renderBackgrounds();
	renderLayers();
	renderCanvas();
	renderInspector();
	renderToolbarState();
}

function renderPanelViews(): void {
	document.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((button) => {
		const active = button.dataset.panel === state.activePanel;
		button.setAttribute('aria-pressed', String(active));
	});

	document.querySelectorAll<HTMLElement>('[data-panel-view]').forEach((panel) => {
		panel.classList.toggle('hidden', panel.dataset.panelView !== state.activePanel);
	});
}

function renderPanelSearch(): void {
	const labels: Record<StudioState['activePanel'], string> = {
		backgrounds: 'Search...',
		elements: 'Search...',
		layers: 'Search...',
		templates: 'Search...',
		text: 'Search...',
		uploads: 'Search...',
	};

	el.assetSearch.value = state.assetSearch;
	el.assetSearch.placeholder = labels[state.activePanel];
}

function renderSizeSelect(): void {
	el.sizeSelect.innerHTML = '';
	Object.values(sizePresets).forEach((size) => {
		const option = document.createElement('option');
		option.value = size.id;
		option.textContent = `${size.name} · ${size.label}`;
		option.selected = size.id === state.sizeId;
		el.sizeSelect.append(option);
	});
	el.formatSelect.value = state.format;
}

function renderCategories(): void {
	el.categoryList.innerHTML = '';
	const values: Array<TemplateCategory | 'All'> = ['All', ...categories];

	for (const category of values) {
		const button = document.createElement('button');
		button.className = 'pc-category-chip';
		button.type = 'button';
		button.textContent = category;
		button.setAttribute('aria-pressed', String(category === state.activeCategory));
		button.addEventListener('click', () => {
			state.activeCategory = category;
			renderCategories();
			renderTemplates();
		});
		el.categoryList.append(button);
	}
}

function renderTemplates(): void {
	el.templateList.innerHTML = '';
	const visible = templates.filter(
		(template) =>
			(state.activeCategory === 'All' || template.category === state.activeCategory) &&
			searchMatches(template.name, template.category, template.size, template.tags.join(' ')),
	);

	if (!visible.length) {
		const empty = document.createElement('div');
		empty.className = 'pc-empty-state';
		empty.textContent = 'No templates found.';
		el.templateList.append(empty);
		return;
	}

	for (const template of visible) {
		const button = document.createElement('button');
		button.className = 'pc-template-card';
		button.type = 'button';
		button.dataset.template = template.id;
		button.setAttribute('aria-pressed', String(template.id === state.templateId));

		const stage = document.createElement('span');
		const size = getSize(template.size);
		stage.className = 'pc-template-preview';
		stage.style.aspectRatio = size.css;
		stage.style.background = getBackground(template.backgroundId).css;

			template.slots.forEach((slot, index) => {
				const cell = document.createElement('span');
				cell.className = `pc-template-photo pc-frame-${slot.frame ?? 'paper'}`;
				setLayerBox(cell, slot.x, slot.y, slot.w, slot.h, slot.rotation ?? 0);
				const previewImages = template.previewImages ?? templateImages;
				cell.style.backgroundImage = `url("${previewImages[index % previewImages.length]}")`;
				cell.style.borderRadius = `${slot.radius ?? 3}%`;
				stage.append(cell);
			});

		template.texts.forEach((item) => {
			const label = document.createElement('span');
			label.className = 'pc-template-text';
			label.textContent = item.text;
			setLayerBox(label, item.x, item.y, item.w, item.h, item.rotation ?? 0);
			label.style.color = item.color;
			label.style.fontFamily = item.fontFamily;
			label.style.fontSize = `${Math.max(10, item.fontSize * 1.6)}px`;
			stage.append(label);
		});

		template.stickers.forEach((item) => {
			const decor = document.createElement('span');
			decor.className = 'pc-template-sticker';
			if (isSvgMarkup(item.content)) {
				decor.innerHTML = item.content;
			} else {
				decor.textContent = item.content;
			}
			setLayerBox(decor, item.x, item.y, item.w, item.h, item.rotation ?? 0);
			decor.style.color = item.color ?? '#171717';
			stage.append(decor);
		});

		if (template.premium) {
			const badge = document.createElement('span');
			badge.className = 'pc-crown';
			badge.textContent = '♛';
			stage.append(badge);
		}

		const meta = document.createElement('span');
		meta.className = 'pc-template-meta';
		const title = document.createElement('strong');
		title.textContent = template.name;
		const detail = document.createElement('small');
		detail.textContent = `${template.category} / ${getSize(template.size).name}`;
		meta.append(title, detail);
		button.append(stage, meta);
		button.addEventListener('click', () => applyTemplate(template.id));
		el.templateList.append(button);
	}
}

function renderUploads(): void {
	el.photoTray.innerHTML = '';
	const count = state.photos.length;
	el.photoCount.textContent = `${count} ${count === 1 ? 'photo' : 'photos'}`;
	el.clearPhotos.disabled = count === 0;
	const visible = state.photos.filter((photo) => searchMatches(photo.name));

	if (!count) {
		return;
	}

	if (!visible.length) {
		const empty = document.createElement('div');
		empty.className = 'pc-empty-state';
		empty.textContent = 'No photos match your search.';
		el.photoTray.append(empty);
		return;
	}

	for (const photo of visible) {
		const tile = document.createElement('div');
		tile.className = 'pc-upload-tile';
		tile.dataset.photoId = photo.id;

		const photoButton = document.createElement('button');
		photoButton.className = 'pc-upload-photo-button';
		photoButton.type = 'button';
		photoButton.draggable = true;
		photoButton.title = 'Drag onto a frame';
		photoButton.addEventListener('click', () => assignPhotoToLayer(photo.id));
		photoButton.addEventListener('dragstart', (event) => {
			event.dataTransfer?.setData('photo-id', photo.id);
			event.dataTransfer?.setData('text/plain', photo.id);
		});

		const image = document.createElement('img');
		image.src = photo.url;
		image.alt = '';
		photoButton.append(image);

		const deleteButton = document.createElement('button');
		deleteButton.className = 'pc-upload-delete';
		deleteButton.type = 'button';
		deleteButton.title = 'Delete photo';
		deleteButton.setAttribute('aria-label', `Delete ${photo.name}`);
		deleteButton.innerHTML =
			'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" /></svg>';
		deleteButton.addEventListener('click', () => deletePhoto(photo.id));

		tile.append(photoButton, deleteButton);
		el.photoTray.append(tile);
	}
}

function renderTextPresets(): void {
	el.textPresetList.innerHTML = '';
	const visible = textPresets.filter((preset) => searchMatches(preset.name, preset.text, preset.fontFamily, preset.color));

	if (!visible.length) {
		const empty = document.createElement('div');
		empty.className = 'pc-empty-state';
		empty.textContent = 'No text styles found.';
		el.textPresetList.append(empty);
		return;
	}

	for (const preset of visible) {
		const button = document.createElement('button');
		button.className = 'pc-text-preset';
		button.type = 'button';
		button.textContent = preset.text;
		button.style.fontFamily = preset.fontFamily;
		button.style.color = preset.color;
		button.addEventListener('click', () => addTextLayer(preset.id));
		el.textPresetList.append(button);
	}
}

function renderElements(): void {
	el.elementList.innerHTML = '';
	const visible = elementPresets.filter((preset) => searchMatches(preset.name, preset.content, preset.color));

	if (!visible.length) {
		const empty = document.createElement('div');
		empty.className = 'pc-empty-state';
		empty.textContent = 'No elements found.';
		el.elementList.append(empty);
		return;
	}

	for (const preset of visible) {
		const button = document.createElement('button');
		button.className = 'pc-element-tile';
		button.type = 'button';
		button.title = preset.name;
		button.textContent = preset.content;
		button.style.color = preset.color ?? '#171717';
		button.addEventListener('click', () => addStickerLayer(preset.id));
		el.elementList.append(button);
	}
}

function renderBackgrounds(): void {
	el.backgroundList.innerHTML = '';
	el.backgroundPhotoList.innerHTML = '';
	el.clearBackgroundPhoto.disabled = !state.backgroundPhotoId;
	renderBackgroundToneControl();

	if (!state.photos.length) {
		const empty = document.createElement('div');
		empty.className = 'pc-empty-state';
		empty.textContent = 'Upload a photo to use it as the canvas background.';
		el.backgroundPhotoList.append(empty);
	}

	const visiblePhotos = state.photos.filter((photo) => searchMatches(photo.name));
	for (const photo of visiblePhotos) {
		const button = document.createElement('button');
		button.className = 'pc-background-photo-tile';
		button.type = 'button';
		button.title = `Use ${photo.name} as background`;
		button.setAttribute('aria-pressed', String(photo.id === state.backgroundPhotoId));
		button.addEventListener('click', () => selectBackgroundPhoto(photo.id));

		const image = document.createElement('img');
		image.src = photo.url;
		image.alt = '';
		button.append(image);
		el.backgroundPhotoList.append(button);
	}

	const visibleBackgrounds = backgrounds.filter((background) =>
		searchMatches(background.name, background.id, background.base, background.pattern),
	);

	if (!visibleBackgrounds.length && !visiblePhotos.length) {
		const empty = document.createElement('div');
		empty.className = 'pc-empty-state';
		empty.textContent = 'No backgrounds found.';
		el.backgroundList.append(empty);
		return;
	}

	for (const background of visibleBackgrounds) {
		const button = document.createElement('button');
		button.className = 'pc-background-tile';
		button.type = 'button';
		button.setAttribute('aria-pressed', String(!state.backgroundPhotoId && background.id === state.backgroundId));
		button.style.background = background.css;
		button.addEventListener('click', () => {
			commitHistory();
			state.backgroundId = background.id;
			state.backgroundPhotoId = null;
			markDirty(`${background.name} background selected.`);
			renderAll();
		});

		const name = document.createElement('span');
		name.textContent = background.name;
		button.append(name);
		el.backgroundList.append(button);
	}
}

function selectBackgroundPhoto(photoId: string): void {
	if (state.backgroundPhotoId === photoId) return;
	commitHistory();
	state.backgroundPhotoId = photoId;
	markDirty('Background photo selected.');
	renderAll();
}

function clearBackgroundPhoto(): void {
	if (!state.backgroundPhotoId) return;
	commitHistory();
	state.backgroundPhotoId = null;
	markDirty('Background photo cleared.');
	renderAll();
}

function renderLayers(): void {
	el.layerList.innerHTML = '';

	const visible = state.layers
		.map((layer, index) => ({ index, layer }))
		.filter(({ index, layer }) => searchMatches(layer.kind, layerName(layer, index), layerDetail(layer)))
		.reverse();

	if (!visible.length) {
		const empty = document.createElement('div');
		empty.className = 'pc-empty-state';
		empty.textContent = state.layers.length ? 'No layers match your search.' : 'No objects on the canvas yet.';
		el.layerList.append(empty);
		return;
	}

	for (const { index, layer } of visible) {
		const row = document.createElement('div');
		row.className = 'pc-layer-row';
		row.draggable = true;
		row.dataset.layerId = layer.id;
		row.setAttribute('aria-pressed', String(layer.id === state.selectedId));
		row.addEventListener('dragstart', (event) => {
			event.dataTransfer?.setData('layer-id', layer.id);
			event.dataTransfer?.setData('text/plain', layer.id);
			event.dataTransfer?.setDragImage(row, 16, 16);
			row.classList.add('is-dragging');
		});
		row.addEventListener('dragend', () => {
			row.classList.remove('is-dragging');
			clearLayerDropIndicators();
		});
		row.addEventListener('dragover', (event) => {
			event.preventDefault();
			const draggedId = event.dataTransfer?.getData('layer-id') || event.dataTransfer?.getData('text/plain');
			const draggedRow = draggedId ? el.layerList.querySelector<HTMLElement>(`.pc-layer-row[data-layer-id="${draggedId}"]`) : null;
			const position = layerDropPosition(event, row);
			clearLayerDropIndicators(row);
			row.classList.toggle('is-drop-before', position === 'before');
			row.classList.toggle('is-drop-after', position === 'after');
			if (draggedRow && draggedRow !== row) animateLayerDomMove(draggedRow, row, position);
		});
		row.addEventListener('dragleave', () => {
			row.classList.remove('is-drop-before', 'is-drop-after');
		});
		row.addEventListener('drop', (event) => {
			event.preventDefault();
			clearLayerDropIndicators();
			commitLayerDomOrder();
		});

		const selectButton = document.createElement('button');
		selectButton.className = 'pc-layer-select';
		selectButton.type = 'button';
		selectButton.setAttribute('aria-label', `Select ${layerName(layer, index)}`);
		selectButton.addEventListener('click', () => {
			state.selectedId = layer.id;
			renderCanvas();
			renderInspector();
			renderLayers();
		});

		const badge = document.createElement('span');
		badge.className = `pc-layer-badge pc-layer-badge-${layer.kind}`;
		badge.textContent = layer.kind === 'photo' ? 'P' : layer.kind === 'text' ? 'T' : 'S';

		const label = document.createElement('span');
		label.className = 'pc-layer-row-text';
		const name = document.createElement('strong');
		name.textContent = layerName(layer, index);
		const detail = document.createElement('small');
		detail.textContent = layerDetail(layer);
		label.append(name, detail);

		selectButton.append(badge, label);

		const actions = document.createElement('span');
		actions.className = 'pc-layer-actions';
		const actionItems: Array<[string, string, () => void]> = [
			[layerActionIcons.copy, 'Duplicate layer', () => duplicateLayer(layer.id)],
			[layerActionIcons.trash, 'Delete layer', () => deleteLayer(layer.id)],
		];
		for (const [icon, title, handler] of actionItems) {
			const action = document.createElement('button');
			action.type = 'button';
			action.innerHTML = icon;
			action.title = title;
			action.setAttribute('aria-label', `${title}: ${layerName(layer, index)}`);
			action.addEventListener('click', (event) => {
				event.stopPropagation();
				handler();
			});
			action.addEventListener('dragstart', (event) => event.preventDefault());
			actions.append(action);
		}

		row.append(selectButton, actions);
		el.layerList.append(row);
	}
}

function renderBackgroundToneControl(): void {
	el.backgroundTone.value = String(state.backgroundTone);
	el.backgroundToneValue.textContent = backgroundToneLabel(state.backgroundTone);
}

function backgroundToneLabel(value: number): string {
	if (value < 35) return 'Pale';
	if (value > 65) return 'Dark';
	return 'Normal';
}

function backgroundToneOverlay(value: number): string {
	if (value < 50) {
		const alpha = ((50 - value) / 50) * 0.72;
		return `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
	}

	if (value > 50) {
		const alpha = ((value - 50) / 50) * 0.52;
		return `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
	}

	return 'transparent';
}

function updateBackgroundTone(value: number): void {
	beginLiveEdit('background-tone');
	state.backgroundTone = clamp(value, 0, 100);
	markDirty();
	renderBackgroundToneControl();
	renderCanvas();
}

function renderCanvas(): void {
	if (canvasResizeAnimationFrame) {
		window.cancelAnimationFrame(canvasResizeAnimationFrame);
		canvasResizeAnimationFrame = 0;
	}
	const size = getSize(state.sizeId);
	const background = getBackground(state.backgroundId);
	const backgroundPhoto = getBackgroundPhoto();
	el.preview.innerHTML = '';
	el.preview.style.aspectRatio = size.css;
	if (backgroundPhoto) {
		el.preview.style.background = background.base;
		el.preview.style.backgroundImage = `url("${backgroundPhoto.url}")`;
		el.preview.style.backgroundPosition = 'center';
		el.preview.style.backgroundRepeat = 'no-repeat';
		el.preview.style.backgroundSize = 'cover';
	} else {
		el.preview.style.background = background.css;
		el.preview.style.backgroundPosition = '';
		el.preview.style.backgroundRepeat = '';
		el.preview.style.backgroundSize = '';
	}
	el.preview.style.setProperty('--pc-background-tint', backgroundToneOverlay(state.backgroundTone));
	sizeCanvasToStage(size.width / size.height);

	for (const layer of state.layers) {
		const node = document.createElement('div');
		node.className = `pc-layer pc-layer-${layer.kind}`;
		node.dataset.layerId = layer.id;
		node.setAttribute('aria-label', `${layer.kind} layer`);
		node.tabIndex = 0;
		setLayerBox(node, layer.x, layer.y, layer.w, layer.h, layer.rotation);
		if (layer.id === state.selectedId) node.classList.add('is-selected');

		if (layer.kind === 'photo') renderPhotoLayer(node, layer);
		if (layer.kind === 'text') renderTextLayer(node, layer);
		if (layer.kind === 'sticker') renderStickerLayer(node, layer);

		node.addEventListener('pointerdown', (event) => startPointer(event, layer.id, 'move'));
		node.addEventListener('click', () => {
			state.selectedId = layer.id;
			renderCanvas();
			renderInspector();
			renderLayers();
		});
		node.addEventListener('keydown', (event) => {
			if ((event.target as HTMLElement).closest('.pc-text-content')) return;
			if (event.key === 'Delete' || event.key === 'Backspace') deleteSelectedLayer();
			const nudgeKeys: Record<string, [number, number]> = {
				ArrowDown: [0, event.shiftKey ? 2 : 0.5],
				ArrowLeft: [event.shiftKey ? -2 : -0.5, 0],
				ArrowRight: [event.shiftKey ? 2 : 0.5, 0],
				ArrowUp: [0, event.shiftKey ? -2 : -0.5],
			};
			const nudge = nudgeKeys[event.key];
			if (nudge) {
				event.preventDefault();
				nudgeLayer(layer.id, nudge[0], nudge[1]);
			}
		});

		if (layer.id === state.selectedId) {
			const handle = document.createElement('button');
			handle.className = 'pc-resize-handle';
			handle.type = 'button';
			handle.setAttribute('aria-label', 'Resize selected object');
			handle.addEventListener('pointerdown', (event) => startPointer(event, layer.id, 'resize'));
			node.append(handle);
		}

		el.preview.append(node);
	}

	el.activeTemplateLabel.textContent = getTemplate(state.templateId).name;
	el.activeSizeLabel.textContent = getSize(state.sizeId).name;
}

function scheduleCanvasResize(): void {
	if (canvasResizeAnimationFrame) return;
	canvasResizeAnimationFrame = window.requestAnimationFrame(() => {
		canvasResizeAnimationFrame = 0;
		renderCanvas();
	});
}

function sizeCanvasToStage(aspectRatio: number): void {
	const stageRect = el.stage.getBoundingClientRect();
	const availableWidth = Math.max(260, stageRect.width - 56);
	const availableHeight = Math.max(320, stageRect.height - 56);
	const widthFromHeight = availableHeight * aspectRatio;
	const targetWidth = Math.min(900, availableWidth, widthFromHeight);
	const safeWidth = Math.max(240, Math.floor(targetWidth));

	el.preview.style.width = `${safeWidth}px`;
	el.preview.style.setProperty('--pc-surface-width', `${safeWidth}px`);
}

function renderPhotoLayer(node: HTMLElement, layer: PhotoLayer): void {
	node.classList.add(`pc-frame-${layer.frame}`);
	node.style.borderRadius = `${layer.radius}%`;
	node.addEventListener('dragover', (event) => {
		event.preventDefault();
		node.classList.add('is-drop-target');
	});
	node.addEventListener('dragleave', () => node.classList.remove('is-drop-target'));
	node.addEventListener('drop', (event) => {
		event.preventDefault();
		node.classList.remove('is-drop-target');
		const photoId = event.dataTransfer?.getData('photo-id') || event.dataTransfer?.getData('text/plain');
		if (photoId) assignPhotoToLayer(photoId, layer.id);
	});

	const frame = document.createElement('div');
	frame.className = 'pc-photo-frame';
	const photo = state.photos.find((item) => item.id === layer.photoId);

	if (photo) {
		const image = document.createElement('img');
		image.src = photo.url;
		image.alt = '';
		image.style.objectFit = layer.fit;
		image.style.objectPosition = `${layer.cropX}% ${layer.cropY}%`;
		image.style.filter = cssPhotoFilter(layer.filter);
		image.style.transform = `scale(${layer.scale})`;
		frame.append(image);
	} else {
		const empty = document.createElement('span');
		empty.className = 'pc-slot-empty';
		empty.textContent = '+';
		frame.append(empty);
	}

	node.append(frame);
}

function renderTextLayer(node: HTMLElement, layer: TextLayer): void {
	node.classList.toggle('is-text-editing', layer.id === state.selectedId);
	node.style.color = layer.color;
	node.style.fontFamily = layer.fontFamily;
	node.style.fontSize = `calc(var(--pc-surface-width) * ${layer.fontSize / 100})`;
	node.style.fontWeight = layer.bold ? '700' : '400';
	node.style.fontStyle = layer.italic ? 'italic' : 'normal';
	node.style.textAlign = layer.align;

	const editable = document.createElement('div');
	editable.className = 'pc-text-content';
	editable.contentEditable = 'true';
	editable.spellcheck = false;
	editable.setAttribute('aria-label', 'Edit text');
	editable.textContent = layer.text;
	editable.addEventListener('pointerdown', (event) => {
		event.stopPropagation();
		if (state.selectedId !== layer.id) {
			event.preventDefault();
			state.selectedId = layer.id;
			renderCanvas();
			renderInspector();
			focusCanvasTextLayer(layer.id);
		}
	});
	editable.addEventListener('click', (event) => event.stopPropagation());
	editable.addEventListener('focus', () => {
		if (state.selectedId === layer.id) return;
		state.selectedId = layer.id;
		renderCanvas();
		renderInspector();
		focusCanvasTextLayer(layer.id);
	});
	editable.addEventListener('input', () => {
		const nextText = editable.textContent || '';
		if (nextText === layer.text) return;
		liveUpdateLayer<TextLayer>(`canvas-text:${layer.id}`, layer.id, { text: nextText }, { canvas: false });
		syncInspectorText(layer.id, nextText);
	});
	editable.addEventListener('blur', () => endLiveEdit(`canvas-text:${layer.id}`));
	node.append(editable);
}

function focusCanvasTextLayer(layerId: string): void {
	requestAnimationFrame(() => {
		const editable = el.preview.querySelector<HTMLElement>(`.pc-layer[data-layer-id="${layerId}"] .pc-text-content`);
		if (!editable) return;
		editable.focus({ preventScroll: true });
		const range = document.createRange();
		range.selectNodeContents(editable);
		range.collapse(false);
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
	});
}

function syncInspectorText(layerId: string, text: string): void {
	const textarea = el.inspector.querySelector<HTMLTextAreaElement>(`textarea[data-text-layer-id="${layerId}"]`);
	if (!textarea || document.activeElement === textarea) return;
	textarea.value = text;
}

function renderStickerLayer(node: HTMLElement, layer: StickerLayer): void {
	node.style.color = layer.color;
	node.style.opacity = String(layer.opacity);
	node.style.fontSize = `calc(var(--pc-surface-width) * ${Math.min(layer.w, layer.h) / 100 * 0.9})`;
	if (isSvgMarkup(layer.content)) {
		node.innerHTML = layer.content;
	} else {
		node.textContent = layer.content;
	}
	if (layer.background !== 'transparent') {
		node.style.background = layer.background;
		node.style.borderRadius = '12px';
	}
}

function setLayerBox(element: HTMLElement, x: number, y: number, w: number, h: number, rotation: number): void {
	element.style.left = `${x}%`;
	element.style.top = `${y}%`;
	element.style.width = `${w}%`;
	element.style.height = `${h}%`;
	element.style.transform = `rotate(${rotation}deg)`;
}

function findLayerNode(layerId: string): HTMLElement | null {
	return el.preview.querySelector<HTMLElement>(`.pc-layer[data-layer-id="${layerId}"]`);
}

function applyLayerBoxToDom(layer: DesignLayer): void {
	const node = findLayerNode(layer.id);
	if (!node) return;
	setLayerBox(node, layer.x, layer.y, layer.w, layer.h, layer.rotation);
}

function schedulePointerDomUpdate(): void {
	if (pointerAnimationFrame) return;
	pointerAnimationFrame = window.requestAnimationFrame(() => {
		pointerAnimationFrame = 0;
		const pointer = state.pointer;
		if (!pointer) return;
		const nextLayer = state.layers.find((item) => item.id === pointer.id);
		if (!nextLayer) return;
		applyLayerBoxToDom(nextLayer);
	});
}

function renderInspector(): void {
	const layer = getSelectedLayer();
	el.inspector.innerHTML = '';
	el.duplicateLayer.disabled = !layer;
	el.deleteLayer.disabled = !layer;

	if (!layer) {
		renderCanvasInspector();
		return;
	}

	const title = document.createElement('div');
	title.className = 'pc-selected-title';
	title.textContent = layer.kind === 'photo' ? 'Photo frame' : layer.kind === 'text' ? 'Text box' : 'Sticker';
	el.inspector.append(title);

	addRangeControl(
		'X',
		layer.x,
		0,
		100,
		1,
		(value) => liveUpdateLayer(`layer:${layer.id}:x`, layer.id, { x: value }),
		`layer:${layer.id}:x`,
	);
	addRangeControl(
		'Y',
		layer.y,
		0,
		100,
		1,
		(value) => liveUpdateLayer(`layer:${layer.id}:y`, layer.id, { y: value }),
		`layer:${layer.id}:y`,
	);
	addRangeControl(
		'Width',
		layer.w,
		4,
		100,
		1,
		(value) => liveUpdateLayer(`layer:${layer.id}:width`, layer.id, { w: value }),
		`layer:${layer.id}:width`,
	);
	addRangeControl(
		'Height',
		layer.h,
		4,
		100,
		1,
		(value) => liveUpdateLayer(`layer:${layer.id}:height`, layer.id, { h: value }),
		`layer:${layer.id}:height`,
	);
	addRangeControl(
		'Rotate',
		layer.rotation,
		-45,
		45,
		1,
		(value) => liveUpdateLayer(`layer:${layer.id}:rotation`, layer.id, { rotation: value }),
		`layer:${layer.id}:rotation`,
	);

	if (layer.kind === 'photo') renderPhotoInspector(layer);
	if (layer.kind === 'text') renderTextInspector(layer);
	if (layer.kind === 'sticker') renderStickerInspector(layer);
}

function renderCanvasInspector(): void {
	const card = document.createElement('div');
	card.className = 'pc-inspector-empty';
	card.textContent = 'Select a photo, text, or sticker.';
	el.inspector.append(card);

	const snap = document.createElement('label');
	snap.className = 'pc-toggle-row';
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = state.snap;
	checkbox.addEventListener('change', () => {
		state.snap = checkbox.checked;
		setStatus(state.snap ? 'Snap enabled.' : 'Snap disabled.');
	});
	snap.append(checkbox, document.createTextNode('Snap to grid'));
	el.inspector.append(snap);
}

function renderPhotoInspector(layer: PhotoLayer): void {
	addSelectControl('Frame', layer.frame, ['clean', 'paper', 'polaroid', 'film', 'stamp', 'soft', 'shadow'], (value) =>
		updateLayer(layer.id, { frame: value as FrameStyle }),
	);
	addSelectControl('Fit', layer.fit, ['cover', 'contain'], (value) => updateLayer(layer.id, { fit: value as PhotoLayer['fit'] }));
	addSelectControl('Filter', layer.filter, ['none', 'warm', 'cool', 'mono', 'matte', 'vivid'], (value) =>
		updateLayer(layer.id, { filter: value as PhotoFilter }),
	);
	addRangeControl(
		'Crop X',
		layer.cropX,
		0,
		100,
		1,
		(value) => liveUpdateLayer<PhotoLayer>(`photo:${layer.id}:crop-x`, layer.id, { cropX: value }),
		`photo:${layer.id}:crop-x`,
	);
	addRangeControl(
		'Crop Y',
		layer.cropY,
		0,
		100,
		1,
		(value) => liveUpdateLayer<PhotoLayer>(`photo:${layer.id}:crop-y`, layer.id, { cropY: value }),
		`photo:${layer.id}:crop-y`,
	);
	addRangeControl(
		'Zoom',
		layer.scale,
		0.6,
		2.5,
		0.05,
		(value) => liveUpdateLayer<PhotoLayer>(`photo:${layer.id}:zoom`, layer.id, { scale: value }),
		`photo:${layer.id}:zoom`,
	);
	addRangeControl(
		'Corner',
		layer.radius,
		0,
		16,
		1,
		(value) => liveUpdateLayer<PhotoLayer>(`photo:${layer.id}:corner`, layer.id, { radius: value }),
		`photo:${layer.id}:corner`,
	);
}

function renderTextInspector(layer: TextLayer): void {
	const field = document.createElement('label');
	field.className = 'pc-field';
	field.textContent = 'Text';
	const textarea = document.createElement('textarea');
	const editKey = `inspector-text:${layer.id}`;
	textarea.dataset.textLayerId = layer.id;
	textarea.value = layer.text;
	textarea.rows = 3;
	textarea.addEventListener('input', () => liveUpdateLayer<TextLayer>(editKey, layer.id, { text: textarea.value }));
	textarea.addEventListener('blur', () => endLiveEdit(editKey));
	field.append(textarea);
	el.inspector.append(field);

	addSelectControl('Font', layer.fontFamily, fontOptions(), (value) => updateLayer(layer.id, { fontFamily: value }));
	addRangeControl(
		'Size',
		layer.fontSize,
		1.8,
		10,
		0.1,
		(value) => liveUpdateLayer<TextLayer>(`text:${layer.id}:size`, layer.id, { fontSize: value }),
		`text:${layer.id}:size`,
	);
	addColorControl(
		'Color',
		layer.color,
		(value) => liveUpdateLayer<TextLayer>(`text:${layer.id}:color`, layer.id, { color: value }),
		`text:${layer.id}:color`,
	);
	addToggleRow([
		['Bold', layer.bold, () => updateLayer(layer.id, { bold: !layer.bold })],
		['Italic', layer.italic, () => updateLayer(layer.id, { italic: !layer.italic })],
	]);
	addSelectControl('Align', layer.align, ['left', 'center', 'right'], (value) => updateLayer(layer.id, { align: value as TextLayer['align'] }));
}

function renderStickerInspector(layer: StickerLayer): void {
	const field = document.createElement('label');
	field.className = 'pc-field';
	field.textContent = 'Sticker';
	const input = document.createElement('input');
	const editKey = `inspector-sticker:${layer.id}`;
	input.value = layer.content;
	input.addEventListener('input', () => liveUpdateLayer<StickerLayer>(editKey, layer.id, { content: input.value || '✦' }));
	input.addEventListener('blur', () => endLiveEdit(editKey));
	field.append(input);
	el.inspector.append(field);

	addColorControl(
		'Color',
		layer.color,
		(value) => liveUpdateLayer<StickerLayer>(`sticker:${layer.id}:color`, layer.id, { color: value }),
		`sticker:${layer.id}:color`,
	);
	addRangeControl(
		'Opacity',
		layer.opacity,
		0.2,
		1,
		0.05,
		(value) => liveUpdateLayer<StickerLayer>(`sticker:${layer.id}:opacity`, layer.id, { opacity: value }),
		`sticker:${layer.id}:opacity`,
	);
}

function addRangeControl(
	labelText: string,
	value: number,
	min: number,
	max: number,
	step: number,
	onInput: (value: number) => void,
	liveEditKey?: string,
): void {
	const label = document.createElement('label');
	label.className = 'pc-field';
	const row = document.createElement('span');
	row.className = 'pc-field-row';
	row.textContent = labelText;
	const readout = document.createElement('span');
	readout.textContent = String(Math.round(value * 100) / 100);
	row.append(readout);
	const input = document.createElement('input');
	input.type = 'range';
	input.min = String(min);
	input.max = String(max);
	input.step = String(step);
	input.value = String(value);
	input.addEventListener('input', () => {
		const next = Number(input.value);
		readout.textContent = String(Math.round(next * 100) / 100);
		onInput(next);
	});
	if (liveEditKey) {
		input.addEventListener('change', () => endLiveEdit(liveEditKey));
		input.addEventListener('blur', () => endLiveEdit(liveEditKey));
	}
	label.append(row, input);
	el.inspector.append(label);
}

function addSelectControl(labelText: string, value: string, options: string[], onChange: (value: string) => void): void {
	const label = document.createElement('label');
	label.className = 'pc-field';
	label.textContent = labelText;
	const select = document.createElement('select');
	for (const optionValue of options) {
		const option = document.createElement('option');
		option.value = optionValue;
		option.textContent = optionValue;
		option.selected = optionValue === value;
		select.append(option);
	}
	select.addEventListener('change', () => onChange(select.value));
	label.append(select);
	el.inspector.append(label);
}

function addColorControl(labelText: string, value: string, onInput: (value: string) => void, liveEditKey?: string): void {
	const label = document.createElement('label');
	label.className = 'pc-field';
	label.textContent = labelText;
	const input = document.createElement('input');
	input.type = 'color';
	input.value = value.startsWith('#') ? value : '#171717';
	input.addEventListener('input', () => onInput(input.value));
	if (liveEditKey) {
		input.addEventListener('change', () => endLiveEdit(liveEditKey));
		input.addEventListener('blur', () => endLiveEdit(liveEditKey));
	}
	label.append(input);
	el.inspector.append(label);
}

function addToggleRow(items: Array<[string, boolean, () => void]>): void {
	const row = document.createElement('div');
	row.className = 'pc-segmented';
	for (const [label, active, handler] of items) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = label;
		button.setAttribute('aria-pressed', String(active));
		button.addEventListener('click', handler);
		row.append(button);
	}
	el.inspector.append(row);
}

function fontOptions(): string[] {
	return [
		'Inter, Arial, sans-serif',
		'Georgia, Times New Roman, serif',
		'Brush Script MT, Snell Roundhand, Apple Chancery, cursive',
		'Comic Sans MS, Bradley Hand, cursive',
		'Courier New, monospace',
		'Trebuchet MS, Arial, sans-serif',
	];
}

function isSvgMarkup(value: string): boolean {
	return value.trimStart().startsWith('<svg');
}

function cssPhotoFilter(filter: PhotoFilter): string {
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

interface LayerUpdateOptions {
	canvas?: boolean;
	dirty?: boolean;
	history?: boolean;
	inspector?: boolean;
}

function normalizeLayerUpdateOptions(options: boolean | LayerUpdateOptions): Required<LayerUpdateOptions> {
	if (typeof options === 'boolean') {
		return {
			canvas: true,
			dirty: true,
			history: options,
			inspector: true,
		};
	}

	return {
		canvas: options.canvas ?? true,
		dirty: options.dirty ?? true,
		history: options.history ?? true,
		inspector: options.inspector ?? true,
	};
}

function updateLayer<T extends DesignLayer>(id: string, patch: Partial<T>, options: boolean | LayerUpdateOptions = true): void {
	const layer = state.layers.find((item) => item.id === id);
	if (!layer) return;
	const nextOptions = normalizeLayerUpdateOptions(options);
	if (nextOptions.history) commitHistory();
	Object.assign(layer, patch);
	if (nextOptions.dirty) markDirty();
	if (nextOptions.canvas) renderCanvas();
	if (nextOptions.inspector) renderInspector();
	if (state.activePanel === 'layers') renderLayers();
}

function liveUpdateLayer<T extends DesignLayer>(
	key: string,
	id: string,
	patch: Partial<T>,
	options: Omit<LayerUpdateOptions, 'history'> = {},
): void {
	beginLiveEdit(key);
	updateLayer<T>(id, patch, { ...options, history: false, inspector: options.inspector ?? false });
}

function addTextLayer(presetId?: string): void {
	const preset = textPresets.find((item) => item.id === presetId) ?? textPresets[0];
	commitHistory();
	const layer: TextLayer = {
		align: preset.align ?? 'center',
		bold: Boolean(preset.bold),
		color: preset.color,
		fontFamily: preset.fontFamily,
		fontSize: preset.fontSize,
		h: 10,
		id: createId('text'),
		italic: Boolean(preset.italic),
		kind: 'text',
		rotation: 0,
		text: preset.text,
		w: 64,
		x: 18,
		y: 84,
	};
	state.layers.push(layer);
	state.selectedId = layer.id;
	state.activePanel = 'text';
	markDirty('Text added.');
	renderAll();
}

function addStickerLayer(presetId: string): void {
	const preset = elementPresets.find((item) => item.id === presetId) ?? elementPresets[0];
	commitHistory();
	const layer: StickerLayer = {
		background: preset.background ?? 'transparent',
		color: preset.color ?? '#171717',
		content: preset.content,
		h: 10,
		id: createId('sticker'),
		kind: 'sticker',
		opacity: 1,
		rotation: 0,
		w: preset.content.length > 1 ? 18 : 10,
		x: 76,
		y: 14,
	};
	state.layers.push(layer);
	state.selectedId = layer.id;
	state.activePanel = 'elements';
	markDirty('Element added.');
	renderAll();
}

function duplicateSelectedLayer(): void {
	const layer = getSelectedLayer();
	if (!layer) return;
	duplicateLayer(layer.id);
}

function duplicateLayer(id: string): void {
	const layer = state.layers.find((item) => item.id === id);
	if (!layer) return;
	commitHistory();
	const copy = structuredClone(layer) as DesignLayer;
	copy.id = createId(layer.kind);
	copy.x = Math.min(92, copy.x + 4);
	copy.y = Math.min(92, copy.y + 4);
	state.layers.push(copy);
	state.selectedId = copy.id;
	markDirty('Object duplicated.');
	renderAll();
}

function deleteSelectedLayer(): void {
	const layer = getSelectedLayer();
	if (!layer) return;
	deleteLayer(layer.id);
}

function deleteLayer(id: string): void {
	const layer = state.layers.find((item) => item.id === id);
	if (!layer) return;
	commitHistory();
	state.layers = state.layers.filter((item) => item.id !== layer.id);
	state.selectedId = null;
	markDirty('Object deleted.');
	renderAll();
}

type LayerDropPosition = 'before' | 'after';

function layerDropPosition(event: DragEvent, row: HTMLElement): LayerDropPosition {
	const rect = row.getBoundingClientRect();
	return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
}

function clearLayerDropIndicators(except?: HTMLElement): void {
	el.layerList.querySelectorAll<HTMLElement>('.pc-layer-row').forEach((row) => {
		if (row === except) return;
		row.classList.remove('is-drop-before', 'is-drop-after');
	});
}

function animateLayerDomMove(draggedRow: HTMLElement, targetRow: HTMLElement, position: LayerDropPosition): void {
	const rows = Array.from(el.layerList.querySelectorAll<HTMLElement>('.pc-layer-row'));
	const before = new Map(rows.map((row) => [row, row.getBoundingClientRect().top]));

	if (position === 'before') {
		el.layerList.insertBefore(draggedRow, targetRow);
	} else {
		el.layerList.insertBefore(draggedRow, targetRow.nextElementSibling);
	}

	for (const row of rows) {
		const previousTop = before.get(row);
		if (previousTop === undefined) continue;
		const delta = previousTop - row.getBoundingClientRect().top;
		if (!delta) continue;
		row.animate([{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }], {
			duration: 180,
			easing: 'cubic-bezier(.2,.8,.2,1)',
		});
	}
}

function commitLayerDomOrder(): void {
	const visualIds = Array.from(el.layerList.querySelectorAll<HTMLElement>('.pc-layer-row'))
		.map((row) => row.dataset.layerId)
		.filter((id): id is string => Boolean(id));
	if (visualIds.length !== state.layers.length) return;
	const nextIds = [...visualIds].reverse();
	const currentIds = state.layers.map((layer) => layer.id);
	if (nextIds.every((id, index) => id === currentIds[index])) return;
	commitHistory();
	const byId = new Map(state.layers.map((layer) => [layer.id, layer]));
	state.layers = nextIds.map((id) => byId.get(id)).filter((layer): layer is DesignLayer => Boolean(layer));
	markDirty('Layer order updated.');
	renderAll();
}

function nudgeLayer(id: string, dx: number, dy: number): void {
	const layer = state.layers.find((item) => item.id === id);
	if (!layer) return;
	commitHistory();
	layer.x = clamp(layer.x + dx, -20, 110);
	layer.y = clamp(layer.y + dy, -20, 110);
	markDirty('Object nudged.');
	renderCanvas();
	renderInspector();
	if (state.activePanel === 'layers') renderLayers();
}

function startPointer(event: PointerEvent, id: string, mode: PointerSession['mode']): void {
	if (event.button !== 0) return;
	const layer = state.layers.find((item) => item.id === id);
	if (!layer) return;

	const target = event.target as HTMLElement;
	if (target.closest('.pc-text-content') && state.selectedId === id && mode === 'move') {
		return;
	}

	event.preventDefault();
	commitHistory();
	state.selectedId = id;
	state.pointer = {
		id,
		mode,
		startLayer: structuredClone(layer) as DesignLayer,
		startX: event.clientX,
		startY: event.clientY,
		surfaceRect: el.preview.getBoundingClientRect(),
	};
	renderCanvas();
	renderInspector();
}

function updatePointer(event: PointerEvent): void {
	const pointer = state.pointer;
	if (!pointer) return;
	event.preventDefault();

	const layer = state.layers.find((item) => item.id === pointer.id);
	if (!layer) return;

	const dx = ((event.clientX - pointer.startX) / pointer.surfaceRect.width) * 100;
	const dy = ((event.clientY - pointer.startY) / pointer.surfaceRect.height) * 100;

	if (pointer.mode === 'move') {
		layer.x = clamp(pointer.startLayer.x + dx, -20, 110);
		layer.y = clamp(pointer.startLayer.y + dy, -20, 110);
		applySnap(layer);
	}

	if (pointer.mode === 'resize') {
		layer.w = clamp(pointer.startLayer.w + dx, 4, 100);
		layer.h = clamp(pointer.startLayer.h + dy, 4, 100);
	}

	schedulePointerDomUpdate();
}

function finishPointer(): void {
	if (!state.pointer) return;
	if (pointerAnimationFrame) {
		window.cancelAnimationFrame(pointerAnimationFrame);
		pointerAnimationFrame = 0;
	}
	const layer = state.layers.find((item) => item.id === state.pointer?.id);
	state.pointer = null;
	if (layer) applyLayerBoxToDom(layer);
	hideGuides();
	renderInspector();
	if (state.activePanel === 'layers') renderLayers();
	markDirty('Object updated.');
}

function applySnap(layer: DesignLayer): void {
	if (!state.snap) {
		hideGuides();
		return;
	}

	const centerX = layer.x + layer.w / 2;
	const centerY = layer.y + layer.h / 2;
	let showX = false;
	let showY = false;

	if (Math.abs(centerX - 50) < 1.2) {
		layer.x = 50 - layer.w / 2;
		showX = true;
	}
	if (Math.abs(centerY - 50) < 1.2) {
		layer.y = 50 - layer.h / 2;
		showY = true;
	}

	layer.x = Math.round(layer.x * 2) / 2;
	layer.y = Math.round(layer.y * 2) / 2;
	el.guideX.classList.toggle('hidden', !showX);
	el.guideY.classList.toggle('hidden', !showY);
}

function hideGuides(): void {
	el.guideX.classList.add('hidden');
	el.guideY.classList.add('hidden');
}

async function finishCollage(): Promise<void> {
	if (el.finish.getAttribute('aria-busy') === 'true') return;
	setDownloadButtonBusy(true);
	setStatus('Preparing your download...');

	try {
		startDownload(await renderExportBlob());
		setStatus('Download started.');
		await wait(650);
	} catch (error) {
		setStatus(error instanceof Error ? error.message : 'Could not render the collage.');
	} finally {
		setDownloadButtonBusy(false);
	}
}

function toggleSharePanel(): void {
	if (el.share.hidden) return;
	const willOpen = el.sharePanel.classList.contains('hidden');
	el.sharePanel.classList.toggle('hidden', !willOpen);
	el.share.setAttribute('aria-expanded', String(willOpen));
	setStatus(willOpen ? 'Choose where to share your collage.' : 'Share options closed.');
}

function closeSharePanel(): void {
	el.sharePanel.classList.add('hidden');
	el.share.setAttribute('aria-expanded', 'false');
}

function updateShareVisibility(): void {
	const isAvailable = isMobileShareBrowser();
	el.share.hidden = !isAvailable;
	el.share.disabled = !isAvailable;
	el.share.closest('.pc-top-actions')?.classList.toggle('pc-share-hidden', !isAvailable);
	if (!isAvailable) closeSharePanel();
}

function isMobileShareBrowser(): boolean {
	const userAgent = navigator.userAgent || '';
	const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
	const isTouchIpad = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
	const isCoarseTouch = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ?? false;

	return isMobileUserAgent || isTouchIpad || isCoarseTouch;
}

async function shareCollage(target: ShareTarget): Promise<void> {
	if (el.share.getAttribute('aria-busy') === 'true') return;
	setShareButtonBusy(true);
	setStatus(target === 'download' ? 'Preparing your download...' : 'Preparing your share image...');

	try {
		const blob = await renderExportBlob();
		if (target === 'copy') {
			const copied = await copyRenderedImageToClipboard();
			if (copied) {
				closeSharePanel();
				setStatus('Collage copied. Paste it into WhatsApp Web, Instagram, Snapchat, or another app.');
				return;
			}

			startDownload(blob);
			closeSharePanel();
			setStatus('Image copy is not available in this browser. Download started instead.');
			return;
		}

		if (target === 'download') {
			startDownload(blob);
			closeSharePanel();
			setStatus('Download started. Upload the image anywhere you like.');
			return;
		}

		const file = new File([blob], exportFileName(), { type: blob.type || exportMimeType() });
		const appLabel = shareTargetLabel(target);

		if (canShareFile(file) && navigator.share) {
			try {
				await navigator.share({
					files: [file],
					text: 'Made with Photo Collage.',
					title: 'Photo Collage',
				});
				closeSharePanel();
				setStatus(`${appLabel} share opened. Pick the app from your share sheet.`);
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') throw error;
				startDownload(blob);
				closeSharePanel();
				setStatus(`${appLabel} share was blocked by this browser. Download started instead.`);
			}
			return;
		}

		await handleWebShareFallback(target, blob);
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') {
			setStatus('Share cancelled.');
			return;
		}
		setStatus(error instanceof Error ? error.message : 'Could not share the collage.');
	} finally {
		setShareButtonBusy(false);
	}
}

async function handleWebShareFallback(target: Exclude<ShareTarget, 'copy' | 'download'>, blob: Blob): Promise<void> {
	const appLabel = shareTargetLabel(target);
	const copied = await copyRenderedImageToClipboard();

	if (!copied) startDownload(blob);
	if (target === 'native') {
		closeSharePanel();
		setStatus(
			copied
				? 'Browser share is not available here. Collage copied so you can paste it into another app.'
				: 'Browser share is not available here. Download started instead.',
		);
		return;
	}

	openShareDestination(target);
	closeSharePanel();

	if (copied) {
		setStatus(`${appLabel} opened for web. Paste the copied collage image into the app.`);
		return;
	}

	setStatus(`${appLabel} opened for web. Download started so you can upload the collage there.`);
}

function canShareFile(file: File): boolean {
	if (!navigator.share) return false;
	if (!navigator.canShare) return true;
	return navigator.canShare({ files: [file] });
}

function shareTargetLabel(target: ShareTarget): string {
	const labels: Record<ShareTarget, string> = {
		copy: 'Copy image',
		download: 'Download',
		instagram: 'Instagram',
		native: 'App',
		snapchat: 'Snapchat',
		whatsapp: 'WhatsApp',
	};

	return labels[target];
}

function isShareTarget(value: string | undefined): value is ShareTarget {
	return value === 'copy' || value === 'download' || value === 'instagram' || value === 'native' || value === 'snapchat' || value === 'whatsapp';
}

async function copyRenderedImageToClipboard(): Promise<boolean> {
	if (!navigator.clipboard?.write || !('ClipboardItem' in window)) return false;

	try {
		const pngBlob = await canvasToBlob(el.canvas, 'png');
		await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
		return true;
	} catch {
		return false;
	}
}

function openShareDestination(target: Exclude<ShareTarget, 'copy' | 'download' | 'native'>): void {
	const urls: Record<Exclude<ShareTarget, 'copy' | 'download' | 'native'>, string> = {
		instagram: 'https://www.instagram.com/',
		snapchat: 'https://web.snapchat.com/',
		whatsapp: 'https://web.whatsapp.com/',
	};

	window.open(urls[target], '_blank', 'noopener');
}

async function renderExportBlob(): Promise<Blob> {
	await renderDesignToCanvas(el.canvas, {
		background: getBackground(state.backgroundId),
		backgroundPhoto: getBackgroundPhoto(),
		backgroundTone: state.backgroundTone,
		format: state.format,
		layers: state.layers,
		photos: state.photos,
		size: getSize(state.sizeId),
	});

	return canvasToBlob(el.canvas, state.format);
}

function startDownload(blob: Blob): void {
	revokeExportUrl();
	state.exportUrl = URL.createObjectURL(blob);
	el.downloadLink.href = state.exportUrl;
	el.downloadLink.download = exportFileName();
	el.downloadPanel.classList.add('hidden');
	el.exportEmpty.classList.add('sr-only');
	el.downloadLink.click();
}

function exportFileName(): string {
	const sizeName = getSize(state.sizeId).name.toLowerCase().replaceAll(' ', '-');
	return `photo-collage-${sizeName}.${state.format === 'jpeg' ? 'jpg' : 'png'}`;
}

function exportMimeType(): string {
	return state.format === 'jpeg' ? 'image/jpeg' : 'image/png';
}

function saveDesign(): void {
	if (persistDesign()) setStatus('Design saved in this browser.');
}

function persistDesign(): boolean {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
		return true;
	} catch {
		setStatus('Could not save this design in your browser.');
		return false;
	}
}

function tryLoadSavedDesign(): void {
	let saved: string | null = null;
	try {
		saved = localStorage.getItem(STORAGE_KEY);
	} catch {
		saved = null;
	}

	if (!saved) {
		state.layers = layersFromTemplate(initialTemplate.id);
		return;
	}

	try {
		const parsed = sanitizeSnapshot(JSON.parse(saved));
		if (!parsed) {
			state.layers = layersFromTemplate(initialTemplate.id);
			return;
		}

		state.backgroundId = parsed.backgroundId;
		state.backgroundPhotoId = null;
		state.backgroundTone = parsed.backgroundTone;
		state.format = parsed.format;
		state.layers = parsed.layers;
		state.sizeId = parsed.sizeId;
		state.templateId = parsed.templateId;
		setStatus('Saved design loaded.');
	} catch {
		state.layers = layersFromTemplate(initialTemplate.id);
	}
}

function sanitizeSnapshot(value: unknown): Snapshot | null {
	if (!value || typeof value !== 'object') return null;
	const candidate = value as Partial<Snapshot>;
	const templateId = typeof candidate.templateId === 'string' ? getTemplate(candidate.templateId).id : initialTemplate.id;
	const template = getTemplate(templateId);
	const backgroundId = typeof candidate.backgroundId === 'string' ? getBackground(candidate.backgroundId).id : template.backgroundId;
	const sizeId = isSizeId(candidate.sizeId) ? candidate.sizeId : template.size;
	const format: ExportFormat = candidate.format === 'jpeg' ? 'jpeg' : 'png';
	const layers = Array.isArray(candidate.layers) ? sanitizeLayers(candidate.layers) : layersFromTemplate(template.id);

	return {
		backgroundId,
		backgroundPhotoId: null,
		backgroundTone: clamp(toFiniteNumber(candidate.backgroundTone, 50), 0, 100),
		format,
		layers: layers.length ? layers : layersFromTemplate(template.id),
		sizeId,
		templateId: template.id,
	};
}

function sanitizeLayers(value: unknown[]): DesignLayer[] {
	const layers: DesignLayer[] = [];

	for (const item of value) {
		if (!item || typeof item !== 'object') continue;
		const layer = item as Partial<DesignLayer>;
		const base = sanitizeBaseLayer(layer);
		if (!base) continue;

		if (layer.kind === 'photo') {
			layers.push({
				...base,
				cropX: clamp(toFiniteNumber(layer.cropX, 50), 0, 100),
				cropY: clamp(toFiniteNumber(layer.cropY, 50), 0, 100),
				fit: layer.fit === 'contain' ? 'contain' : 'cover',
				filter: isPhotoFilter(layer.filter) ? layer.filter : 'none',
				frame: isFrameStyle(layer.frame) ? layer.frame : 'paper',
				kind: 'photo',
				photoId: null,
				radius: clamp(toFiniteNumber(layer.radius, 3), 0, 24),
				scale: clamp(toFiniteNumber(layer.scale, 1), 0.2, 4),
			});
		}

		if (layer.kind === 'text') {
			layers.push({
				...base,
				align: layer.align === 'left' || layer.align === 'right' ? layer.align : 'center',
				bold: Boolean(layer.bold),
				color: typeof layer.color === 'string' ? layer.color : '#171717',
				fontFamily: typeof layer.fontFamily === 'string' ? layer.fontFamily : fontOptions()[0],
				fontSize: clamp(toFiniteNumber(layer.fontSize, 4), 1, 14),
				italic: Boolean(layer.italic),
				kind: 'text',
				text: typeof layer.text === 'string' ? layer.text : '',
			});
		}

		if (layer.kind === 'sticker') {
			layers.push({
				...base,
				background: typeof layer.background === 'string' ? layer.background : 'transparent',
				color: typeof layer.color === 'string' ? layer.color : '#171717',
				content: typeof layer.content === 'string' && layer.content ? layer.content : '✦',
				kind: 'sticker',
				opacity: clamp(toFiniteNumber(layer.opacity, 1), 0.05, 1),
			});
		}
	}

	return layers;
}

function sanitizeBaseLayer(layer: Partial<DesignLayer>): BaseLayer | null {
	if (typeof layer.id !== 'string' || !layer.id) return null;

	return {
		h: clamp(toFiniteNumber(layer.h, 10), 1, 140),
		id: layer.id,
		rotation: clamp(toFiniteNumber(layer.rotation, 0), -360, 360),
		w: clamp(toFiniteNumber(layer.w, 10), 1, 140),
		x: clamp(toFiniteNumber(layer.x, 0), -100, 200),
		y: clamp(toFiniteNumber(layer.y, 0), -100, 200),
	};
}

function isSizeId(value: unknown): value is SizeId {
	return typeof value === 'string' && value in sizePresets;
}

function isFrameStyle(value: unknown): value is FrameStyle {
	return value === 'clean' || value === 'paper' || value === 'polaroid' || value === 'film' || value === 'stamp' || value === 'soft' || value === 'shadow';
}

function isPhotoFilter(value: unknown): value is PhotoFilter {
	return value === 'none' || value === 'warm' || value === 'cool' || value === 'mono' || value === 'matte' || value === 'vivid';
}

function renderToolbarState(): void {
	el.undo.disabled = state.history.length === 0;
	el.redo.disabled = state.future.length === 0;
}

function undo(): void {
	const previous = state.history.pop();
	if (!previous) return;
	state.future.push(snapshot());
	restoreSnapshot(previous);
}

function redo(): void {
	const next = state.future.pop();
	if (!next) return;
	state.history.push(snapshot());
	restoreSnapshot(next);
}

function setupEvents(): void {
	updateShareVisibility();

	document.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((button) => {
		button.addEventListener('click', () => {
			const panel = button.dataset.panel;
			if (!isPanel(panel)) return;
			state.activePanel = panel;
			state.assetSearch = '';
			renderAll();
		});
	});

	el.assetSearch.addEventListener('input', () => {
		state.assetSearch = el.assetSearch.value;
		renderCategories();
		renderTemplates();
		renderUploads();
		renderTextPresets();
		renderElements();
		renderBackgrounds();
		renderLayers();
	});
	el.input.addEventListener('change', () => {
		addFiles(el.input.files);
		el.input.value = '';
	});
	el.backgroundPhotoInput.addEventListener('change', () => {
		addFiles(el.backgroundPhotoInput.files, { assignToSlots: false, useFirstAsBackground: true });
		el.backgroundPhotoInput.value = '';
	});
	el.addBackgroundPhoto.addEventListener('click', () => el.backgroundPhotoInput.click());
	el.clearBackgroundPhoto.addEventListener('click', clearBackgroundPhoto);
	el.backgroundTone.addEventListener('input', () => updateBackgroundTone(Number(el.backgroundTone.value)));
	el.backgroundTone.addEventListener('change', () => endLiveEdit('background-tone'));
	el.backgroundTone.addEventListener('blur', () => endLiveEdit('background-tone'));
	el.clearPhotos.addEventListener('click', clearPhotos);
	el.addText.addEventListener('click', () => addTextLayer());
	el.duplicateLayer.addEventListener('click', duplicateSelectedLayer);
	el.deleteLayer.addEventListener('click', deleteSelectedLayer);
	el.finish.addEventListener('click', () => void finishCollage());
	el.save.addEventListener('click', saveDesign);
	el.share.addEventListener('click', toggleSharePanel);
	el.shareClose.addEventListener('click', closeSharePanel);
	el.sharePanel.querySelectorAll<HTMLButtonElement>('[data-share-target]').forEach((button) => {
		button.addEventListener('click', () => {
			const target = button.dataset.shareTarget;
			if (!isShareTarget(target)) return;
			void shareCollage(target);
		});
	});
	el.undo.addEventListener('click', undo);
	el.redo.addEventListener('click', redo);
	el.quickUpload.addEventListener('click', () => {
		state.activePanel = 'uploads';
		renderAll();
		el.input.click();
	});
	el.quickTemplate.addEventListener('click', () => {
		persistDesign();
		window.location.href = '/templates/';
	});
	el.quickRemix.addEventListener('click', remixSmartLayout);
	el.smartBalanced.addEventListener('click', () => applySmartLayout('balanced'));
	el.smartStory.addEventListener('click', () => applySmartLayout('story'));
	el.smartMoodboard.addEventListener('click', () => applySmartLayout('moodboard'));

	el.sizeSelect.addEventListener('change', () => {
		commitHistory();
		state.sizeId = el.sizeSelect.value as SizeId;
		markDirty('Size updated.');
		renderAll();
	});
	el.formatSelect.addEventListener('change', () => {
		state.format = el.formatSelect.value === 'jpeg' ? 'jpeg' : 'png';
		markDirty('Export format updated.');
		renderToolbarState();
	});

	el.dropZone.addEventListener('dragover', (event) => {
		event.preventDefault();
		el.dropZone.classList.add('is-active');
	});
	el.dropZone.addEventListener('dragleave', () => el.dropZone.classList.remove('is-active'));
	el.dropZone.addEventListener('drop', (event) => {
		event.preventDefault();
		el.dropZone.classList.remove('is-active');
		addFiles(event.dataTransfer?.files);
	});

	el.preview.addEventListener('pointerdown', (event) => {
		if (event.target === el.preview) {
			state.selectedId = null;
			renderCanvas();
			renderInspector();
			renderLayers();
		}
	});
	el.preview.addEventListener('dragover', (event) => event.preventDefault());
	el.preview.addEventListener('drop', (event) => {
		event.preventDefault();
		const photoId = event.dataTransfer?.getData('photo-id') || event.dataTransfer?.getData('text/plain');
		if (photoId) assignPhotoToLayer(photoId);
	});

	window.addEventListener('pointermove', updatePointer);
	window.addEventListener('pointerup', finishPointer);
	window.addEventListener('pointercancel', finishPointer);
	window.addEventListener('resize', scheduleCanvasResize);
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
		if (autosaveTimer) {
			window.clearTimeout(autosaveTimer);
			persistDesign();
		}
		revokeExportUrl();
		for (const photo of state.photos) URL.revokeObjectURL(photo.url);
	});
	window.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeSharePanel();
	});
	window.addEventListener('resize', updateShareVisibility);
}

function isPanel(value: string | undefined): value is StudioState['activePanel'] {
	return (
		value === 'templates' ||
		value === 'uploads' ||
		value === 'text' ||
		value === 'elements' ||
		value === 'backgrounds' ||
		value === 'layers'
	);
}

function isFile(file: File | null): file is File {
	return file instanceof File;
}

function clamp(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	return Math.min(max, Math.max(min, value));
}

function toFiniteNumber(value: unknown, fallback: number): number {
	const parsed = Number(value ?? fallback);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function templateIdFromUrl(): string | null {
	const params = new URLSearchParams(window.location.search);
	const templateId = params.get('template');
	if (!templateId || !templates.some((template) => template.id === templateId)) return null;
	return templateId;
}

tryLoadSavedDesign();
const requestedTemplateId = templateIdFromUrl();
if (requestedTemplateId) applyTemplate(requestedTemplateId, false);
setupTheme();
setupEvents();
renderAll();

if (!state.layers.length) {
	applyTemplate(smartTemplateForCount(3).id, false);
}
