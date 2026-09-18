export const templates = [
	{
		id: 'square-and-two-inch',
		label: '1x1 + 2x2',
		slots: ['square'],
		layout: [
			{ size: '1x1', slot: 'square', count: 7 },
			{ size: '1x1', slot: 'square', count: 7 },
			{ size: '2x2', slot: 'square', count: 3 },
			{ size: '2x2', slot: 'square', count: 3 },
		],
	},
	{
		id: 'square-and-one-point-five-inch',
		label: '1x1 + 1.5x1.5',
		slots: ['square'],
		layout: [
			{ size: '1x1', slot: 'square', count: 7 },
			{ size: '1x1', slot: 'square', count: 7 },
			{ size: '1.5x1.5', slot: 'square', count: 5 },
			{ size: '1.5x1.5', slot: 'square', count: 5 },
		],
	},
	{
		id: 'square-and-passport',
		label: '1x1 + Passport',
		slots: ['square', 'passport'],
		layout: [
			{ size: '1x1', slot: 'square', count: 7 },
			{ size: '1x1', slot: 'square', count: 7 },
			{ size: 'passport', slot: 'passport', count: 5 },
			{ size: 'passport', slot: 'passport', count: 5 },
		],
	},
	{
		id: 'passport',
		label: 'Passport',
		slots: ['passport'],
		layout: [
			{ size: 'passport', slot: 'passport', count: 5 },
			{ size: 'passport', slot: 'passport', count: 5 },
			{ size: 'passport', slot: 'passport', count: 5 },
		],
	},
	{
		id: 'all-sizes',
		label: 'All Sizes (1x1 + 1.5x1.5 + 2x2 + Passport)',
		slots: ['square', 'passport'],
		layout: [
			{ size: '1x1', slot: 'square', count: 7 },
			{ size: '1.5x1.5', slot: 'square', count: 5 },
			{ size: '2x2', slot: 'square', count: 3 },
			{ size: 'passport', slot: 'passport', count: 5 },
		],
	},
];

export function getTemplate(templateId) {
	return templates.find((template) => template.id === templateId);
}
