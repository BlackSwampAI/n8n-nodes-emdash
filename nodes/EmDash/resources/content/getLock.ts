import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentGetLock = {
	resource: ['content'],
	operation: ['getLock'],
};

export const contentGetLockDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForContentGetLock,
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
