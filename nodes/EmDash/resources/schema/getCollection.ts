import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSchemaGetCollection = {
	resource: ['schema'],
	operation: ['getCollection'],
};

export const schemaGetCollectionDescription: INodeProperties[] = [
	{
		displayName: 'Include Fields',
		name: 'includeFields',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForSchemaGetCollection,
		},
		description: 'Whether to include field definitions in the response',
	},
];
