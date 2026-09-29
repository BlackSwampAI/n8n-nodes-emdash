import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuDelete = {
	resource: ['menu'],
	operation: ['delete'],
};

export const menuDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForMenuDelete,
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
