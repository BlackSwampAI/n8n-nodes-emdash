import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaUpdateFolder = {
	resource: ['media'],
	operation: ['updateFolder'],
};

export const mediaUpdateFolderDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMediaUpdateFolder,
		},
		description: 'The new name of the folder',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
];
