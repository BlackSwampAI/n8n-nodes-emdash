import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuReorderItems = {
	resource: ['menu'],
	operation: ['reorderItems'],
};

export const menuReorderItemsDescription: INodeProperties[] = [
	{
		displayName: 'Items',
		name: 'items',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: {
			show: showOnlyForMenuReorderItems,
		},
		description:
			'JSON string or native array expression of menu items to reorder ([{ ID, parentId, sortOrder }])',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForMenuReorderItems,
		},
		options: [
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'Target BCP-47 locale code (query parameter)',
				routing: {
					request: {
						qs: {
							locale: '={{$value || undefined}}',
						},
					},
				},
			},
		],
	},
];
