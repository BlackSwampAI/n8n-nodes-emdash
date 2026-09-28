import type { INodeProperties } from 'n8n-workflow';
import { mediaIdProperty, folderIdProperty } from '../../shared/descriptions';
import { prepareMediaUpload } from '../../shared/transport';
import { mediaGetManyDescription } from './getAll';
import { mediaGetDescription } from './get';
import { mediaUploadDescription } from './upload';
import { mediaUpdateDescription } from './update';
import { mediaDeleteDescription } from './delete';
import { mediaGetUsageDescription } from './getUsage';
import { mediaGetAllFoldersDescription } from './getAllFolders';
import { mediaGetFolderDescription } from './getFolder';
import { mediaCreateFolderDescription } from './createFolder';
import { mediaUpdateFolderDescription } from './updateFolder';
import { mediaDeleteFolderDescription } from './deleteFolder';

const showOnlyForMedia = {
	resource: ['media'],
};

export const mediaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMedia,
		},
		options: [
			{
				name: 'Create Folder',
				value: 'createFolder',
				action: 'Create a media folder',
				description: 'Create a new folder to organize media files',
				routing: {
					request: {
						method: 'POST',
						url: '/media/folders',
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
				name: 'Delete',
				value: 'delete',
				action: 'Delete a media file',
				description: 'Delete a media file by ID',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/media/{{$parameter.mediaId}}',
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
				name: 'Delete Folder',
				value: 'deleteFolder',
				action: 'Delete a media folder',
				description: 'Delete an empty media folder',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/media/folders/{{$parameter.folderId}}',
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
				name: 'Get',
				value: 'get',
				action: 'Get a media file',
				description: 'Get metadata for a single media file by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/media/{{$parameter.mediaId}}',
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
				name: 'Get Folder',
				value: 'getFolder',
				action: 'Get a media folder',
				description: 'Get a media folder by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/media/folders/{{$parameter.folderId}}',
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
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many media files',
				description: 'Retrieve media files with optional filtering and pagination',
				routing: {
					request: {
						method: 'GET',
						url: '/media',
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
				name: 'Get Many Folders',
				value: 'getAllFolders',
				action: 'Get many media folders',
				description: 'List media folders with optional search filtering',
				routing: {
					request: {
						method: 'GET',
						url: '/media/folders',
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
				name: 'Get Usage',
				value: 'getUsage',
				action: 'Get media usage',
				description: 'Get content items referencing this media file',
				routing: {
					request: {
						method: 'GET',
						url: '=/media/{{$parameter.mediaId}}/usage',
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
				name: 'Update Folder',
				value: 'updateFolder',
				action: 'Update a media folder',
				description: 'Rename or update a media folder',
				routing: {
					request: {
						method: 'PUT',
						url: '=/media/folders/{{$parameter.folderId}}',
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
				name: 'Update Metadata',
				value: 'update',
				action: 'Update media metadata',
				description: 'Update metadata for a media file',
				routing: {
					request: {
						method: 'PUT',
						url: '=/media/{{$parameter.mediaId}}',
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
				name: 'Upload',
				value: 'upload',
				action: 'Upload a media file',
				description: 'Upload a media file via multipart form data',
				routing: {
					request: {
						method: 'POST',
						url: '/media',
					},
					send: {
						preSend: [prepareMediaUpload],
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
		],
		default: 'getAll',
	},
	mediaIdProperty,
	folderIdProperty,
	...mediaGetManyDescription,
	...mediaGetDescription,
	...mediaUploadDescription,
	...mediaUpdateDescription,
	...mediaDeleteDescription,
	...mediaGetUsageDescription,
	...mediaGetAllFoldersDescription,
	...mediaGetFolderDescription,
	...mediaCreateFolderDescription,
	...mediaUpdateFolderDescription,
	...mediaDeleteFolderDescription,
];
