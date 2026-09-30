import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuDeleteItem = {
	resource: ['menu'],
	operation: ['deleteItem'],
};

export const menuDeleteItemDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForMenuDeleteItem,
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
