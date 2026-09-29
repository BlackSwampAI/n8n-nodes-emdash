import type { INodeProperties } from 'n8n-workflow';
import { collectionSupportOptions } from './createCollection';

const showOnlyForSchemaUpdateCollection = {
	resource: ['schema'],
	operation: ['updateCollection'],
};

export const schemaUpdateCollectionDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForSchemaUpdateCollection,
		},
		options: [
			{
				displayName: 'Admin (JSON)',
				name: 'admin',
				type: 'json',
				default: '{}',
				description: 'Admin UI configuration (e.g. listColumns, quickCreate) as a JSON object',
			},
			{
				displayName: 'Clear Sort Order',
				name: 'clearSortOrder',
				type: 'boolean',
				default: false,
				description:
					'Whether to clear the explicit sort order position, falling back to default alphabetical ordering. Mutually exclusive with Sort Order.',
			},
			{
				displayName: 'Comments Auto-Approve Users',
				name: 'commentsAutoApproveUsers',
				type: 'boolean',
				default: false,
				description: 'Whether comments from authenticated users are automatically approved',
			},
			{
				displayName: 'Comments Closed After Days',
				name: 'commentsClosedAfterDays',
				type: 'number',
				default: 0,
				description:
					'Close comments automatically after this many days (0 to disable automatic closing)',
			},
			{
				displayName: 'Comments Enabled',
				name: 'commentsEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether comments are enabled for entries in this collection',
			},
			{
				displayName: 'Comments Moderation',
				name: 'commentsModeration',
				type: 'options',
				options: [
					{ name: 'All Comments', value: 'all' },
					{ name: 'First-Time Commenters Only', value: 'first_time' },
					{ name: 'None (Auto-Approve All)', value: 'none' },
				],
				default: 'all',
				description: 'Comment moderation requirement level',
			},
			{
				displayName: 'Date Field',
				name: 'dateField',
				type: 'string',
				default: '',
				description: 'Slug of the custom field to use as the primary publication/event date',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Brief description of the collection',
			},
			{
				displayName: 'Edit Locking',
				name: 'editLocking',
				type: 'boolean',
				default: true,
				description: 'Whether concurrent edit locking is enabled for this collection',
			},
			{
				displayName: 'Group',
				name: 'group',
				type: 'string',
				default: '',
				description: 'Admin sidebar navigation group folder label (set empty or "null" to ungroup)',
			},
			{
				displayName: 'Has SEO',
				name: 'hasSeo',
				type: 'boolean',
				default: true,
				description: 'Whether SEO metadata fields are enabled for entries in this collection',
			},
			{
				displayName: 'Hidden',
				name: 'hidden',
				type: 'boolean',
				default: false,
				description: 'Whether this collection is hidden from the admin navigation',
			},
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'string',
				default: '',
				description: 'Phosphor icon name for the admin UI',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'Human-readable display name of the collection',
			},
			{
				displayName: 'Label (Singular)',
				name: 'labelSingular',
				type: 'string',
				default: '',
				description: 'Singular label for individual items in the collection',
			},
			{
				displayName: 'Routable',
				name: 'routable',
				type: 'boolean',
				default: true,
				description: 'Whether entries in this collection generate public frontend routes',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'number',
				default: 0,
				description:
					'Sort order position in the admin navigation sidebar (integer). To clear explicit position and revert to alphabetical order, enable Clear Sort Order or pass null.',
			},
			{
				displayName: 'Supports',
				name: 'supports',
				type: 'multiOptions',
				options: collectionSupportOptions,
				default: [],
				description: 'Features enabled for entries in this collection',
			},
			{
				displayName: 'Title Field',
				name: 'titleField',
				type: 'string',
				default: '',
				description: 'Slug of the custom field to use as the primary display title',
			},
			{
				displayName: 'URL Pattern',
				name: 'urlPattern',
				type: 'string',
				default: '',
				description:
					'URL pattern template for content items (e.g. /posts/{slug} or /blog/{year}/{slug})',
			},
		],
	},
];
