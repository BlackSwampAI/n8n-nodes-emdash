import type { INodeProperties } from 'n8n-workflow';
import { commentIdProperty } from '../../shared/descriptions';
import { validateBulkCommentAction } from '../../shared/transport';
import { commentGetAllDescription } from './getAll';
import { commentGetCountsDescription } from './getCounts';
import { commentGetDescription } from './get';
import { commentUpdateStatusDescription } from './updateStatus';
import { commentBulkActionDescription } from './bulkAction';
import { commentDeleteDescription } from './delete';

const showOnlyForComment = {
	resource: ['comment'],
};

export const commentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForComment,
		},
		options: [
			{
				name: 'Bulk Action',
				value: 'bulkAction',
				action: 'Execute bulk action on comments',
				description: 'Apply moderation action or permanently delete multiple comments',
				routing: {
					request: {
						method: 'POST',
						url: '/admin/comments/bulk',
					},
					send: {
						preSend: [validateBulkCommentAction],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Permanently delete comment',
				description: 'Permanently delete a comment (irreversible)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/admin/comments/{{$parameter.commentId}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a comment',
				description: 'Get a single comment by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/admin/comments/{{$parameter.commentId}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many comments',
				description: 'List comments with filtering and pagination',
				routing: {
					request: {
						method: 'GET',
						url: '/admin/comments',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Counts',
				value: 'getCounts',
				action: 'Get comment status counts',
				description: 'Get counts of comments grouped by status',
				routing: {
					request: {
						method: 'GET',
						url: '/admin/comments/counts',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				action: 'Update comment status',
				description: 'Update moderation status for a comment',
				routing: {
					request: {
						method: 'PUT',
						url: '=/admin/comments/{{$parameter.commentId}}/status',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	commentIdProperty,
	...commentGetAllDescription,
	...commentGetCountsDescription,
	...commentGetDescription,
	...commentUpdateStatusDescription,
	...commentBulkActionDescription,
	...commentDeleteDescription,
];
