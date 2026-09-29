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
		description:
			'Whether to include a coverage-aware usage summary on each media item. Note: usage.count is null unless caller holds both RBAC content:read_drafts permission and admin token scope; for full usage details use Get Usage.',
		routing: {
			request: {
				qs: {
					includeUsage: '={{$value ? "1" : undefined}}',
				},
			},
		},
	},
];
