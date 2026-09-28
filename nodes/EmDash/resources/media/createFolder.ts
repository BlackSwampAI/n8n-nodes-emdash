import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaCreateFolder = {
	resource: ['media'],
	operation: ['createFolder'],
};

export const mediaCreateFolderDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMediaCreateFolder,
		},
		description: 'The name of the folder to create',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
];
