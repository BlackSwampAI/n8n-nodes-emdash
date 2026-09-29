import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuUpdate = {
	resource: ['menu'],
	operation: ['update'],
};

export const menuUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMenuUpdate,
		},
		description: 'Updated human-readable label for the menu',
		routing: {
			send: {
				type: 'body',
				property: 'label',
			},
		},
	},
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForMenuUpdate,
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
