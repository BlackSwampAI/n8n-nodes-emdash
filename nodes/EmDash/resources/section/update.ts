import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSectionUpdate = {
	resource: ['section'],
	operation: ['update'],
};

export const sectionUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForSectionUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'json',
				default: '[]',
				description:
					'Structured content for the section as a JSON array of objects ([{ type: "...", ... }]).',
			},
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
				description:
					'ID of a media item to set as preview, or empty string / "null" to clear the existing preview',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description:
					'New URL-safe slug for the section (only lowercase letters, numbers, and hyphens)',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'New display title of the section',
			},
		],
	},
];
