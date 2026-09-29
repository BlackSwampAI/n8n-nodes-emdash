import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentGetLock = {
	resource: ['content'],
	operation: ['getLock'],
};

export const contentGetLockDescription: INodeProperties[] = [
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForContentGetLock,
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
