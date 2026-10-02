import { describe, expect, it } from 'vitest';
import { Emdash } from '../nodes/EmDash/Emdash.node';
import {
	assertRequiredControls,
	normalizeResourceLocator,
	requireNonBlankDefaults,
} from './helpers/operation-contract';

describe('EmDash node operation contracts', () => {
	it('checks required controls against actual display conditions', () => {
		const description = new Emdash().description;

		// Content Create: requires collection and data
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'create',
				requiredControls: ['collection', 'data'],
			}),
		).not.toThrow();

		// Content Get: requires collection and id
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'get',
				requiredControls: ['collection', 'id'],
			}),
		).not.toThrow();

		// Content Update: requires collection, id, and data
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'update',
				requiredControls: ['collection', 'id', 'data'],
			}),
		).not.toThrow();

		// Content Schedule: requires collection, id, and scheduledAt
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'schedule',
				requiredControls: ['collection', 'id', 'scheduledAt'],
			}),
		).not.toThrow();

		// Content Set Content Terms: requires collection, id, taxonomy, and termIds
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'setContentTerms',
				requiredControls: ['collection', 'id', 'taxonomy', 'termIds'],
			}),
		).not.toThrow();

		// Content Get Translations: requires collection and id
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'getTranslations',
				requiredControls: ['collection', 'id'],
			}),
		).not.toThrow();

		// Content Get Authors: requires collection
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'getAuthors',
				requiredControls: ['collection'],
			}),
		).not.toThrow();

		// Content Get Trashed: requires collection
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'getTrashed',
				requiredControls: ['collection'],
			}),
		).not.toThrow();

		// Content Get Edit Lock: requires collection and id
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'getLock',
				requiredControls: ['collection', 'id'],
			}),
		).not.toThrow();

		// Content Acquire Edit Lock: requires collection and id
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'acquireLock',
				requiredControls: ['collection', 'id'],
			}),
		).not.toThrow();

		// Content Release Edit Lock: requires collection and id
		expect(() =>
			assertRequiredControls(description, {
				resource: 'content',
				operation: 'releaseLock',
				requiredControls: ['collection', 'id'],
			}),
		).not.toThrow();

		// Media Get: requires mediaId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'get',
				requiredControls: ['mediaId'],
			}),
		).not.toThrow();

		// Media Update: requires mediaId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'update',
				requiredControls: ['mediaId'],
			}),
		).not.toThrow();

		// Media Delete: requires mediaId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'delete',
				requiredControls: ['mediaId'],
			}),
		).not.toThrow();

		// Media Get Usage: requires mediaId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'getUsage',
				requiredControls: ['mediaId'],
			}),
		).not.toThrow();

		// Media Upload: requires binaryPropertyName
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'upload',
				requiredControls: ['binaryPropertyName'],
			}),
		).not.toThrow();

		// Media Replace Image: requires mediaId, binaryPropertyName, width, height
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'replaceImage',
				requiredControls: ['mediaId', 'binaryPropertyName', 'width', 'height'],
			}),
		).not.toThrow();

		// Media Get Upload Target: requires filename, contentType, size
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'getUploadTarget',
				requiredControls: ['filename', 'contentType', 'size'],
			}),
		).not.toThrow();

		// Media Upload Pending: requires mediaId, binaryPropertyName
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'uploadPending',
				requiredControls: ['mediaId', 'binaryPropertyName'],
			}),
		).not.toThrow();

		// Media Confirm Upload: requires mediaId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'confirmUpload',
				requiredControls: ['mediaId'],
			}),
		).not.toThrow();

		// Media Folder Get: requires folderId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'getFolder',
				requiredControls: ['folderId'],
			}),
		).not.toThrow();

		// Media Folder Create: requires name
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'createFolder',
				requiredControls: ['name'],
			}),
		).not.toThrow();

		// Media Folder Update: requires folderId and name
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'updateFolder',
				requiredControls: ['folderId', 'name'],
			}),
		).not.toThrow();

		// Media Folder Delete: requires folderId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'media',
				operation: 'deleteFolder',
				requiredControls: ['folderId'],
			}),
		).not.toThrow();

		// Taxonomy Get: requires taxonomy
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'getTaxonomy',
				requiredControls: ['taxonomy'],
			}),
		).not.toThrow();

		// Taxonomy Update: requires taxonomy
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'updateTaxonomy',
				requiredControls: ['taxonomy'],
			}),
		).not.toThrow();

		// Taxonomy Delete: requires taxonomy
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'deleteTaxonomy',
				requiredControls: ['taxonomy'],
			}),
		).not.toThrow();

		// Taxonomy Get Many Terms: requires taxonomy
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'getAllTerms',
				requiredControls: ['taxonomy'],
			}),
		).not.toThrow();

		// Taxonomy Get Term: requires taxonomy and termSlug
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'getTerm',
				requiredControls: ['taxonomy', 'termSlug'],
			}),
		).not.toThrow();

		// Taxonomy Create Term: requires taxonomy and label
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'createTerm',
				requiredControls: ['taxonomy', 'label'],
			}),
		).not.toThrow();

		// Taxonomy Update Term: requires taxonomy and termSlug
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'updateTerm',
				requiredControls: ['taxonomy', 'termSlug'],
			}),
		).not.toThrow();

		// Taxonomy Delete Term: requires taxonomy and termSlug
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'deleteTerm',
				requiredControls: ['taxonomy', 'termSlug'],
			}),
		).not.toThrow();

		// Taxonomy Reorder Terms: requires taxonomy and ids
		expect(() =>
			assertRequiredControls(description, {
				resource: 'taxonomy',
				operation: 'reorderTerms',
				requiredControls: ['taxonomy', 'ids'],
			}),
		).not.toThrow();

		// Search: requires q
		expect(() =>
			assertRequiredControls(description, {
				resource: 'search',
				operation: 'search',
				requiredControls: ['q'],
			}),
		).not.toThrow();

		// Search Suggest: requires q
		expect(() =>
			assertRequiredControls(description, {
				resource: 'search',
				operation: 'suggest',
				requiredControls: ['q'],
			}),
		).not.toThrow();

		// Search Rebuild Index: requires collection
		expect(() =>
			assertRequiredControls(description, {
				resource: 'search',
				operation: 'rebuildIndex',
				requiredControls: ['collection'],
			}),
		).not.toThrow();

		// Search Enable: requires collection and enabled
		expect(() =>
			assertRequiredControls(description, {
				resource: 'search',
				operation: 'enableSearch',
				requiredControls: ['collection', 'enabled'],
			}),
		).not.toThrow();

		// Redirect Get: requires redirectId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'redirect',
				operation: 'getRedirect',
				requiredControls: ['redirectId'],
			}),
		).not.toThrow();

		// Redirect Create: requires source
		expect(() =>
			assertRequiredControls(description, {
				resource: 'redirect',
				operation: 'createRedirect',
				requiredControls: ['source'],
			}),
		).not.toThrow();

		// Redirect Update: requires redirectId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'redirect',
				operation: 'updateRedirect',
				requiredControls: ['redirectId'],
			}),
		).not.toThrow();

		// Redirect Delete: requires redirectId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'redirect',
				operation: 'deleteRedirect',
				requiredControls: ['redirectId'],
			}),
		).not.toThrow();

		// Redirect Prune 404 Log: requires olderThan
		expect(() =>
			assertRequiredControls(description, {
				resource: 'redirect',
				operation: 'prune404Log',
				requiredControls: ['olderThan'],
			}),
		).not.toThrow();

		// Comment Get: requires commentId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'comment',
				operation: 'get',
				requiredControls: ['commentId'],
			}),
		).not.toThrow();

		// Comment Update Status: requires commentId and status
		expect(() =>
			assertRequiredControls(description, {
				resource: 'comment',
				operation: 'updateStatus',
				requiredControls: ['commentId', 'status'],
			}),
		).not.toThrow();

		// Comment Bulk Action: requires ids and action
		expect(() =>
			assertRequiredControls(description, {
				resource: 'comment',
				operation: 'bulkAction',
				requiredControls: ['ids', 'action'],
			}),
		).not.toThrow();

		// Comment Delete: requires commentId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'comment',
				operation: 'delete',
				requiredControls: ['commentId'],
			}),
		).not.toThrow();

		// Menu GetAll: requires no parameters
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'getAll',
				requiredControls: [],
			}),
		).not.toThrow();

		// Menu Get: requires menu
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'get',
				requiredControls: ['menu'],
			}),
		).not.toThrow();

		// Menu Create: requires name and label
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'create',
				requiredControls: ['name', 'label'],
			}),
		).not.toThrow();

		// Menu Update: requires menu and label
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'update',
				requiredControls: ['menu', 'label'],
			}),
		).not.toThrow();

		// Menu Delete: requires menu
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'delete',
				requiredControls: ['menu'],
			}),
		).not.toThrow();

		// Menu Create Item: requires menu, type, and label
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'createItem',
				requiredControls: ['menu', 'type', 'label'],
			}),
		).not.toThrow();

		// Menu Update Item: requires menu and itemId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'updateItem',
				requiredControls: ['menu', 'itemId'],
			}),
		).not.toThrow();

		// Menu Delete Item: requires menu and itemId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'deleteItem',
				requiredControls: ['menu', 'itemId'],
			}),
		).not.toThrow();

		// Menu Reorder Items: requires menu and items
		expect(() =>
			assertRequiredControls(description, {
				resource: 'menu',
				operation: 'reorderItems',
				requiredControls: ['menu', 'items'],
			}),
		).not.toThrow();

		// Settings Get: requires no controls
		expect(() =>
			assertRequiredControls(description, {
				resource: 'settings',
				operation: 'get',
				requiredControls: [],
			}),
		).not.toThrow();

		// Settings Update: requires settings
		expect(() =>
			assertRequiredControls(description, {
				resource: 'settings',
				operation: 'update',
				requiredControls: ['settings'],
			}),
		).not.toThrow();

		// Section GetAll: requires no controls
		expect(() =>
			assertRequiredControls(description, {
				resource: 'section',
				operation: 'getAll',
				requiredControls: [],
			}),
		).not.toThrow();

		// Section Get: requires section
		expect(() =>
			assertRequiredControls(description, {
				resource: 'section',
				operation: 'get',
				requiredControls: ['section'],
			}),
		).not.toThrow();

		// Section Create: requires slug, title, content
		expect(() =>
			assertRequiredControls(description, {
				resource: 'section',
				operation: 'create',
				requiredControls: ['slug', 'title', 'content'],
			}),
		).not.toThrow();

		// Section Update: requires section
		expect(() =>
			assertRequiredControls(description, {
				resource: 'section',
				operation: 'update',
				requiredControls: ['section'],
			}),
		).not.toThrow();

		// Section Delete: requires section
		expect(() =>
			assertRequiredControls(description, {
				resource: 'section',
				operation: 'delete',
				requiredControls: ['section'],
			}),
		).not.toThrow();

		// Widget Area GetAll: requires no controls
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'getAll',
				requiredControls: [],
			}),
		).not.toThrow();

		// Widget Area Get: requires widgetArea
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'get',
				requiredControls: ['widgetArea'],
			}),
		).not.toThrow();

		// Widget Area Create: requires name and label
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'create',
				requiredControls: ['name', 'label'],
			}),
		).not.toThrow();

		// Widget Area Delete: requires widgetArea
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'delete',
				requiredControls: ['widgetArea'],
			}),
		).not.toThrow();

		// Widget Area Create Widget: requires widgetArea and type
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'createWidget',
				requiredControls: ['widgetArea', 'type'],
			}),
		).not.toThrow();

		// Widget Area Update Widget: requires widgetArea and widgetId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'updateWidget',
				requiredControls: ['widgetArea', 'widgetId'],
			}),
		).not.toThrow();

		// Widget Area Delete Widget: requires widgetArea and widgetId
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'deleteWidget',
				requiredControls: ['widgetArea', 'widgetId'],
			}),
		).not.toThrow();

		// Widget Area Reorder Widgets: requires widgetArea and widgetIds
		expect(() =>
			assertRequiredControls(description, {
				resource: 'widgetArea',
				operation: 'reorderWidgets',
				requiredControls: ['widgetArea', 'widgetIds'],
			}),
		).not.toThrow();

		// Schema Get Many Collections: requires no controls
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'getCollections',
				requiredControls: [],
			}),
		).not.toThrow();

		// Schema Get Collection: requires collection
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'getCollection',
				requiredControls: ['collection'],
			}),
		).not.toThrow();

		// Schema Create Collection: requires slug and label
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'createCollection',
				requiredControls: ['slug', 'label'],
			}),
		).not.toThrow();

		// Schema Update Collection: requires collection
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'updateCollection',
				requiredControls: ['collection'],
			}),
		).not.toThrow();

		// Schema Delete Collection: requires collection
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'deleteCollection',
				requiredControls: ['collection'],
			}),
		).not.toThrow();

		// Schema Reorder Collections: requires slugs
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'reorderCollections',
				requiredControls: ['slugs'],
			}),
		).not.toThrow();

		// Schema Get Many Fields: requires collection
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'getFields',
				requiredControls: ['collection'],
			}),
		).not.toThrow();

		// Schema Get Field: requires collection and fieldSlug
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'getField',
				requiredControls: ['collection', 'fieldSlug'],
			}),
		).not.toThrow();

		// Schema Create Field: requires collection, slug, label, and type
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'createField',
				requiredControls: ['collection', 'slug', 'label', 'type'],
			}),
		).not.toThrow();

		// Schema Update Field: requires collection and fieldSlug
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'updateField',
				requiredControls: ['collection', 'fieldSlug'],
			}),
		).not.toThrow();

		// Schema Delete Field: requires collection and fieldSlug
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'deleteField',
				requiredControls: ['collection', 'fieldSlug'],
			}),
		).not.toThrow();

		// Schema Reorder Fields: requires collection and fieldSlugs
		expect(() =>
			assertRequiredControls(description, {
				resource: 'schema',
				operation: 'reorderFields',
				requiredControls: ['collection', 'fieldSlugs'],
			}),
		).not.toThrow();

		const collection = description.properties.find(({ name }) => name === 'collection');
		expect(collection?.required).toBe(true);
		expect(collection?.displayOptions?.show).toEqual({
			resource: ['content'],
		});

		const contentId = description.properties.find(
			({ name, displayOptions }) =>
				name === 'id' && displayOptions?.show?.resource?.includes('content'),
		);
		expect(contentId?.required).toBe(true);
		const contentIdOps = (contentId?.displayOptions?.show?.operation || []) as string[];
		expect(contentIdOps).toContain('getTranslations');
		expect(contentIdOps).toContain('getLock');
		expect(contentIdOps).toContain('acquireLock');
		expect(contentIdOps).toContain('releaseLock');
		expect(contentIdOps).not.toContain('getAuthors');
		expect(contentIdOps).not.toContain('getTrashed');

		const mediaId = description.properties.find(({ name }) => name === 'mediaId');
		expect(mediaId?.required).toBe(true);
		expect(mediaId?.displayOptions?.show?.resource).toEqual(['media']);
		expect(mediaId?.displayOptions?.show?.operation).toEqual([
			'get',
			'update',
			'delete',
			'getUsage',
			'replaceImage',
			'uploadPending',
			'confirmUpload',
		]);

		const folderId = description.properties.find(({ name }) => name === 'folderId');
		expect(folderId?.required).toBe(true);

		const taxonomy = description.properties.find(({ name }) => name === 'taxonomy');
		expect(taxonomy?.required).toBe(true);

		const termSlug = description.properties.find(({ name }) => name === 'termSlug');
		expect(termSlug?.required).toBe(true);

		const redirectId = description.properties.find(({ name }) => name === 'redirectId');
		expect(redirectId?.required).toBe(true);

		const commentId = description.properties.find(({ name }) => name === 'commentId');
		expect(commentId?.required).toBe(true);
		expect(commentId?.displayOptions?.show?.resource).toEqual(['comment']);
		expect(commentId?.displayOptions?.show?.operation).toEqual(['get', 'updateStatus', 'delete']);

		const menu = description.properties.find(({ name }) => name === 'menu');
		expect(menu?.required).toBe(true);
		expect(menu?.displayOptions?.show?.resource).toEqual(['menu']);
		expect(menu?.displayOptions?.show?.operation).toEqual([
			'get',
			'update',
			'delete',
			'createItem',
			'updateItem',
			'deleteItem',
			'reorderItems',
		]);

		const itemId = description.properties.find(({ name }) => name === 'itemId');
		expect(itemId?.required).toBe(true);
		expect(itemId?.displayOptions?.show?.resource).toEqual(['menu']);
		expect(itemId?.displayOptions?.show?.operation).toEqual(['updateItem', 'deleteItem']);

		const settings = description.properties.find(({ name }) => name === 'settings');
		expect(settings?.required).toBe(true);
		expect(settings?.displayOptions?.show?.resource).toEqual(['settings']);
		expect(settings?.displayOptions?.show?.operation).toEqual(['update']);

		const section = description.properties.find(({ name }) => name === 'section');
		expect(section?.required).toBe(true);
		expect(section?.displayOptions?.show?.resource).toEqual(['section']);
		expect(section?.displayOptions?.show?.operation).toEqual(['get', 'update', 'delete']);

		const widgetArea = description.properties.find(({ name }) => name === 'widgetArea');
		expect(widgetArea?.required).toBe(true);
		expect(widgetArea?.displayOptions?.show?.resource).toEqual(['widgetArea']);
		expect(widgetArea?.displayOptions?.show?.operation).toEqual([
			'get',
			'delete',
			'createWidget',
			'updateWidget',
			'deleteWidget',
			'reorderWidgets',
		]);

		const widgetId = description.properties.find(({ name }) => name === 'widgetId');
		expect(widgetId?.required).toBe(true);
		expect(widgetId?.displayOptions?.show?.resource).toEqual(['widgetArea']);
		expect(widgetId?.displayOptions?.show?.operation).toEqual(['updateWidget', 'deleteWidget']);

		const schemaCollection = description.properties.find(
			({ name, displayOptions }) =>
				name === 'collection' && displayOptions?.show?.resource?.includes('schema'),
		);
		expect(schemaCollection?.required).toBe(true);
		expect(schemaCollection?.displayOptions?.show?.resource).toEqual(['schema']);

		const schemaField = description.properties.find(({ name }) => name === 'fieldSlug');
		expect(schemaField?.required).toBe(true);
		expect(schemaField?.displayOptions?.show?.resource).toEqual(['schema']);
		expect(schemaField?.displayOptions?.show?.operation).toEqual([
			'getField',
			'updateField',
			'deleteField',
		]);
	});

	it('normalizes manual and list-mode resource locator values', () => {
		expect(normalizeResourceLocator(' posts ', 'Collection')).toBe('posts');
		expect(normalizeResourceLocator({ mode: 'list', value: ' articles ' }, 'Collection')).toBe(
			'articles',
		);
		expect(() => normalizeResourceLocator({ mode: 'list' }, 'Collection')).toThrow(
			'Collection must contain a non-empty list or manual value',
		);
	});

	it('demonstrates a test-contract preflight before a transport call', () => {
		let transportCalls = 0;
		const execute = () => {
			requireNonBlankDefaults({ collection: '' }, ['collection']);
			transportCalls += 1;
		};
		expect(execute).toThrow('collection is required before transport');
		expect(transportCalls).toBe(0);
	});
});
