import type { INodeProperties } from 'n8n-workflow';

export const collectionSelect: INodeProperties = {
	displayName: 'Collection',
	name: 'collection',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a collection...',
			typeOptions: {
				searchListMethod: 'getCollections',
				searchable: true,
			},
		},
		{
			displayName: 'By Slug',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. posts',
		},
	],
	displayOptions: {
		show: {
			resource: ['content'],
		},
	},
	description: 'The slug of the EmDash collection',
};

export const contentIdProperty: INodeProperties = {
	displayName: 'Content ID',
	name: 'id',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['content'],
			operation: [
				'get',
				'update',
				'delete',
				'publish',
				'unpublish',
				'schedule',
				'unschedule',
				'duplicate',
				'restore',
				'permanentDelete',
				'compare',
				'discardDraft',
				'getContentTerms',
				'setContentTerms',
			],
		},
	},
	description: 'The ID or slug of the content item',
};

export const mediaIdProperty: INodeProperties = {
	displayName: 'Media ID',
	name: 'mediaId',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['media'],
			operation: ['get', 'update', 'delete', 'getUsage'],
		},
	},
	description: 'The ID of the media item',
};

export const folderIdProperty: INodeProperties = {
	displayName: 'Folder ID',
	name: 'folderId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a folder...',
			typeOptions: {
				searchListMethod: 'getMediaFolders',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. fld_abc123',
		},
	],
	displayOptions: {
		show: {
			resource: ['media'],
			operation: ['getFolder', 'updateFolder', 'deleteFolder'],
		},
	},
	description: 'The ID of the media folder',
};

export const taxonomySelect: INodeProperties = {
	displayName: 'Taxonomy',
	name: 'taxonomy',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a taxonomy...',
			typeOptions: {
				searchListMethod: 'getTaxonomies',
				searchable: true,
			},
		},
		{
			displayName: 'By Name',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. categories',
		},
	],
	displayOptions: {
		show: {
			resource: ['taxonomy'],
			operation: [
				'getTaxonomy',
				'updateTaxonomy',
				'deleteTaxonomy',
				'getAllTerms',
				'getTerm',
				'createTerm',
				'updateTerm',
				'deleteTerm',
				'reorderTerms',
			],
		},
	},
	description: 'The name or slug of the taxonomy',
};

export const termSlugProperty: INodeProperties = {
	displayName: 'Term Slug',
	name: 'termSlug',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['taxonomy'],
			operation: ['getTerm', 'updateTerm', 'deleteTerm'],
		},
	},
	description: 'The URL-safe slug of the taxonomy term',
};

export const searchCollectionSelect: INodeProperties = {
	displayName: 'Collection',
	name: 'collection',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a collection...',
			typeOptions: {
				searchListMethod: 'getCollections',
				searchable: true,
			},
		},
		{
			displayName: 'By Slug',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. posts',
		},
	],
	displayOptions: {
		show: {
			resource: ['search'],
			operation: ['rebuildIndex', 'enableSearch'],
		},
	},
	description: 'The slug of the EmDash collection to index',
	routing: {
		send: {
			type: 'body',
			property: 'collection',
			value: '={{ typeof $value === "object" && $value !== null ? $value.value : $value }}',
		},
	},
};

export const redirectIdProperty: INodeProperties = {
	displayName: 'Redirect ID',
	name: 'redirectId',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['redirect'],
			operation: ['getRedirect', 'updateRedirect', 'deleteRedirect'],
		},
	},
	description: 'The ID of the redirect rule',
};

export const commentIdProperty: INodeProperties = {
	displayName: 'Comment ID',
	name: 'commentId',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['comment'],
			operation: ['get', 'updateStatus', 'delete'],
		},
	},
	description: 'The ID of the comment',
};
