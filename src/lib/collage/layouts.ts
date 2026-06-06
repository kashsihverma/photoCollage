export interface CollageCell {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface CollageLayout {
	columns: number;
	rows: number;
	cells: CollageCell[];
}

export type LayoutBuilder = (count: number) => CollageLayout;

function normalizeCount(count: number): number {
	return Math.max(1, Math.floor(count));
}

export function layoutFromPattern(
	columns: number,
	rows: number,
	pattern: CollageCell[],
	count: number,
): CollageLayout {
	const safeCount = normalizeCount(count);
	const cells = pattern.slice(0, safeCount);

	if (safeCount <= pattern.length) {
		return { columns, rows, cells };
	}

	const remaining = safeCount - pattern.length;
	const extraRows = Math.ceil(remaining / columns);

	for (let index = 0; index < remaining; index += 1) {
		cells.push({
			x: index % columns,
			y: rows + Math.floor(index / columns),
			w: 1,
			h: 1,
		});
	}

	return { columns, rows: rows + extraRows, cells };
}

export function buildGridLayout(count: number): CollageLayout {
	const safeCount = normalizeCount(count);
	const columns = safeCount <= 1 ? 1 : safeCount <= 4 ? 2 : safeCount <= 9 ? 3 : 4;
	const rows = Math.ceil(safeCount / columns);

	return {
		columns,
		rows,
		cells: Array.from({ length: safeCount }, (_, index) => ({
			x: index % columns,
			y: Math.floor(index / columns),
			w: 1,
			h: 1,
		})),
	};
}

export function buildHeroSideLayout(count: number): CollageLayout {
	if (count < 3) return buildGridLayout(count);

	const sideCount = count - 1;
	const sideColumns = sideCount <= 3 ? 1 : 2;
	const rows = Math.max(3, Math.ceil(sideCount / sideColumns));
	const cells: CollageCell[] = [{ x: 0, y: 0, w: 2, h: rows }];

	for (let index = 0; index < sideCount; index += 1) {
		cells.push({
			x: 2 + (index % sideColumns),
			y: Math.floor(index / sideColumns),
			w: 1,
			h: 1,
		});
	}

	return { columns: 2 + sideColumns, rows, cells };
}

export function buildEditorialLayout(count: number): CollageLayout {
	if (count < 4) return buildHeroSideLayout(count);

	const cells: CollageCell[] = [
		{ x: 0, y: 0, w: 3, h: 2 },
		{ x: 3, y: 0, w: 2, h: 2 },
	];
	const remaining = count - cells.length;
	const bottomRows = Math.ceil(remaining / 5);

	for (let index = 0; index < remaining; index += 1) {
		cells.push({
			x: index % 5,
			y: 2 + Math.floor(index / 5),
			w: 1,
			h: 1,
		});
	}

	return { columns: 5, rows: 2 + bottomRows, cells };
}

export function buildMosaicLayout(count: number): CollageLayout {
	const patterns: Record<number, CollageLayout> = {
		3: {
			columns: 4,
			rows: 3,
			cells: [
				{ x: 0, y: 0, w: 2, h: 3 },
				{ x: 2, y: 0, w: 2, h: 1 },
				{ x: 2, y: 1, w: 2, h: 2 },
			],
		},
		4: {
			columns: 4,
			rows: 4,
			cells: [
				{ x: 0, y: 0, w: 2, h: 4 },
				{ x: 2, y: 0, w: 2, h: 2 },
				{ x: 2, y: 2, w: 1, h: 2 },
				{ x: 3, y: 2, w: 1, h: 2 },
			],
		},
		5: {
			columns: 5,
			rows: 4,
			cells: [
				{ x: 0, y: 0, w: 2, h: 2 },
				{ x: 2, y: 0, w: 3, h: 2 },
				{ x: 0, y: 2, w: 1, h: 2 },
				{ x: 1, y: 2, w: 2, h: 2 },
				{ x: 3, y: 2, w: 2, h: 2 },
			],
		},
		6: {
			columns: 6,
			rows: 4,
			cells: [
				{ x: 0, y: 0, w: 3, h: 2 },
				{ x: 3, y: 0, w: 3, h: 2 },
				{ x: 0, y: 2, w: 2, h: 2 },
				{ x: 2, y: 2, w: 1, h: 2 },
				{ x: 3, y: 2, w: 1, h: 2 },
				{ x: 4, y: 2, w: 2, h: 2 },
			],
		},
	};

	return patterns[count] || buildEditorialLayout(count);
}

export function buildStoryLayout(count: number): CollageLayout {
	const safeCount = normalizeCount(count);

	return {
		columns: 1,
		rows: safeCount,
		cells: Array.from({ length: safeCount }, (_, index) => ({
			x: 0,
			y: index,
			w: 1,
			h: 1,
		})),
	};
}

export function buildPanoramaLayout(count: number): CollageLayout {
	const safeCount = normalizeCount(count);
	const columns = Math.min(safeCount, 6);
	const rows = Math.ceil(safeCount / columns);

	return {
		columns,
		rows,
		cells: Array.from({ length: safeCount }, (_, index) => ({
			x: index % columns,
			y: Math.floor(index / columns),
			w: 1,
			h: 1,
		})),
	};
}

export function buildFilmStripLayout(count: number): CollageLayout {
	const safeCount = normalizeCount(count);

	return {
		columns: safeCount,
		rows: 1,
		cells: Array.from({ length: safeCount }, (_, index) => ({
			x: index,
			y: 0,
			w: 1,
			h: 1,
		})),
	};
}

export function buildScrapbookLayout(count: number): CollageLayout {
	return layoutFromPattern(
		5,
		6,
		[
			{ x: 0, y: 0, w: 3, h: 2 },
			{ x: 3, y: 0, w: 2, h: 3 },
			{ x: 0, y: 2, w: 2, h: 2 },
			{ x: 2, y: 2, w: 1, h: 2 },
			{ x: 0, y: 4, w: 3, h: 2 },
			{ x: 3, y: 3, w: 2, h: 3 },
		],
		count,
	);
}

export function buildMoodBoardLayout(count: number): CollageLayout {
	return layoutFromPattern(
		6,
		5,
		[
			{ x: 0, y: 0, w: 2, h: 3 },
			{ x: 2, y: 0, w: 2, h: 2 },
			{ x: 4, y: 0, w: 2, h: 3 },
			{ x: 2, y: 2, w: 2, h: 3 },
			{ x: 0, y: 3, w: 1, h: 2 },
			{ x: 1, y: 3, w: 1, h: 2 },
			{ x: 4, y: 3, w: 1, h: 2 },
			{ x: 5, y: 3, w: 1, h: 2 },
		],
		count,
	);
}

export function buildSocialStoryLayout(count: number): CollageLayout {
	return layoutFromPattern(
		3,
		6,
		[
			{ x: 0, y: 0, w: 3, h: 3 },
			{ x: 0, y: 3, w: 1, h: 2 },
			{ x: 1, y: 3, w: 2, h: 2 },
			{ x: 0, y: 5, w: 2, h: 1 },
			{ x: 2, y: 5, w: 1, h: 1 },
		],
		count,
	);
}

export function buildWeddingLayout(count: number): CollageLayout {
	return layoutFromPattern(
		4,
		5,
		[
			{ x: 0, y: 0, w: 2, h: 2 },
			{ x: 2, y: 0, w: 2, h: 2 },
			{ x: 0, y: 2, w: 1, h: 3 },
			{ x: 1, y: 2, w: 2, h: 3 },
			{ x: 3, y: 2, w: 1, h: 3 },
		],
		count,
	);
}

export function buildTravelLayout(count: number): CollageLayout {
	return layoutFromPattern(
		5,
		3,
		[
			{ x: 0, y: 0, w: 3, h: 3 },
			{ x: 3, y: 0, w: 2, h: 1 },
			{ x: 3, y: 1, w: 1, h: 2 },
			{ x: 4, y: 1, w: 1, h: 2 },
		],
		count,
	);
}

export function buildProductLayout(count: number): CollageLayout {
	return layoutFromPattern(
		4,
		4,
		[
			{ x: 0, y: 0, w: 4, h: 2 },
			{ x: 0, y: 2, w: 1, h: 2 },
			{ x: 1, y: 2, w: 1, h: 2 },
			{ x: 2, y: 2, w: 1, h: 2 },
			{ x: 3, y: 2, w: 1, h: 2 },
		],
		count,
	);
}
