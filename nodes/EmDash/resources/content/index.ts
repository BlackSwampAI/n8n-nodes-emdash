import type { INodeProperties } from 'n8n-workflow';
import { collectionSelect, contentIdProperty } from '../../shared/descriptions';
import { contentGetManyDescription } from './getAll';
import { contentGetDescription } from './get';
import { contentCreateDescription } from './create';
import { contentUpdateDescription } from './update';
import { contentDeleteDescription } from './delete';
import { contentPublishDescription } from './publish';
import { contentUnpublishDescription } from './unpublish';
import { contentScheduleDescription } from './schedule';
import { contentUnscheduleDescription } from './unschedule';
import { contentDiscardDraftDescription } from './discardDraft';
import { contentGetTermsDescription } from './getContentTerms';
import { contentSetTermsDescription } from './setContentTerms';
import { contentAcquireLockDescription } from './acquireLock';
import { contentGetLockDescription } from './getLock';
import { contentGetTrashedDescription } from './getTrashed';
import { contentReleaseLockDescription } from './releaseLock';

const showOnlyForContent = {
	resource: ['content'],
};

export const contentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForContent,
		},
		options: [
			{
				name: 'Acquire Edit Lock',
				value: 'acquireLock',
				action: 'Acquire edit lock',
				description: 'Acquire or refresh an edit lock lease on a content item',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/lock',
						qs: {
							locale: '={{$parameter.options?.locale || $parameter.locale || undefined}}',
						},
						body: {
							takeover: '={{$parameter.takeover !== undefined ? $parameter.takeover : undefined}}',
							token: '={{$parameter.token || undefined}}',
						},
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
				name: 'Compare Draft and Live',
				value: 'compare',
				action: 'Compare draft and live revisions',
				description: 'Compare draft and published revisions of a content item',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/compare',
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
				name: 'Create',
				value: 'create',
				action: 'Create a content item',
				description: 'Create a new content item in a collection',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}',
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
				action: 'Move content item to trash',
				description: 'Move a content item to the trash (soft delete)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}',
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
				name: 'Discard Draft',
				value: 'discardDraft',
				action: 'Discard draft changes',
				description: 'Revert draft changes to the live version',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/discard-draft',
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
				name: 'Duplicate',
				value: 'duplicate',
				action: 'Duplicate a content item',
				description: 'Create a copy of a content item',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/duplicate',
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
				action: 'Get a content item',
				description: 'Get a single content item by ID or slug',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}',
						qs: {
							locale: '={{$parameter.options?.locale || $parameter.locale || undefined}}',
						},
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
				name: 'Get Authors',
				value: 'getAuthors',
				action: 'Get content authors',
				description: 'Get distinct authors of a collection’s content',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}/authors',
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
				name: 'Get Content Terms',
				value: 'getContentTerms',
				action: 'Get taxonomy terms for content',
				description: 'Get taxonomy terms assigned to a content item',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/terms/{{$parameter.taxonomy}}',
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
				name: 'Get Edit Lock',
				value: 'getLock',
				action: 'Get edit lock status',
				description: 'Get the current edit lock status and holder for a content item',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/lock',
						qs: {
							locale: '={{$parameter.options?.locale || $parameter.locale || undefined}}',
						},
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
				action: 'Get many content items',
				description: 'Get many content items in a collection',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}',
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
				name: 'Get Translations',
				value: 'getTranslations',
				action: 'Get content translations',
				description: 'Get translation variants linked to the same translation group',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/translations',
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
				name: 'Get Trashed',
				value: 'getTrashed',
				action: 'Get trashed content items',
				description: 'Get soft-deleted content items in a collection',
				routing: {
					request: {
						method: 'GET',
						url: '=/content/{{$parameter.collection}}/trash',
						qs: {
							locale: '={{$parameter.options?.locale || $parameter.locale || undefined}}',
						},
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
				name: 'Permanently Delete',
				value: 'permanentDelete',
				action: 'Permanently delete a content item',
				description: 'Permanently remove a trashed content item',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/permanent',
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
				name: 'Publish',
				value: 'publish',
				action: 'Publish a content item',
				description: 'Promote draft content to live',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/publish',
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
				name: 'Release Edit Lock',
				value: 'releaseLock',
				action: 'Release edit lock',
				description: 'Release the caller’s edit lock on a content item',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/lock',
						qs: {
							locale: '={{$parameter.options?.locale || $parameter.locale || undefined}}',
						},
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
				name: 'Restore',
				value: 'restore',
				action: 'Restore a content item from trash',
				description: 'Restore a trashed content item',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/restore',
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
				name: 'Schedule',
				value: 'schedule',
				action: 'Schedule a content item',
				description: 'Schedule a content item for future publication',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/schedule',
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
				name: 'Set Content Terms',
				value: 'setContentTerms',
				action: 'Set taxonomy terms on content',
				description: 'Set taxonomy terms assigned to a content item',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/terms/{{$parameter.taxonomy}}',
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
				name: 'Unpublish',
				value: 'unpublish',
				action: 'Unpublish a content item',
				description: 'Revert published content to draft',
				routing: {
					request: {
						method: 'POST',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/unpublish',
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
				name: 'Unschedule',
				value: 'unschedule',
				action: 'Cancel scheduled publication',
				description: 'Cancel scheduled publishing for a content item',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/schedule',
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
				name: 'Update',
				value: 'update',
				action: 'Update a content item',
				description: 'Update a content item by ID or slug',
				routing: {
					request: {
						method: 'PUT',
						url: '=/content/{{$parameter.collection}}/{{$parameter.id}}',
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
	collectionSelect,
	contentIdProperty,
	...contentGetManyDescription,
	...contentGetDescription,
	...contentCreateDescription,
	...contentUpdateDescription,
	...contentDeleteDescription,
	...contentPublishDescription,
	...contentUnpublishDescription,
	...contentScheduleDescription,
	...contentUnscheduleDescription,
	...contentDiscardDraftDescription,
	...contentGetTermsDescription,
	...contentSetTermsDescription,
	...contentAcquireLockDescription,
	...contentGetLockDescription,
	...contentGetTrashedDescription,
	...contentReleaseLockDescription,
];
