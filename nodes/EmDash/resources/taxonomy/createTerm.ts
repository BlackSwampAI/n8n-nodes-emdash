import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTaxonomyCreateTerm = {
	resource: ['taxonomy'],
	operation: ['createTerm'],
};

export const taxonomyCreateTermDescription: INodeProperties[] = [
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForTaxonomyCreateTerm,
		},
		description: 'The human-readable label for the term',
		routing: {
			send: {
				type: 'body',
				property: 'label',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForTaxonomyCreateTerm,
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Optional description of the term',
				routing: {
					send: {
						type: 'body',
						property: 'description',
					},
				},
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'BCP-47 locale code for this term variant',
				routing: {
					send: {
						type: 'body',
						property: 'locale',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				description: 'ID of the parent term for hierarchical taxonomies',
				routing: {
					send: {
						type: 'body',
						property: 'parentId',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'URL-safe identifier for the term (auto-generated from label if omitted)',
				routing: {
					send: {
						type: 'body',
						property: 'slug',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Translation Of',
				name: 'translationOf',
				type: 'string',
				default: '',
				description: 'ID of the canonical term this term translates',
				routing: {
					send: {
						type: 'body',
						property: 'translationOf',
						value: '={{$value || undefined}}',
					},
				},
			},
		],
	},
];
