import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaUploadPending = {
	resource: ['media'],
	operation: ['uploadPending'],
};

export const mediaUploadPendingDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: showOnlyForMediaUploadPending,
		},
		description: 'The name of the binary property containing the file to upload',
	},
];
