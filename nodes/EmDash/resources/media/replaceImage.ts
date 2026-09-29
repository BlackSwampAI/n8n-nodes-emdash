import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaReplaceImage = {
	resource: ['media'],
	operation: ['replaceImage'],
};

export const mediaReplaceImageDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: showOnlyForMediaReplaceImage,
		},
		description:
			'The name of the binary property containing the replacement image file. Preserves media ID and storage identity, updates dimensions and content hash, and resets blurhash, dominantColor, and focal point to null.',
	},
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		required: true,
		default: 1,
		displayOptions: {
			show: showOnlyForMediaReplaceImage,
		},
		description: 'Image width in pixels (must be an integer > 0)',
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		required: true,
		default: 1,
		displayOptions: {
			show: showOnlyForMediaReplaceImage,
		},
		description: 'Image height in pixels (must be an integer > 0)',
	},
];
