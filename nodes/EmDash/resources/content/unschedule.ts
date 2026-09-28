import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentUnschedule = {
	resource: ['content'],
	operation: ['unschedule'],
};

export const contentUnscheduleDescription: INodeProperties[] = [
	{
		displayName: 'Override Lock',
		name: 'overrideLock',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForContentUnschedule,
		},
		description: 'Whether to cancel the schedule even if another editor holds the edit lock',
		routing: {
			request: {
				qs: {
					overrideLock: '={{$value ? "true" : undefined}}',
				},
			},
		},
	},
];
