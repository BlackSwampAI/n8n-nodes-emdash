import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRedirectCreate = {
	resource: ['redirect'],
	operation: ['createRedirect'],
};

export const redirectCreateRedirectDescription: INodeProperties[] = [
	{
		displayName: 'Source',
		name: 'source',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForRedirectCreate,
		},
		description: 'The incoming source path or pattern to redirect from (e.g. /old-path or /blog/*)',
		routing: {
			send: {
				type: 'body',
				property: 'source',
			},
		},
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: '301 (Moved Permanently)', value: 301 },
			{ name: '302 (Found / Temporary Redirect)', value: 302 },
			{ name: '307 (Temporary Redirect)', value: 307 },
			{ name: '308 (Permanent Redirect)', value: 308 },
			{ name: '410 (Gone)', value: 410 },
			{ name: '451 (Unavailable For Legal Reasons)', value: 451 },
		],
		default: 301,
		displayOptions: {
			show: showOnlyForRedirectCreate,
		},
		description: 'HTTP status code to return for this redirect or error response',
		routing: {
			send: {
				type: 'body',
				property: 'type',
			},
		},
	},
	{
		displayName: 'Destination',
		name: 'destination',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForRedirectCreate,
			hide: {
				type: [410, 451],
			},
		},
		description:
			'Target destination URL or path. Required for 301, 302, 307, 308; omit for 410 (Gone) or 451 (Unavailable For Legal Reasons).',
		routing: {
			send: {
				type: 'body',
				property: 'destination',
				value: '={{$value || undefined}}',
			},
		},
	},
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: showOnlyForRedirectCreate,
		},
		description: 'Whether the redirect rule is active',
		routing: {
			send: {
				type: 'body',
				property: 'enabled',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForRedirectCreate,
		},
		default: {},
		options: [
			{
				displayName: 'Group Name',
				name: 'groupName',
				type: 'string',
				default: '',
				description: 'Optional group name to categorize this redirect rule',
				routing: {
					send: {
						type: 'body',
						property: 'groupName',
						value: '={{$value || undefined}}',
					},
				},
			},
		],
	},
];
