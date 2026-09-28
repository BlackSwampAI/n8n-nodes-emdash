import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTaxonomyUpdate = {
	resource: ['taxonomy'],
	operation: ['updateTaxonomy'],
};

export const taxonomyUpdateTaxonomyDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForTaxonomyUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Collections',
				name: 'collections',
				type: 'string',
				default: '',
				description:
					'Comma-separated list of collection slugs or JSON array of collection slugs to attach this taxonomy to',
				routing: {
					send: {
						type: 'body',
						property: 'collections',
						value:
							'={{ Array.isArray($value) ? $value : typeof $value === "string" ? $value.split(",").map((s) => s.trim()).filter(Boolean) : [] }}',
					},
				},
			},
			{
				displayName: 'Hierarchical',
				name: 'hierarchical',
				type: 'boolean',
				default: false,
				description: 'Whether terms in this taxonomy can have parent-child relationships',
				routing: {
					send: {
						type: 'body',
						property: 'hierarchical',
					},
				},
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'Human-readable plural display name',
				routing: {
					send: {
						type: 'body',
						property: 'label',
					},
				},
			},
			{
				displayName: 'Label Singular',
				name: 'labelSingular',
				type: 'string',
				default: '',
				description: 'Human-readable singular display name',
				routing: {
					send: {
						type: 'body',
						property: 'labelSingular',
					},
				},
			},
		],
	},
];
