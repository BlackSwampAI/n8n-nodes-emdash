import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSchemaReorderFields = {
	resource: ['schema'],
	operation: ['reorderFields'],
};

export const schemaReorderFieldsDescription: INodeProperties[] = [
	{
		displayName: 'Field Slugs',
		name: 'fieldSlugs',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSchemaReorderFields,
		},
		description:
			'Ordered list of field slugs (array, JSON array string, or comma-separated string)',
	},
];
