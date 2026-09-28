import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCommentUpdateStatus = {
	resource: ['comment'],
	operation: ['updateStatus'],
};

export const commentUpdateStatusDescription: INodeProperties[] = [
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		default: 'approved',
		options: [
			{
				name: 'Approved',
				value: 'approved',
			},
			{
				name: 'Pending',
				value: 'pending',
			},
			{
				name: 'Spam',
				value: 'spam',
			},
			{
				name: 'Trash',
				value: 'trash',
			},
		],
		displayOptions: {
			show: showOnlyForCommentUpdateStatus,
		},
		description: 'The moderation status to set for the comment',
		routing: {
			send: {
				type: 'body',
				property: 'status',
			},
		},
	},
];
