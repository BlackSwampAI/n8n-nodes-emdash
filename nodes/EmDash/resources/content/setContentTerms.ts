import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentSetTerms = {
	resource: ['content'],
	operation: ['setContentTerms'],
};

export const contentSetTermsDescription: INodeProperties[] = [
	{
		displayName: 'Taxonomy',
		name: 'taxonomy',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForContentSetTerms,
		},
		description: 'The name of the taxonomy (e.g. categories, tags)',
	},
	{
		displayName: 'Term IDs',
		name: 'termIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForContentSetTerms,
		},
		description: 'Comma-separated list of term IDs or JSON array of term IDs to assign',
		routing: {
			send: {
				type: 'body',
				property: 'termIds',
				value:
					'={{ Array.isArray($value) ? $value : typeof $value === "string" ? $value.split(",").map((t) => t.trim()).filter(Boolean) : [] }}',
			},
		},
	},
];
