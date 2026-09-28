import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentGet = {
	resource: ['content'],
	operation: ['get'],
};

export const contentGetDescription: INodeProperties[] = [
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForContentGet,
		},
		description: 'BCP-47 locale code to filter by (e.g. en, fr, de)',
		routing: {
			request: {
				qs: {
					locale: '={{$value || undefined}}',
				},
			},
		},
	},
];
