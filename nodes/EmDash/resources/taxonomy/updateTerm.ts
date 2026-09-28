import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTaxonomyUpdateTerm = {
	resource: ['taxonomy'],
	operation: ['updateTerm'],
};

export const taxonomyUpdateTermDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForTaxonomyUpdateTerm,
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Updated description for the term',
				routing: {
					send: {
						type: 'body',
						property: 'description',
					},
				},
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'Updated human-readable label for the term',
				routing: {
					send: {
						type: 'body',
						property: 'label',
					},
				},
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				description: 'Updated parent term ID, or empty to move to root',
				routing: {
					send: {
						type: 'body',
						property: 'parentId',
						value: '={{$value || null}}',
					},
				},
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'Updated URL-safe slug for the term',
				routing: {
					send: {
						type: 'body',
						property: 'slug',
						value: '={{$value || undefined}}',
					},
				},
			},
		],
	},
];
