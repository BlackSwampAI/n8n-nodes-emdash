import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSearchEnable = {
	resource: ['search'],
	operation: ['enableSearch'],
};

export const searchEnableSearchDescription: INodeProperties[] = [
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean',
		required: true,
		default: true,
		displayOptions: {
			show: showOnlyForSearchEnable,
		},
		description: 'Whether full-text search indexing is enabled for the collection',
		routing: {
			send: {
				type: 'body',
				property: 'enabled',
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
			show: showOnlyForSearchEnable,
		},
		default: {},
		options: [
			{
				displayName: 'Tokenize',
				name: 'tokenize',
				type: 'options',
				options: [
					{ name: 'Porter + Unicode61 (Default)', value: 'porter unicode61' },
					{ name: 'Unicode61', value: 'unicode61' },
					{ name: 'Trigram', value: 'trigram' },
				],
				default: 'porter unicode61',
				description: 'Tokenizer strategy for SQLite FTS5 search index',
				routing: {
					send: {
						type: 'body',
						property: 'tokenize',
					},
				},
			},
			{
				displayName: 'Weights',
				name: 'weights',
				type: 'json',
				default: '{}',
				description:
					'Column weight mapping for FTS5 ranking as a JSON object (e.g. {"title": 10, "content": 1})',
				routing: {
					send: {
						type: 'body',
						property: 'weights',
						value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
					},
				},
			},
		],
	},
];
