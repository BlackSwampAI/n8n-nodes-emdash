import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSearchQuery = {
	resource: ['search'],
	operation: ['search'],
};

export const searchSearchDescription: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSearchQuery,
		},
		description: 'The search query string to match against indexed content',
		routing: {
			request: {
				qs: {
					q: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForSearchQuery,
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
				...showOnlyForSearchQuery,
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
			show: showOnlyForSearchQuery,
		},
		default: {},
		options: [
			{
				displayName: 'Collections',
				name: 'collections',
				type: 'string',
				default: '',
				description: 'Filter by collection slug(s), comma-separated (e.g. posts, pages)',
				routing: {
					request: {
						qs: {
							collections: '={{$value || undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
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
				displayName: 'Scope',
				name: 'scope',
				type: 'options',
				options: [
					{ name: 'All Fields', value: 'all' },
					{ name: 'Title Only', value: 'title' },
				],
				default: 'all',
				description: 'Search scope: match across all indexed fields or title only',
				routing: {
					request: {
						qs: {
							scope: '={{$value === "all" ? undefined : $value}}',
						},
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Archived', value: 'archived' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Published', value: 'published' },
					{ name: 'Scheduled', value: 'scheduled' },
				],
				default: 'all',
				description: 'Filter entries by publication status',
				routing: {
					request: {
						qs: {
							status: '={{$value === "all" ? undefined : $value}}',
						},
					},
				},
			},
		],
	},
];
