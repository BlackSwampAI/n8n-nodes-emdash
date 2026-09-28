import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTaxonomyReorderTerms = {
	resource: ['taxonomy'],
	operation: ['reorderTerms'],
};

export const taxonomyReorderTermsDescription: INodeProperties[] = [
	{
		displayName: 'Term IDs',
		name: 'ids',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForTaxonomyReorderTerms,
		},
		description: 'Ordered comma-separated list of term IDs or JSON array of term IDs',
		routing: {
			send: {
				type: 'body',
				property: 'ids',
				value:
					'={{ Array.isArray($value) ? $value : typeof $value === "string" ? $value.split(",").map((t) => t.trim()).filter(Boolean) : [] }}',
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
			show: showOnlyForTaxonomyReorderTerms,
		},
		options: [
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				description:
					'Parent term ID under which terms are being reordered (empty for top-level terms)',
				routing: {
					send: {
						type: 'body',
						property: 'parentId',
						value: '={{$value || undefined}}',
					},
				},
			},
		],
	},
];
