import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentAcquireLock = {
	resource: ['content'],
	operation: ['acquireLock'],
};

export const contentAcquireLockDescription: INodeProperties[] = [
	{
		displayName: 'Takeover',
		name: 'takeover',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForContentAcquireLock,
		},
		description:
			'Whether the caller may take the edit lock from the current holder if their permissions allow it. When enabled, this can disrupt another editor.',
	},
	{
		displayName: 'Token',
		name: 'token',
		type: 'string',
		typeOptions: { password: true, maxLength: 128 },
		default: '',
		displayOptions: {
			show: showOnlyForContentAcquireLock,
		},
		description:
			'Identifies the caller’s editing session. Pass the same token on Release so one session does not unintentionally release a lock another session still relies on.',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForContentAcquireLock,
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
