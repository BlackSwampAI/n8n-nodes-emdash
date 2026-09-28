import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaUpdate = {
	resource: ['media'],
	operation: ['update'],
};

export const mediaUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForMediaUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Alt Text',
				name: 'alt',
				type: 'string',
				default: '',
				description: 'Alternative text for accessibility',
				routing: {
					send: {
						type: 'body',
						property: 'alt',
					},
				},
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				description: 'Caption text for the media file',
				routing: {
					send: {
						type: 'body',
						property: 'caption',
					},
				},
			},
			{
				displayName: 'Focal X',
				name: 'focalX',
				type: 'number',
				default: 0.5,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'Focal point horizontal position (0.0 to 1.0)',
				routing: {
					send: {
						type: 'body',
						property: 'focalX',
					},
				},
			},
			{
				displayName: 'Focal Y',
				name: 'focalY',
				type: 'number',
				default: 0.5,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'Focal point vertical position (0.0 to 1.0)',
				routing: {
					send: {
						type: 'body',
						property: 'focalY',
					},
				},
			},
			{
				displayName: 'Folder ID',
				name: 'folderId',
				type: 'string',
				default: '',
				description: 'The ID of the folder to move the media file to, or empty for unfiled',
				routing: {
					send: {
						type: 'body',
						property: 'folderId',
						value: '={{$value || null}}',
					},
				},
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 0,
				description: 'Image height in pixels',
				routing: {
					send: {
						type: 'body',
						property: 'height',
					},
				},
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 0,
				description: 'Image width in pixels',
				routing: {
					send: {
						type: 'body',
						property: 'width',
					},
				},
			},
		],
	},
];
