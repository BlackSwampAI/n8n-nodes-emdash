import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaUpload = {
	resource: ['media'],
	operation: ['upload'],
};

export const mediaUploadDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: showOnlyForMediaUpload,
		},
		description: 'The name of the binary property containing the file to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForMediaUpload,
		},
		options: [
			{
				displayName: 'Deduplicate',
				name: 'deduplicate',
				type: 'boolean',
				default: false,
				description:
					'Whether to check for duplicates by checksum and return existing file if matched',
			},
			{
				displayName: 'Ensure Unique Filename',
				name: 'ensureUniqueFilename',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically rename the file if a file with the same name exists',
			},
			{
				displayName: 'Field ID',
				name: 'fieldId',
				type: 'string',
				default: '',
				description: 'Allows EmDash to apply a field-specific MIME allowlist',
			},
			{
				displayName: 'Folder ID',
				name: 'folderId',
				type: 'string',
				default: '',
				description: 'The ID of the folder to place the uploaded file in, or empty for unfiled',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: undefined,
				description: 'Image height in pixels (must be an integer > 0)',
			},
			{
				displayName: 'Thumbnail Binary Property Name',
				name: 'thumbnailBinaryPropertyName',
				type: 'string',
				default: '',
				description:
					'The name of the binary property containing a downscaled thumbnail image for LQIP placeholder generation',
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: undefined,
				description: 'Image width in pixels (must be an integer > 0)',
			},
		],
	},
];
