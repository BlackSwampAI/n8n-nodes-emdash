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
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				description: 'Caption text for the media file',
			},
			{
				displayName: 'Clear Focal Point',
				name: 'clearFocalPoint',
				type: 'boolean',
				default: false,
				description:
					'Whether to clear the focal point coordinates (sets both focalX and focalY to null)',
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
			},
			{
				displayName: 'Folder ID',
				name: 'folderId',
				type: 'string',
				default: '',
				description: 'The ID of the folder to move the media file to, or "unfiled" for unfiled',
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
