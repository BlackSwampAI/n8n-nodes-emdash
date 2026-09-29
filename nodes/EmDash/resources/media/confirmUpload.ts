import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaConfirmUpload = {
	resource: ['media'],
	operation: ['confirmUpload'],
};

export const mediaConfirmUploadDescription: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForMediaConfirmUpload,
		},
		options: [
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: undefined,
				description: 'Image height in pixels (positive integer)',
			},
			{
				displayName: 'Size',
				name: 'size',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: undefined,
				description: 'File size in bytes (integer >= 0)',
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: undefined,
				description: 'Image width in pixels (positive integer)',
			},
		],
	},
];
