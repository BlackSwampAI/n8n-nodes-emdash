import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSchemaCreateField = {
	resource: ['schema'],
	operation: ['createField'],
};

export const fieldTypeOptions = [
	{ name: 'Blocks', value: 'blocks' },
	{ name: 'Boolean', value: 'boolean' },
	{ name: 'Date & Time', value: 'datetime' },
	{ name: 'File', value: 'file' },
	{ name: 'Image', value: 'image' },
	{ name: 'Integer', value: 'integer' },
	{ name: 'JSON', value: 'json' },
	{ name: 'Multi-Select', value: 'multiSelect' },
	{ name: 'Number', value: 'number' },
	{ name: 'Portable Text', value: 'portableText' },
	{ name: 'Reference', value: 'reference' },
	{ name: 'Repeater', value: 'repeater' },
	{ name: 'Select', value: 'select' },
	{ name: 'Slug', value: 'slug' },
	{ name: 'String', value: 'string' },
	{ name: 'Text', value: 'text' },
	{ name: 'URL', value: 'url' },
];

export const schemaCreateFieldDescription: INodeProperties[] = [
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSchemaCreateField,
		},
		description:
			'Unique identifier for the field within the collection (lowercase letters, numbers, and underscores, starting with a letter, 1–63 characters)',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSchemaCreateField,
		},
		description: 'Human-readable label for the field',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'string',
		options: fieldTypeOptions,
		displayOptions: {
			show: showOnlyForSchemaCreateField,
		},
		description: 'Data type of the field',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForSchemaCreateField,
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
				description: 'Whether entries must provide a value for this field',
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
				description: 'Whether this field maintains separate translated values per locale variant',
			},
			{
				displayName: 'Unique',
				name: 'unique',
				type: 'boolean',
				default: false,
				description: 'Whether values in this field must be unique across all collection entries',
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
				description: 'Custom UI widget component identifier for editing this field',
			},
		],
	},
];
