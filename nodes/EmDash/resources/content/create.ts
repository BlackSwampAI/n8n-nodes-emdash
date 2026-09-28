import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentCreate = {
	resource: ['content'],
	operation: ['create'],
};

export const contentCreateDescription: INodeProperties[] = [
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		required: true,
		default: '{}',
		displayOptions: {
			show: showOnlyForContentCreate,
		},
		description: 'Field values for the content entry as a JSON object',
		routing: {
			send: {
				type: 'body',
				property: 'data',
				value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForContentCreate,
		},
		default: {},
		options: [
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'BCP-47 locale code for this entry variant (e.g. en, fr, de)',
				routing: {
					send: {
						type: 'body',
						property: 'locale',
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
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'Custom URL slug for the entry',
				routing: {
					send: {
						type: 'body',
						property: 'slug',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [{ name: 'Draft', value: 'draft' }],
				default: 'draft',
				description: 'Initial entry status (must be draft)',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},
			{
				displayName: 'Taxonomies',
				name: 'taxonomies',
				type: 'json',
				default: '{}',
				description:
					'Taxonomy term assignments as a JSON object ({ taxonomyName: [termSlug, ...] })',
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
