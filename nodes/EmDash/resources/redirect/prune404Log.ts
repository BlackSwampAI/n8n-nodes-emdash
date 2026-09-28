import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRedirectPrune404Log = {
	resource: ['redirect'],
	operation: ['prune404Log'],
};

export const redirectPrune404LogDescription: INodeProperties[] = [
	{
		displayName: 'Older Than',
		name: 'olderThan',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForRedirectPrune404Log,
		},
		description: 'Prune 404 log entries recorded before this ISO 8601 datetime',
		routing: {
			send: {
				type: 'body',
				property: 'olderThan',
			},
		},
	},
];
