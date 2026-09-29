import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentReleaseLock = {
	resource: ['content'],
	operation: ['releaseLock'],
};

export const contentReleaseLockDescription: INodeProperties[] = [
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForContentReleaseLock,
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
	{
		displayName: 'Token',
		name: 'token',
		type: 'string',
		typeOptions: { password: true, maxLength: 128 },
		default: '',
		displayOptions: {
			show: showOnlyForContentReleaseLock,
		},
		description:
			'Identifies the caller’s editing session. Pass the same token used when acquiring the lock.',
		routing: {
			request: {
				qs: {
					token: '={{$value || undefined}}',
				},
			},
		},
	},
];
