import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSearchSuggest = {
	resource: ['search'],
	operation: ['suggest'],
};

export const searchSuggestDescription: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSearchSuggest,
		},
		description: 'Prefix query string for autocompletion suggestions',
		routing: {
			request: {
				qs: {
					q: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		displayOptions: {
			show: showOnlyForSearchSuggest,
		},
		description: 'Max number of results to return',
		routing: {
			request: {
				qs: {
					limit: '={{$value}}',
				},
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
			show: showOnlyForSearchSuggest,
		},
		default: {},
		options: [
			{
				displayName: 'Collections',
				name: 'collections',
				type: 'string',
				default: '',
				description: 'Filter suggestions by collection slug(s), comma-separated',
				routing: {
					request: {
						qs: {
							collections: '={{$value || undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'BCP-47 locale code to filter suggestions by',
				routing: {
					request: {
						qs: {
							locale: '={{$value || undefined}}',
						},
					},
				},
			},
		],
	},
];
