import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuGet = {
	resource: ['menu'],
	operation: ['get'],
};

export const menuGetDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForMenuGet,
		},
		options: [
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'Filter menu and items by BCP-47 locale code (e.g. en, fr, de)',
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
