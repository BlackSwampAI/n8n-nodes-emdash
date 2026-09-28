import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTaxonomyGetAllTerms = {
	resource: ['taxonomy'],
	operation: ['getAllTerms'],
};

export const taxonomyGetAllTermsDescription: INodeProperties[] = [
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Filter',
		},
		displayOptions: {
			show: showOnlyForTaxonomyGetAllTerms,
		},
		default: {},
		options: [
			{
				displayName: 'Include Counts',
				name: 'includeCounts',
				type: 'boolean',
				default: false,
				description: 'Whether to include content item usage counts for each term',
				routing: {
					request: {
						qs: {
							includeCounts: '={{$value ? "1" : undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'Filter terms by BCP-47 locale code',
				routing: {
					request: {
						qs: {
							locale: '={{$value || undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Resolve Fallback',
				name: 'resolveFallback',
				type: 'boolean',
				default: false,
				description:
					'Whether to resolve default-locale fallback translations for missing localized fields',
				routing: {
					request: {
						qs: {
							resolveFallback: '={{$value ? "1" : undefined}}',
						},
					},
				},
			},
		],
	},
];
