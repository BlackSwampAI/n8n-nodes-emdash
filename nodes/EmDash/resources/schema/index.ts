import type { INodeProperties } from 'n8n-workflow';
import { schemaCollectionSelect, schemaFieldSelect } from '../../shared/descriptions';
import {
	validateCreateCollection,
	validateUpdateCollection,
	validateReorderCollections,
	validateCreateField,
	validateUpdateField,
	validateReorderFields,
} from '../../shared/transport';
import { schemaGetCollectionsDescription } from './getCollections';
import { schemaGetCollectionDescription } from './getCollection';
import { schemaCreateCollectionDescription } from './createCollection';
import { schemaUpdateCollectionDescription } from './updateCollection';
import { schemaDeleteCollectionDescription } from './deleteCollection';
import { schemaReorderCollectionsDescription } from './reorderCollections';
import { schemaGetFieldsDescription } from './getFields';
import { schemaGetFieldDescription } from './getField';
import { schemaCreateFieldDescription } from './createField';
import { schemaUpdateFieldDescription } from './updateField';
import { schemaDeleteFieldDescription } from './deleteField';
import { schemaReorderFieldsDescription } from './reorderFields';

const showOnlyForSchema = {
	resource: ['schema'],
};

export const schemaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSchema,
		},
		options: [
			{
				name: 'Create Collection',
				value: 'createCollection',
				action: 'Create a collection',
				description: 'Create a new collection schema',
				routing: {
					request: {
						method: 'POST',
						url: '/schema/collections',
					},
					send: {
						preSend: [validateCreateCollection],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.item',
								},
							},
						],
					},
				},
			},
			{
				name: 'Create Field',
				value: 'createField',
				action: 'Create a field',
				description: 'Add a new field schema to a collection',
				routing: {
					request: {
						method: 'POST',
						url: '=/schema/collections/{{$parameter.collection}}/fields',
					},
					send: {
						preSend: [validateCreateField],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.item',
								},
							},
						],
					},
				},
			},
			{
				name: 'Delete Collection',
				value: 'deleteCollection',
				action: 'Delete a collection',
				description:
					'Permanently deletes the collection schema and underlying content table. Relations involving the collection are also removed. Force allows deletion when content exists.',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/schema/collections/{{$parameter.collection}}',
						qs: {
							force: '={{$parameter.force ? true : undefined}}',
						},
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Delete Field',
				value: 'deleteField',
				action: 'Delete a field',
				description:
					'Permanently deletes the field and its column from the content table. Delete Relation also deletes the underlying relationship, all relation edges, and the field bound to the other side.',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/schema/collections/{{$parameter.collection}}/fields/{{$parameter.fieldSlug}}',
						qs: {
							deleteRelation: '={{$parameter.deleteRelation ? true : undefined}}',
						},
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Collection',
				value: 'getCollection',
				action: 'Get a collection',
				description: 'Retrieve a collection schema by slug',
				routing: {
					request: {
						method: 'GET',
						url: '=/schema/collections/{{$parameter.collection}}',
						qs: {
							includeFields: '={{$parameter.includeFields ? true : undefined}}',
						},
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.item',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Field',
				value: 'getField',
				action: 'Get a field',
				description: 'Retrieve a single field schema by slug',
				routing: {
					request: {
						method: 'GET',
						url: '=/schema/collections/{{$parameter.collection}}/fields/{{$parameter.fieldSlug}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.item',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Many Collections',
				value: 'getCollections',
				action: 'Get many collections',
				description: 'Retrieve all registered collection schemas',
				routing: {
					request: {
						method: 'GET',
						url: '/schema/collections',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Many Fields',
				value: 'getFields',
				action: 'Get many fields',
				description: 'Retrieve all field schemas for a collection',
				routing: {
					request: {
						method: 'GET',
						url: '=/schema/collections/{{$parameter.collection}}/fields',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				name: 'Reorder Collections',
				value: 'reorderCollections',
				action: 'Reorder collections',
				description: 'Update the admin sidebar display order of collections',
				routing: {
					request: {
						method: 'POST',
						url: '/schema/collections/reorder',
					},
					send: {
						preSend: [validateReorderCollections],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Reorder Fields',
				value: 'reorderFields',
				action: 'Reorder fields',
				description: 'Update the display order of fields within a collection',
				routing: {
					request: {
						method: 'POST',
						url: '=/schema/collections/{{$parameter.collection}}/fields/reorder',
					},
					send: {
						preSend: [validateReorderFields],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update Collection',
				value: 'updateCollection',
				action: 'Update a collection',
				description: 'Update an existing collection schema',
				routing: {
					request: {
						method: 'PUT',
						url: '=/schema/collections/{{$parameter.collection}}',
					},
					send: {
						preSend: [validateUpdateCollection],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.item',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update Field',
				value: 'updateField',
				action: 'Update a field',
				description: 'Update an existing field schema',
				routing: {
					request: {
						method: 'PUT',
						url: '=/schema/collections/{{$parameter.collection}}/fields/{{$parameter.fieldSlug}}',
					},
					send: {
						preSend: [validateUpdateField],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.item',
								},
							},
						],
					},
				},
			},
		],
		default: 'getCollections',
	},
	schemaCollectionSelect,
	schemaFieldSelect,
	...schemaGetCollectionsDescription,
	...schemaGetCollectionDescription,
	...schemaCreateCollectionDescription,
	...schemaUpdateCollectionDescription,
	...schemaDeleteCollectionDescription,
	...schemaReorderCollectionsDescription,
	...schemaGetFieldsDescription,
	...schemaGetFieldDescription,
	...schemaCreateFieldDescription,
	...schemaUpdateFieldDescription,
	...schemaDeleteFieldDescription,
	...schemaReorderFieldsDescription,
];
