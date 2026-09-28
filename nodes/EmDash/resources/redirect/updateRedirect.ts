import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRedirectUpdate = {
	resource: ['redirect'],
	operation: ['updateRedirect'],
};

export const redirectUpdateRedirectDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForRedirectUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				default: '',
				description: 'The target destination URL or path',
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
				description: 'Whether the redirect rule is active',
				routing: {
					send: {
						type: 'body',
						property: 'enabled',
					},
				},
			},
			{
				displayName: 'Group Name',
				name: 'groupName',
				type: 'string',
				default: '',
				description: 'Optional group name to categorize this redirect',
				routing: {
					send: {
						type: 'body',
						property: 'groupName',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'The source path or pattern to redirect from',
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
				description: 'The HTTP status code for this redirect',
				routing: {
					send: {
						type: 'body',
						property: 'type',
					},
				},
			},
		],
	},
];
