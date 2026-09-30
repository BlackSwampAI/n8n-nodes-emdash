import type { INodeProperties } from 'n8n-workflow';
import { cursorPaginationOperations } from '../../shared/transport';

const showOnlyForCommentGetAll = {
	resource: ['comment'],
	operation: ['getAll'],
};

export const commentGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForCommentGetAll,
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
				...showOnlyForCommentGetAll,
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
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: showOnlyForCommentGetAll,
		},
		options: [
			{ name: 'Pending', value: 'pending' },
			{ name: 'Approved', value: 'approved' },
			{ name: 'Spam', value: 'spam' },
			{ name: 'Trash', value: 'trash' },
		],
		default: 'pending',
		description:
			'Moderation status to list comments for. EmDash organizes comments into status-based moderation queues; defaults to Pending.',
		routing: {
			request: {
				qs: {
					status: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Filter',
		},
		displayOptions: {
			show: showOnlyForCommentGetAll,
		},
		default: {},
		options: [
			{
				displayName: 'Collection',
				name: 'collection',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a collection...',
						typeOptions: {
							searchListMethod: 'getCollections',
							searchable: true,
						},
					},
					{
						displayName: 'By Slug',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. posts',
					},
				],
				description: 'Filter comments by collection slug',
				routing: {
					request: {
						qs: {
							collection:
								'={{ (typeof $value === "object" && $value !== null ? $value.value : $value) || undefined }}',
						},
					},
				},
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Filter comments by search string matching author or comment body',
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

export const commentGetManyDescription = commentGetAllDescription;
