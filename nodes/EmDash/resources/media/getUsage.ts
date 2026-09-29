import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMediaGetUsage = {
	resource: ['media'],
	operation: ['getUsage'],
};

export const mediaGetUsageDescription: INodeProperties[] = [
	{
		displayName: 'Cursor',
		name: 'cursor',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForMediaGetUsage,
		},
		description:
			'Opaque content-entry-group cursor for pagination. Note: Requires PAT scope "admin" (not "media:read") and RBAC "media:read" + "content:read_drafts".',
		routing: {
			request: {
				qs: {
					cursor: '={{$value || undefined}}',
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		displayOptions: {
			show: showOnlyForMediaGetUsage,
		},
		description: 'Max number of results to return',
		routing: {
			request: {
				qs: {
					limit: '={{$value}}',
				},
			},
		},
	},
];
