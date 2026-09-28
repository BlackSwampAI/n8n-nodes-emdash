import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCommentBulkAction = {
	resource: ['comment'],
	operation: ['bulkAction'],
};

export const commentBulkActionDescription: INodeProperties[] = [
	{
		displayName: 'Comment IDs',
		name: 'ids',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForCommentBulkAction,
		},
		description:
			'Comment IDs to act upon. Accepts a comma-separated list, JSON array string, or an expression evaluating to an array of IDs (maximum 100 IDs).',
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		default: 'approve',
		options: [
			{
				name: 'Approve',
				value: 'approve',
				action: 'Approve the selected comments',
				description: 'Approve the selected comments',
			},
			{
				name: 'Mark as Spam',
				value: 'spam',
				action: 'Mark the selected comments as spam',
				description: 'Mark the selected comments as spam',
			},
			{
				name: 'Move to Trash',
				value: 'trash',
				action: 'Move the selected comments to trash',
				description: 'Move the selected comments to trash',
			},
			{
				name: 'Permanently Delete',
				value: 'delete',
				action: 'Permanently delete the selected comments irreversible',
				description:
					'Permanently delete the selected comments. Warning: This cannot be undone (irreversible).',
			},
		],
		displayOptions: {
			show: showOnlyForCommentBulkAction,
		},
	},
];
