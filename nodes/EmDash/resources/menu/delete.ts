import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuDelete = {
	resource: ['menu'],
	operation: ['delete'],
};

export const menuDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForMenuDelete,
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
