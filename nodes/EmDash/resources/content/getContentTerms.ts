import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentGetTerms = {
	resource: ['content'],
	operation: ['getContentTerms'],
};

export const contentGetTermsDescription: INodeProperties[] = [
	{
		displayName: 'Taxonomy',
		name: 'taxonomy',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForContentGetTerms,
		},
		description: 'The name of the taxonomy (e.g. categories, tags)',
	},
];
