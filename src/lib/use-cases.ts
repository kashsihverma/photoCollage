export interface UseCasePage {
	slug: string;
	title: string;
	description: string;
	label: string;
	heading: string;
	intro: string;
	uses: string[];
	tips: string[];
	faq: Array<{ question: string; answer: string }>;
	templates: string[];
}

export const useCasePages: UseCasePage[] = [
	{
		slug: 'photo-collage-maker',
		title: 'Free Photo Collage Maker Online | No Account Required',
		description: 'Make a photo collage online in your browser with templates, smart layouts, text, stickers, and PNG/JPG export.',
		label: 'Core use case',
		heading: 'Free Online Photo Collage Maker',
		intro:
			'Start with uploads or a template, generate a balanced layout, adjust every layer, and download a clean collage without creating an account.',
		uses: ['Family memory pages', 'Event recaps', 'Portfolio boards', 'Printable photo layouts'],
		tips: ['Choose one hero image first.', 'Keep captions short.', 'Use one background style across the whole collage.'],
		templates: ['Photo Dump', 'Moodboard Studio', 'Gallery Poster'],
		faq: [
			{
				question: 'Do I need an account to make a collage?',
				answer: 'No. The editor opens directly in the browser and lets you create and download a collage without signing in.',
			},
			{
				question: 'Can I download as PNG or JPG?',
				answer: 'Yes. Pick PNG or JPG in the toolbar, then download the finished collage.',
			},
		],
	},
	{
		slug: 'instagram-collage-maker',
		title: 'Instagram Collage Maker | Story and Post Templates',
		description: 'Create Instagram story and post collages with vertical, square, and portrait templates for fast social sharing.',
		label: 'Social media',
		heading: 'Instagram Collage Maker',
		intro:
			'Design story and feed collages with ready-made canvas sizes, photo frames, captions, stickers, and export settings for Instagram.',
		uses: ['Story photo dumps', 'Feed recap posts', 'Carousel covers', 'Launch announcements'],
		tips: ['Use vertical story layouts for phone viewing.', 'Keep important faces away from edges.', 'Use high-contrast text for small screens.'],
		templates: ['Story Recap Gallery', 'Scrapbook Zine', 'Clean Recap'],
		faq: [
			{
				question: 'What size should I use for Instagram stories?',
				answer: 'Use the Story preset for a vertical 9:16 canvas.',
			},
			{
				question: 'Can I make a feed post collage?',
				answer: 'Yes. Use Square or Instagram post sizes for feed-ready exports.',
			},
		],
	},
	{
		slug: 'mood-board-maker',
		title: 'Mood Board Maker Online | Visual Direction Collages',
		description: 'Make mood boards online for visual direction, portfolios, interiors, branding, outfits, and creative planning.',
		label: 'Planning',
		heading: 'Online Mood Board Maker',
		intro:
			'Collect visual references into a polished mood board with clean grids, editorial captions, background tones, and style-focused filters.',
		uses: ['Brand direction', 'Interior ideas', 'Outfit planning', 'Portfolio concepts'],
		tips: ['Mix close-up details with wide shots.', 'Use matte or mono filters for consistency.', 'Leave space for notes and labels.'],
		templates: ['Moodboard Studio', 'Minimal Mood', 'Aesthetic Zine'],
		faq: [
			{
				question: 'Can I use this for a brand mood board?',
				answer: 'Yes. Upload references, choose an aesthetic template, then add short labels or direction notes.',
			},
			{
				question: 'Can I change the mood board size?',
				answer: 'Yes. Use the size dropdown to switch between square, story, portrait, wide, and print-friendly sizes.',
			},
		],
	},
	{
		slug: 'birthday-photo-collage',
		title: 'Birthday Photo Collage Maker | Party Recap Templates',
		description: 'Create birthday photo collages with party templates, playful stickers, captions, and quick PNG/JPG export.',
		label: 'Celebrations',
		heading: 'Birthday Photo Collage Maker',
		intro:
			'Turn party photos into a birthday recap, invite, story, or keepsake with bright templates and easy browser editing.',
		uses: ['Birthday stories', 'Party invites', 'Yearly recaps', 'Family keepsakes'],
		tips: ['Pick a warm background for celebration photos.', 'Use one large hero image.', 'Add the date as a small caption.'],
		templates: ['Birthday Pop', 'Birthday Invite', 'Year Recap Gallery'],
		faq: [
			{
				question: 'Can I make a birthday story collage?',
				answer: 'Yes. Choose a Story template, add party photos, then export the vertical image for sharing.',
			},
			{
				question: 'Can I add birthday text?',
				answer: 'Yes. Use the Text panel to add or edit birthday captions and names.',
			},
		],
	},
	{
		slug: 'travel-photo-collage',
		title: 'Travel Photo Collage Maker | Vacation Recap Layouts',
		description: 'Create travel photo collages for vacation stories, postcards, recaps, and social posts in your browser.',
		label: 'Travel',
		heading: 'Travel Photo Collage Maker',
		intro:
			'Build a travel recap with postcard-style frames, map-inspired layouts, location captions, and quick social export.',
		uses: ['Vacation stories', 'Postcard layouts', 'Trip recaps', 'Travel mood boards'],
		tips: ['Combine landmarks, people, and detail shots.', 'Use a wide layout for landscapes.', 'Add a location or date caption.'],
		templates: ['Travel Story', 'Postcard', 'Travel Mood'],
		faq: [
			{
				question: 'Can I make a vacation recap?',
				answer: 'Yes. Upload trip photos and use a story, wide, or post template for a quick recap.',
			},
			{
				question: 'Can I make a printable travel collage?',
				answer: 'Yes. Use poster or portrait sizes for print-friendly layouts.',
			},
		],
	},
	{
		slug: 'facebook-cover-collage',
		title: 'Facebook Cover Collage Maker | Wide Photo Layouts',
		description: 'Make a wide Facebook cover collage with centered content, clean spacing, text, and high-resolution export.',
		label: 'Cover images',
		heading: 'Facebook Cover Collage Maker',
		intro:
			'Create a wide cover image that keeps faces and important text near the center so it works across desktop and mobile previews.',
		uses: ['Profile covers', 'Page banners', 'Event headers', 'Business highlights'],
		tips: ['Use the wide size preset.', 'Keep text centered.', 'Avoid placing key details at the far edges.'],
		templates: ['Weekend Album', 'Postcard', 'Family Weekend'],
		faq: [
			{
				question: 'What layout works best for a Facebook cover?',
				answer: 'Use a wide layout and keep important details near the middle of the canvas.',
			},
			{
				question: 'Can I add text to the cover?',
				answer: 'Yes. Add text layers, then adjust size, color, and alignment in the inspector.',
			},
		],
	},
	{
		slug: 'printable-photo-collage',
		title: 'Printable Photo Collage Maker | Poster and Portrait Layouts',
		description: 'Create printable photo collages with poster, portrait, and A4-style layouts for keepsakes and gifts.',
		label: 'Print',
		heading: 'Printable Photo Collage Maker',
		intro:
			'Design a print-friendly collage with portrait, poster, or A4-style sizes, clean image spacing, and high-resolution PNG/JPG export.',
		uses: ['Gift prints', 'Wedding boards', 'Class projects', 'Memory posters'],
		tips: ['Use high-resolution photos.', 'Avoid tiny captions for print.', 'Choose clean frames for a polished result.'],
		templates: ['Happy Wedding Botanical', 'Gallery Poster', 'Film Board'],
		faq: [
			{
				question: 'Can I print the downloaded collage?',
				answer: 'Yes. Use a print-friendly size and download a high-resolution PNG or JPG.',
			},
			{
				question: 'Which templates are best for print?',
				answer: 'Poster, portrait, and A4-style templates usually work best for printable collages.',
			},
		],
	},
];

export function getUseCasePage(slug: string): UseCasePage | undefined {
	return useCasePages.find((page) => page.slug === slug);
}
