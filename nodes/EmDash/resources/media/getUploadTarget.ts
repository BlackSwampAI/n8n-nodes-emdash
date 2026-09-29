import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaGetUploadTarget = {
	resource: ['media'],
	operation: ['getUploadTarget'],
};

export const mediaGetUploadTargetDescription: INodeProperties[] = [
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMediaGetUploadTarget,
		},
		description: 'The filename for the pending upload',
	},
	{
		displayName: 'Content Type',
		name: 'contentType',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMediaGetUploadTarget,
		},
		description: 'The MIME type (e.g. image/jpeg, image/png, application/pdf)',
	},
	{
		displayName: 'Size',
		name: 'size',
		type: 'number',
		typeOptions: {
			minValue: 0,
		},
		required: true,
		default: 0,
		displayOptions: {
			show: showOnlyForMediaGetUploadTarget,
		},
		description: 'File size in bytes (integer >= 0)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForMediaGetUploadTarget,
		},
		options: [
			{
				displayName: 'Content Hash',
				name: 'contentHash',
				type: 'string',
				default: '',
				description:
					'Optional content hash (e.g. SHA-256) of the file for deduplication verification',
			},
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
				description: 'Folder ID or "unfiled" for unfiled',
			},
		],
	},
];
