import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSectionCreate = {
	resource: ['section'],
	operation: ['create'],
};

export const sectionCreateDescription: INodeProperties[] = [
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSectionCreate,
		},
		description:
			'URL-safe identifier for the section (only lowercase letters, numbers, and hyphens)',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSectionCreate,
		},
		description: 'Display title of the section',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: {
			show: showOnlyForSectionCreate,
		},
		description:
			'Structured content for the section as a JSON array of objects ([{ type: "...", ... }]).',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForSectionCreate,
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Brief description of the section',
			},
			{
				displayName: 'Keywords',
				name: 'keywords',
				type: 'string',
				default: '',
				description: 'Keywords for discovery (comma-separated or JSON array of strings)',
			},
			{
				displayName: 'Preview Media ID',
				name: 'previewMediaId',
				type: 'string',
				default: '',
				description: 'ID of a media item in the media library to use as a preview screenshot',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'Import', value: 'import' },
					{ name: 'User', value: 'user' },
				],
				default: 'user',
				description: 'Origin source of the section (theme sections cannot be created manually)',
			},
			{
				displayName: 'Theme ID',
				name: 'themeId',
				type: 'string',
				default: '',
				description: 'Identifier of the theme providing this section if source is import',
			},
		],
	},
];
