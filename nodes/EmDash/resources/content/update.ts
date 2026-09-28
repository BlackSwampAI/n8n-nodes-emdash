import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentUpdate = {
	resource: ['content'],
	operation: ['update'],
};

export const contentUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		required: true,
		default: '{}',
		displayOptions: {
			show: showOnlyForContentUpdate,
		},
		description: 'Updated field values for the content entry as a JSON object',
		routing: {
			send: {
				type: 'body',
				property: 'data',
				value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForContentUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'BCP-47 locale code filter (query parameter)',
				routing: {
					request: {
						qs: {
							locale: '={{$value || undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Override Lock',
				name: 'overrideLock',
				type: 'boolean',
				default: false,
				description: 'Whether to update even if another editor holds the edit lock',
				routing: {
					send: {
						type: 'body',
						property: 'overrideLock',
					},
				},
			},
			{
				displayName: 'Revision (_Rev)',
				name: '_rev',
				type: 'string',
				default: '',
				description: 'Opaque revision token for optimistic concurrency control',
				routing: {
					send: {
						type: 'body',
						property: '_rev',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'SEO',
				name: 'seo',
				type: 'json',
				default: '{}',
				description:
					'SEO metadata as a JSON object ({ title, description, image, canonical, noIndex })',
				routing: {
					send: {
						type: 'body',
						property: 'seo',
						value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
					},
				},
			},
			{
				displayName: 'Skip Revision',
				name: 'skipRevision',
				type: 'boolean',
				default: false,
				description: 'Whether to skip creating a new revision snapshot for this update',
				routing: {
					send: {
						type: 'body',
						property: 'skipRevision',
					},
				},
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'Updated URL slug for the entry',
				routing: {
					send: {
						type: 'body',
						property: 'slug',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Taxonomies',
				name: 'taxonomies',
				type: 'json',
				default: '{}',
				description:
					'Replace taxonomy term assignments ({ taxonomyName: [termSlug, ...] }). Pass empty array to clear.',
				routing: {
					send: {
						type: 'body',
						property: 'taxonomies',
						value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
					},
				},
			},
		],
	},
];
