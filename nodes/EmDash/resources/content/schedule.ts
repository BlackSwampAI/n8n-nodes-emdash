import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentSchedule = {
	resource: ['content'],
	operation: ['schedule'],
};

export const contentScheduleDescription: INodeProperties[] = [
	{
		displayName: 'Scheduled At',
		name: 'scheduledAt',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForContentSchedule,
		},
		description: 'ISO 8601 datetime for scheduled publishing (e.g. 2026-10-01T12:00:00Z)',
		routing: {
			send: {
				type: 'body',
				property: 'scheduledAt',
			},
		},
	},
	{
		displayName: 'Revision (_Rev)',
		name: '_rev',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForContentSchedule,
		},
		description: 'Opaque revision token for optimistic concurrency control',
		routing: {
			send: {
				type: 'body',
				property: '_rev',
				value: '={{$value || undefined}}',
			},
		},
	},
	{
		displayName: 'Override Lock',
		name: 'overrideLock',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForContentSchedule,
		},
		description: 'Whether to schedule even if another editor holds the edit lock',
		routing: {
			send: {
				type: 'body',
				property: 'overrideLock',
			},
		},
	},
];
