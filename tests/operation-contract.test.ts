import { describe, expect, it } from 'vitest';
import { EmDash } from '../nodes/EmDash/Emdash.node';
import {
	assertRequiredControls,
	normalizeResourceLocator,
	requireNonBlankDefaults,
} from './helpers/operation-contract';

describe('EmDash node operation contracts', () => {
	it('checks required controls against actual display conditions', () => {
		const description = new EmDash().description;

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

		const collection = description.properties.find(({ name }) => name === 'collection');
		expect(collection?.required).toBe(true);
		expect(collection?.displayOptions?.show).toEqual({
			resource: ['content'],
		});

		const mediaId = description.properties.find(({ name }) => name === 'mediaId');
		expect(mediaId?.required).toBe(true);

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
