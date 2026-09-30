import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentReleaseLock = {
	resource: ['content'],
	operation: ['releaseLock'],
};

export const contentReleaseLockDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForContentReleaseLock,
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
