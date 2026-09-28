import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRedirectGetAll = {
	resource: ['redirect'],
	operation: ['getAllRedirects'],
};

export const redirectGetAllRedirectsDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForRedirectGetAll,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
				type: 'query',
				property: 'limit',
				value: '100',
			},
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ !!$response.body?.data?.nextCursor }}',
						request: {
							qs: {
								cursor: '={{ $response.body?.data?.nextCursor }}',
							},
						},
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForRedirectGetAll,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Filter',
		},
		displayOptions: {
			show: showOnlyForRedirectGetAll,
		},
		default: {},
		options: [
			{
				displayName: 'Auto-Generated',
				name: 'auto',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Auto-Generated Only', value: 'true' },
					{ name: 'Manual Only', value: 'false' },
				],
				default: 'all',
				description: 'Filter by whether redirect was automatically generated',
				routing: {
					request: {
						qs: {
							auto: '={{$value === "all" ? undefined : ($value === "true")}}',
						},
					},
				},
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Enabled Only', value: 'true' },
					{ name: 'Disabled Only', value: 'false' },
				],
				default: 'all',
				description: 'Filter by active status',
				routing: {
					request: {
						qs: {
							enabled: '={{$value === "all" ? undefined : ($value === "true")}}',
						},
					},
				},
			},
			{
				displayName: 'Group',
				name: 'group',
				type: 'string',
				default: '',
				description: 'Filter redirects belonging to this group name',
				routing: {
					request: {
						qs: {
							group: '={{$value || undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search pattern matching source or destination path',
				routing: {
					request: {
						qs: {
							search: '={{$value || undefined}}',
						},
					},
				},
			},
		],
	},
];
