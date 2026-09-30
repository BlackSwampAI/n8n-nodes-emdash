import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentGet = {
	resource: ['content'],
	operation: ['get'],
};

export const contentGetDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForContentGet,
		},
		options: [
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'BCP-47 locale code to filter by (e.g. en, fr, de)',
			},
		],
	},
];
