import type { INodeProperties } from 'n8n-workflow';
import { fieldTypeOptions } from './createField';

const showOnlyForSchemaUpdateField = {
	resource: ['schema'],
	operation: ['updateField'],
};

export const schemaUpdateFieldDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForSchemaUpdateField,
		},
		options: [
			{
				displayName: 'Default Value',
				name: 'defaultValue',
				type: 'string',
				default: '',
				description:
					'Default value for the field (literal primitive string/number/boolean, or JSON array/object/null)',
			},
			{
				displayName: 'Indexed',
				name: 'indexed',
				type: 'boolean',
				default: false,
				description: 'Whether to create a SQLite index on this field column for faster queries',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'Human-readable label for the field',
			},
			{
				displayName: 'Options (JSON)',
				name: 'options',
				type: 'json',
				default: '{}',
				description: 'Custom widget rendering and editor options as a JSON object',
			},
			{
				displayName: 'Required',
				name: 'required',
				type: 'boolean',
				default: false,
				description:
					'Whether entries must provide a value for this field. NOTE: Toggling required on an existing field requires a content migration and will be rejected upstream with FIELD_UPDATE_REQUIRES_MIGRATION.',
			},
			{
				displayName: 'Searchable',
				name: 'searchable',
				type: 'boolean',
				default: false,
				description: 'Whether field values are included in full-text search indexing',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'number',
				default: 0,
				description: 'Sort order position in the content editor form',
			},
			{
				displayName: 'Translatable',
				name: 'translatable',
				type: 'boolean',
				default: false,
				description:
					'Whether this field maintains separate translated values per locale variant. NOTE: Changing a translatable field to false requires a content migration and will be rejected upstream with FIELD_UPDATE_REQUIRES_MIGRATION.',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: fieldTypeOptions,
				default: 'string',
				description:
					'Data type of the field. NOTE: Most type changes across column affinities (e.g. text to number) require a content migration and will be rejected upstream with FIELD_TYPE_COLUMN_CHANGE or FIELD_TYPE_CHANGE_REQUIRES_MIGRATION. Compatible text-alias transitions (e.g. text to string) or no-op updates are permitted.',
			},
			{
				displayName: 'Unique',
				name: 'unique',
				type: 'boolean',
				default: false,
				description:
					'Whether values in this field must be unique across all collection entries. NOTE: Toggling unique on an existing field requires a content migration and will be rejected upstream with FIELD_UPDATE_REQUIRES_MIGRATION.',
			},
			{
				displayName: 'Validation (JSON)',
				name: 'validation',
				type: 'json',
				default: '{}',
				description:
					'Field validation constraints (e.g. min, max, minLength, maxLength, pattern, options, relation) as a JSON object or null',
			},
			{
				displayName: 'Widget',
				name: 'widget',
				type: 'string',
				default: '',
				description:
					'Custom UI widget component identifier for editing this field. Pass an empty string to clear the widget.',
			},
		],
	},
];
