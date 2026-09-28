import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaGet = {
	resource: ['media'],
	operation: ['get'],
};

export const mediaGetDescription: INodeProperties[] = [
	{
		displayName: 'Include Usage',
		name: 'includeUsage',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForMediaGet,
		},
		description: 'Whether to include content item usage reference details',
		routing: {
			request: {
				qs: {
					includeUsage: '={{$value ? "1" : undefined}}',
				},
			},
		},
	},
];
