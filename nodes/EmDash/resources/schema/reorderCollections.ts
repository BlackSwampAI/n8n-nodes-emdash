import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSchemaReorderCollections = {
	resource: ['schema'],
	operation: ['reorderCollections'],
};

export const schemaReorderCollectionsDescription: INodeProperties[] = [
	{
		displayName: 'Slugs',
		name: 'slugs',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSchemaReorderCollections,
		},
		description:
			'Ordered list of collection slugs (array, JSON array string, or comma-separated string)',
	},
];
