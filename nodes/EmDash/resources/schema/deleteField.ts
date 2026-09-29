import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSchemaDeleteField = {
	resource: ['schema'],
	operation: ['deleteField'],
};

export const schemaDeleteFieldDescription: INodeProperties[] = [
	{
		displayName: 'Delete Relation',
		name: 'deleteRelation',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForSchemaDeleteField,
		},
		description:
			'Whether to delete the underlying relation definition if this is a reference field. WARNING: Delete Relation also deletes the underlying relationship, all relation edges, and the field bound to the other side.',
	},
];
