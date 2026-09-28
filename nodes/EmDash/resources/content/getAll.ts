import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentGetMany = {
	resource: ['content'],
	operation: ['getAll'],
};

export const contentGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForContentGetMany,
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
				...showOnlyForContentGetMany,
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
			show: showOnlyForContentGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Author ID',
				name: 'authorId',
				type: 'string',
				default: '',
				description: 'Filter entries authored by this user ID',
				routing: {
					request: {
						qs: {
							authorId: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Date Field',
				name: 'dateField',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Published At', value: 'publishedAt' },
					{ name: 'Updated At', value: 'updatedAt' },
				],
				default: 'createdAt',
				description: 'Which timestamp column the date range filter applies to',
				routing: {
					request: {
						qs: {
							dateField: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Inclusive lower bound for the date range (requires dateField)',
				routing: {
					request: {
						qs: {
							dateFrom: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'Inclusive upper bound for the date range (requires dateField)',
				routing: {
					request: {
						qs: {
							dateTo: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'BCP-47 locale code to filter by (e.g. en, fr, es-419)',
				routing: {
					request: {
						qs: {
							locale: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Search Query',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search across display fields, slug, and searchable fields',
				routing: {
					request: {
						qs: {
							q: '={{$value}}',
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
					{ name: 'Future', value: 'future' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Private', value: 'private' },
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
