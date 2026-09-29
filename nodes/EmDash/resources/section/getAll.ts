import type { INodeProperties } from 'n8n-workflow';
import { cursorPaginationOperations } from '../../shared/transport';

const showOnlyForSectionGetAll = {
	resource: ['section'],
	operation: ['getAll'],
};

export const sectionGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForSectionGetAll,
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
			operations: cursorPaginationOperations,
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForSectionGetAll,
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
			show: showOnlyForSectionGetAll,
		},
		default: {},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search string to filter sections by title or description',
				routing: {
					send: {
						type: 'query',
						property: 'search',
					},
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'Import', value: 'import' },
					{ name: 'Theme', value: 'theme' },
					{ name: 'User', value: 'user' },
				],
				default: 'user',
				description: 'Filter sections by source origin',
				routing: {
					send: {
						type: 'query',
						property: 'source',
					},
				},
			},
		],
	},
];
