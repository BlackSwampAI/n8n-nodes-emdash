import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSchemaCreateCollection = {
	resource: ['schema'],
	operation: ['createCollection'],
};

export const collectionSupportOptions = [
	{ name: 'Drafts', value: 'drafts' },
	{ name: 'Preview', value: 'preview' },
	{ name: 'Revisions', value: 'revisions' },
	{ name: 'Scheduling', value: 'scheduling' },
	{ name: 'Search', value: 'search' },
	{ name: 'SEO', value: 'seo' },
];

export const schemaCreateCollectionDescription: INodeProperties[] = [
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSchemaCreateCollection,
		},
		description:
			'Unique URL-safe identifier for the collection (lowercase letters, numbers, and underscores, starting with a letter, 1–63 characters)',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSchemaCreateCollection,
		},
		description: 'Human-readable display name of the collection',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForSchemaCreateCollection,
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
				description: 'Admin sidebar navigation group folder label',
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
				description: 'Sort order position in the admin navigation sidebar',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: 'manual',
				description: 'Origin of the collection (e.g. manual, template:name, import:source)',
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
