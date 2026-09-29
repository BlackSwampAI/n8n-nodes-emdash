import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaGetMany = {
	resource: ['media'],
	operation: ['getAll'],
};

export const mediaGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForMediaGetMany,
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
				...showOnlyForMediaGetMany,
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
			show: showOnlyForMediaGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Folder ID',
				name: 'folderId',
				type: 'string',
				default: '',
				description: 'Filter by folder ID or use "unfiled" for items not in any folder',
				routing: {
					request: {
						qs: {
							folderId: '={{$value || undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Include Usage',
				name: 'includeUsage',
				type: 'boolean',
				default: false,
				description:
					'Whether to include a coverage-aware usage summary on each media item. Note: usage.count is null unless caller holds both RBAC content:read_drafts permission and admin token scope; for full usage details use Get Usage.',
				routing: {
					request: {
						qs: {
							includeUsage: '={{$value ? "1" : undefined}}',
						},
					},
				},
			},
			{
				displayName: 'MIME Type',
				name: 'mimeType',
				type: 'string',
				default: '',
				description: 'Filter media items by MIME type (e.g. image/jpeg, image/*)',
				routing: {
					request: {
						qs: {
							mimeType: '={{$value || undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Search Query',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Case-insensitive filename substring search (also matches extensions)',
				routing: {
					request: {
						qs: {
							q: '={{$value || undefined}}',
						},
					},
				},
			},
		],
	},
];
