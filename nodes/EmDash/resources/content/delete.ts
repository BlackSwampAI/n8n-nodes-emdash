import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentDelete = {
	resource: ['content'],
	operation: ['delete'],
};

export const contentDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Override Lock',
		name: 'overrideLock',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForContentDelete,
		},
		description: 'Whether to move to trash even if another editor holds the edit lock',
		routing: {
			request: {
				qs: {
					overrideLock: '={{$value ? "true" : undefined}}',
				},
			},
		},
	},
];
