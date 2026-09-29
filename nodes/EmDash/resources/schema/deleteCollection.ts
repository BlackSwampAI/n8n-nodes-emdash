import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSchemaDeleteCollection = {
	resource: ['schema'],
	operation: ['deleteCollection'],
};

export const schemaDeleteCollectionDescription: INodeProperties[] = [
	{
		displayName: 'Force',
		name: 'force',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForSchemaDeleteCollection,
		},
		description:
			'Whether to force deletion even if content exists. Permanently deletes the collection schema and underlying content table. Relations involving the collection are also removed.',
	},
];
