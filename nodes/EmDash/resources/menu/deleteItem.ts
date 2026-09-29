import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuDeleteItem = {
	resource: ['menu'],
	operation: ['deleteItem'],
};

export const menuDeleteItemDescription: INodeProperties[] = [
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForMenuDeleteItem,
		},
		description: 'Target BCP-47 locale code (query parameter)',
		routing: {
			request: {
				qs: {
					locale: '={{$value || undefined}}',
				},
			},
		},
	},
];
