import { describe, expect, it } from 'vitest';
import { Emdash, EmDash } from '../nodes/EmDash/Emdash.node';
import { EmDashApi } from '../credentials/EmDashApi.credentials';
import { normalizeBaseUrl } from '../nodes/EmDash/shared/utils';
import {
	EmDashApiError,
	unwrapContentItem,
	unwrapEnvelope,
	cursorPaginationOperations,
	prepareMediaUpload,
} from '../nodes/EmDash/shared/transport';
import type { INodePropertyOptions } from 'n8n-workflow';

describe('EmDash integration tests', () => {
	const node = new EmDash();
	const credentials = new EmDashApi();

	describe('baseURL normalization', () => {
		it('normalizes base URLs correctly across variations', () => {
			expect(normalizeBaseUrl('https://cms.example.com')).toBe(
				'https://cms.example.com/_emdash/api',
			);
			expect(normalizeBaseUrl('https://cms.example.com/')).toBe(
				'https://cms.example.com/_emdash/api',
			);
			expect(normalizeBaseUrl('  https://cms.example.com///  ')).toBe(
				'https://cms.example.com/_emdash/api',
			);
			expect(normalizeBaseUrl('https://cms.example.com/_emdash/api')).toBe(
				'https://cms.example.com/_emdash/api',
			);
			expect(normalizeBaseUrl('https://cms.example.com/_emdash/api/')).toBe(
				'https://cms.example.com/_emdash/api',
			);
		});

		it('matches node and credential requestDefaults configuration', () => {
			expect(node.description.requestDefaults?.baseURL).toBe(
				'={{$credentials.siteUrl.trim().replace(/\\/+$/, "") + "/_emdash/api"}}',
			);
			expect(credentials.test?.request.baseURL).toBe(
				'={{$credentials.siteUrl.trim().replace(/\\/+$/, "") + "/_emdash/api"}}',
			);
		});
	});

	describe('Bearer authentication', () => {
		it('uses Authorization: Bearer {{$credentials.apiToken}}', () => {
			expect(credentials.name).toBe('emdashApi');
			expect(credentials.authenticate?.type).toBe('generic');
			expect(credentials.authenticate?.properties?.headers).toEqual({
				Authorization: '=Bearer {{$credentials.apiToken}}',
			});
		});

		it('contains siteUrl and apiToken fields', () => {
			const siteUrl = credentials.properties.find((p) => p.name === 'siteUrl');
			const apiToken = credentials.properties.find((p) => p.name === 'apiToken');
			expect(siteUrl?.required).toBe(true);
			expect(apiToken?.required).toBe(true);
			expect(apiToken?.typeOptions?.password).toBe(true);
		});
	});

	describe('envelope unwrapping', () => {
		it('unwraps successful envelopes to the data payload', () => {
			const unwrapped = unwrapEnvelope({
				success: true,
				data: { id: 'post-1', title: 'Hello World' },
			});
			expect(unwrapped).toEqual({ id: 'post-1', title: 'Hello World' });
		});

		it('unwraps array data payloads', () => {
			const items = [{ id: '1' }, { id: '2' }];
			const unwrapped = unwrapEnvelope({
				success: true,
				data: items,
			});
			expect(unwrapped).toEqual(items);
		});

		it('passes through non-envelope responses', () => {
			const raw = { rawProperty: 123 };
			expect(unwrapEnvelope(raw)).toEqual(raw);
		});
	});

	describe('error envelope preservation', () => {
		it('preserves error code and message in EmDashApiError', () => {
			const errorPayload = {
				success: false,
				error: {
					code: 'ENTRY_LOCKED',
					message: 'Another user holds the edit lock on this entry',
				},
			};

			expect(() => unwrapEnvelope(errorPayload)).toThrow(EmDashApiError);
			try {
				unwrapEnvelope(errorPayload);
			} catch (err) {
				const apiErr = err as EmDashApiError;
				expect(apiErr.code).toBe('ENTRY_LOCKED');
				expect(apiErr.message).toBe('Another user holds the edit lock on this entry');
			}
		});

		it('falls back to default code and message when error details are missing', () => {
			expect(() => unwrapEnvelope({ success: false })).toThrow(EmDashApiError);
			try {
				unwrapEnvelope({ success: false });
			} catch (err) {
				const apiErr = err as EmDashApiError;
				expect(apiErr.code).toBe('UNKNOWN_ERROR');
				expect(apiErr.message).toBe('An unknown EmDash API error occurred');
			}
		});
	});

	describe('cursor pagination', () => {
		it('configures continue condition and cursor query parameter', () => {
			const pagination = cursorPaginationOperations.pagination;
			expect(pagination.type).toBe('generic');
			expect(pagination.properties.continue).toBe('={{ !!$response.body?.data?.nextCursor }}');
			expect(pagination.properties.request).toEqual({
				qs: {
					cursor: '={{ $response.body?.data?.nextCursor }}',
				},
			});
		});

		it('wires pagination in getAll returnAll routing', () => {
			const returnAll = node.description.properties.find((p) => p.name === 'returnAll');
			expect(returnAll?.routing?.send?.paginate).toBe('={{ $value }}');
			expect(returnAll?.routing?.send?.property).toBe('limit');
			expect(returnAll?.routing?.operations?.pagination).toEqual(
				cursorPaginationOperations.pagination,
			);
		});
	});

	describe('content CRUD and lifecycle operation routing', () => {
		const operationProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('content'),
		);
		const options = operationProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		const expectedOperations = [
			{
				name: 'getAll',
				method: 'GET',
				url: '=/content/{{$parameter.collection}}',
			},
			{
				name: 'get',
				method: 'GET',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}',
			},
			{
				name: 'create',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}',
			},
			{
				name: 'update',
				method: 'PUT',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}',
			},
			{
				name: 'delete',
				method: 'DELETE',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}',
			},
			{
				name: 'publish',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/publish',
			},
			{
				name: 'unpublish',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/unpublish',
			},
			{
				name: 'schedule',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/schedule',
			},
			{
				name: 'unschedule',
				method: 'DELETE',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/schedule',
			},
			{
				name: 'duplicate',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/duplicate',
			},
			{
				name: 'restore',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/restore',
			},
			{
				name: 'permanentDelete',
				method: 'DELETE',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/permanent',
			},
			{
				name: 'compare',
				method: 'GET',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/compare',
			},
			{
				name: 'discardDraft',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/discard-draft',
			},
			{
				name: 'getContentTerms',
				method: 'GET',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/terms/{{$parameter.taxonomy}}',
			},
			{
				name: 'setContentTerms',
				method: 'POST',
				url: '=/content/{{$parameter.collection}}/{{$parameter.id}}/terms/{{$parameter.taxonomy}}',
			},
		];

		it('registers all 16 content operations with correct HTTP methods and paths', () => {
			expect(options).toHaveLength(16);
			for (const expected of expectedOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('unwraps data.items for getAll and data for single item operations', () => {
			const getAll = getOperation('getAll');
			expect(getAll?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);

			const get = getOperation('get');
			expect(get?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);
		});
	});

	describe('_rev handling', () => {
		it('merges _rev into unwrapContentItem output', () => {
			const response = {
				success: true,
				data: {
					item: { id: 'entry-123', slug: 'my-post', status: 'draft' },
					_rev: 'rev-token-xyz',
				},
			};

			const item = unwrapContentItem(response) as { id: string; _rev: string; status: string };
			expect(item.id).toBe('entry-123');
			expect(item._rev).toBe('rev-token-xyz');
			expect(item.status).toBe('draft');
		});

		it('includes _rev parameter across operations supporting concurrency', () => {
			const updateFields = node.description.properties.find((p) => p.name === 'updateFields');
			const updateRev = updateFields?.options?.find((o) => o.name === '_rev');
			expect(updateRev).toBeDefined();

			const publishOptions = node.description.properties.find((p) => p.name === 'publishOptions');
			const publishRev = publishOptions?.options?.find((o) => o.name === '_rev');
			expect(publishRev).toBeDefined();

			const scheduleRev = node.description.properties.find(
				(p) => p.name === '_rev' && p.displayOptions?.show?.operation?.includes('schedule'),
			);
			expect(scheduleRev).toBeDefined();

			const discardOptions = node.description.properties.find(
				(p) => p.name === 'discardDraftOptions',
			);
			const discardRev = discardOptions?.options?.find((o) => o.name === '_rev');
			expect(discardRev).toBeDefined();
		});
	});

	describe('terms assignment', () => {
		it('configures setContentTerms with taxonomy and termIds', () => {
			const taxonomy = node.description.properties.find(
				(p) =>
					p.name === 'taxonomy' && p.displayOptions?.show?.operation?.includes('setContentTerms'),
			);
			expect(taxonomy?.required).toBe(true);

			const termIds = node.description.properties.find((p) => p.name === 'termIds');
			expect(termIds?.required).toBe(true);
			expect(termIds?.routing?.send?.type).toBe('body');
			expect(termIds?.routing?.send?.property).toBe('termIds');
			expect(termIds?.routing?.send?.value).toContain('Array.isArray($value)');
		});
	});

	describe('media operations routing', () => {
		const mediaOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('media'),
		);
		const options = mediaOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		const expectedMediaOperations = [
			{ name: 'getAll', method: 'GET', url: '/media' },
			{ name: 'get', method: 'GET', url: '=/media/{{$parameter.mediaId}}' },
			{ name: 'upload', method: 'POST', url: '/media' },
			{ name: 'update', method: 'PUT', url: '=/media/{{$parameter.mediaId}}' },
			{ name: 'delete', method: 'DELETE', url: '=/media/{{$parameter.mediaId}}' },
			{ name: 'getUsage', method: 'GET', url: '=/media/{{$parameter.mediaId}}/usage' },
		];

		it('registers everyday media operations with correct HTTP methods and paths', () => {
			for (const expected of expectedMediaOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('unwraps data.items for getAll and data for single item/action operations', () => {
			const getAll = getOperation('getAll');
			expect(getAll?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);

			const get = getOperation('get');
			expect(get?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);

			const upload = getOperation('upload');
			expect(upload?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);
		});

		it('configures upload operation with prepareMediaUpload preSend hook', () => {
			const upload = getOperation('upload');
			expect(upload?.routing?.send?.preSend).toEqual([prepareMediaUpload]);
		});
	});

	describe('media folder operations routing', () => {
		const mediaOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('media'),
		);
		const options = mediaOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		const expectedFolderOperations = [
			{ name: 'getAllFolders', method: 'GET', url: '/media/folders' },
			{ name: 'getFolder', method: 'GET', url: '=/media/folders/{{$parameter.folderId}}' },
			{ name: 'createFolder', method: 'POST', url: '/media/folders' },
			{ name: 'updateFolder', method: 'PUT', url: '=/media/folders/{{$parameter.folderId}}' },
			{ name: 'deleteFolder', method: 'DELETE', url: '=/media/folders/{{$parameter.folderId}}' },
		];

		it('registers all 5 media folder operations with correct HTTP methods and paths', () => {
			for (const expected of expectedFolderOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('unwraps data.items for getAllFolders and data for single folder operations', () => {
			const getAllFolders = getOperation('getAllFolders');
			expect(getAllFolders?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);

			const getFolder = getOperation('getFolder');
			expect(getFolder?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);
		});
	});

	describe('media upload preSend hook implementation', () => {
		it('builds multipart FormData and deletes Content-Type header', async () => {
			const fileBuffer = Buffer.from('test-binary-data');
			const mockContext = {
				getNodeParameter: (name: string, fallback?: unknown) => {
					if (name === 'binaryPropertyName') return 'data';
					if (name === 'additionalFields') {
						return {
							folderId: 'fld_test',
							deduplicate: true,
							ensureUniqueFilename: true,
						};
					}
					return fallback;
				},
				helpers: {
					assertBinaryData: (prop: string) => {
						expect(prop).toBe('data');
						return {
							fileName: 'photo.jpg',
							mimeType: 'image/jpeg',
						};
					},
					getBinaryDataBuffer: async (prop: string) => {
						expect(prop).toBe('data');
						return fileBuffer;
					},
				},
			};

			const requestOptions = {
				method: 'POST' as const,
				url: 'https://example.com/_emdash/api/media',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			};

			const result = await prepareMediaUpload.call(mockContext as never, requestOptions);
			expect(result.headers?.['Content-Type']).toBeUndefined();
			expect(result.headers?.['content-type']).toBeUndefined();
			expect(result.body).toBeInstanceOf(FormData);

			const formData = result.body as FormData;
			expect(formData.get('folderId')).toBe('fld_test');
			expect(formData.get('deduplicate')).toBe('true');
			expect(formData.get('ensureUniqueFilename')).toBe('true');

			const blob = formData.get('file') as Blob;
			expect(blob).toBeDefined();
			expect(blob.type).toBe('image/jpeg');
		});
	});

	describe('taxonomy operations routing', () => {
		const taxonomyOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('taxonomy'),
		);
		const options = taxonomyOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		const expectedTaxonomyOperations = [
			{ name: 'getAllTaxonomies', method: 'GET', url: '/taxonomies' },
			{ name: 'getTaxonomy', method: 'GET', url: '=/taxonomies/{{$parameter.taxonomy}}' },
			{ name: 'updateTaxonomy', method: 'PUT', url: '=/taxonomies/{{$parameter.taxonomy}}' },
			{ name: 'deleteTaxonomy', method: 'DELETE', url: '=/taxonomies/{{$parameter.taxonomy}}' },
		];

		it('registers all 4 taxonomy definition operations with correct HTTP methods and paths', () => {
			for (const expected of expectedTaxonomyOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('unwraps data.taxonomies for getAllTaxonomies and data for single taxonomy operations', () => {
			const getAll = getOperation('getAllTaxonomies');
			expect(getAll?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.taxonomies',
					},
				},
			]);

			const get = getOperation('getTaxonomy');
			expect(get?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);
		});
	});

	describe('taxonomy term operations routing', () => {
		const taxonomyOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('taxonomy'),
		);
		const options = taxonomyOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		const expectedTermOperations = [
			{ name: 'getAllTerms', method: 'GET', url: '=/taxonomies/{{$parameter.taxonomy}}/terms' },
			{
				name: 'getTerm',
				method: 'GET',
				url: '=/taxonomies/{{$parameter.taxonomy}}/terms/{{$parameter.termSlug}}',
			},
			{ name: 'createTerm', method: 'POST', url: '=/taxonomies/{{$parameter.taxonomy}}/terms' },
			{
				name: 'updateTerm',
				method: 'PUT',
				url: '=/taxonomies/{{$parameter.taxonomy}}/terms/{{$parameter.termSlug}}',
			},
			{
				name: 'deleteTerm',
				method: 'DELETE',
				url: '=/taxonomies/{{$parameter.taxonomy}}/terms/{{$parameter.termSlug}}',
			},
			{ name: 'reorderTerms', method: 'POST', url: '=/taxonomies/{{$parameter.taxonomy}}/reorder' },
		];

		it('registers all 6 term operations with correct HTTP methods and paths', () => {
			for (const expected of expectedTermOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('explicitly verifies reorderTerms uses HTTP method POST', () => {
			const reorderOp = getOperation('reorderTerms');
			expect(reorderOp?.routing?.request?.method).toBe('POST');
			expect(reorderOp?.routing?.request?.url).toBe('=/taxonomies/{{$parameter.taxonomy}}/reorder');
		});

		it('unwraps data.terms for getAllTerms and data for other term operations', () => {
			const getAllTerms = getOperation('getAllTerms');
			expect(getAllTerms?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.terms',
					},
				},
			]);

			const createTerm = getOperation('createTerm');
			expect(createTerm?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);
		});
	});

	describe('search operations routing', () => {
		const searchOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('search'),
		);
		const options = searchOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		const expectedSearchOperations = [
			{ name: 'search', method: 'GET', url: '/search' },
			{ name: 'suggest', method: 'GET', url: '/search/suggest' },
			{ name: 'getStats', method: 'GET', url: '/search/stats' },
			{ name: 'rebuildIndex', method: 'POST', url: '/search/rebuild' },
			{ name: 'enableSearch', method: 'POST', url: '/search/enable' },
		];

		it('registers all 5 search operations with correct HTTP methods and paths', () => {
			expect(options).toHaveLength(5);
			for (const expected of expectedSearchOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('unwraps data.items for search and data for other search operations', () => {
			const search = getOperation('search');
			expect(search?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);

			for (const name of ['suggest', 'getStats', 'rebuildIndex', 'enableSearch']) {
				const op = getOperation(name);
				expect(op?.routing?.output?.postReceive).toEqual([
					{
						type: 'rootProperty',
						properties: {
							property: 'data',
						},
					},
				]);
			}
		});

		it('configures cursor pagination on search operation', () => {
			const returnAll = node.description.properties.find(
				(p) => p.name === 'returnAll' && p.displayOptions?.show?.resource?.includes('search'),
			);
			expect(returnAll?.routing?.send?.paginate).toBe('={{ $value }}');
			expect(returnAll?.routing?.send?.property).toBe('limit');
			expect(returnAll?.routing?.operations?.pagination).toEqual(
				cursorPaginationOperations.pagination,
			);
		});

		it('configures search query parameters', () => {
			const q = node.description.properties.find(
				(p) =>
					p.name === 'q' &&
					p.displayOptions?.show?.resource?.includes('search') &&
					p.displayOptions?.show?.operation?.includes('search'),
			);
			expect(q?.required).toBe(true);
			expect(q?.routing?.request?.qs).toEqual({ q: '={{$value}}' });

			const searchFilters = node.description.properties.find(
				(p) => p.name === 'filters' && p.displayOptions?.show?.resource?.includes('search'),
			);
			const collections = searchFilters?.options?.find((o) => o.name === 'collections');
			expect(collections).toBeDefined();
			const status = searchFilters?.options?.find((o) => o.name === 'status');
			expect(status).toBeDefined();
			const locale = searchFilters?.options?.find((o) => o.name === 'locale');
			expect(locale).toBeDefined();
			const scope = searchFilters?.options?.find((o) => o.name === 'scope');
			expect(scope).toBeDefined();
		});

		it('configures suggest query parameters and limit', () => {
			const q = node.description.properties.find(
				(p) =>
					p.name === 'q' &&
					p.displayOptions?.show?.resource?.includes('search') &&
					p.displayOptions?.show?.operation?.includes('suggest'),
			);
			expect(q?.required).toBe(true);

			const limit = node.description.properties.find(
				(p) =>
					p.name === 'limit' &&
					p.displayOptions?.show?.resource?.includes('search') &&
					p.displayOptions?.show?.operation?.includes('suggest'),
			);
			expect(limit?.default).toBe(50);
			expect(limit?.routing?.request?.qs).toEqual({ limit: '={{$value}}' });
		});

		it('configures enableSearch body properties', () => {
			const enabled = node.description.properties.find(
				(p) =>
					p.name === 'enabled' &&
					p.displayOptions?.show?.resource?.includes('search') &&
					p.displayOptions?.show?.operation?.includes('enableSearch'),
			);
			expect(enabled?.required).toBe(true);
			expect(enabled?.default).toBe(true);
			expect(enabled?.routing?.send?.type).toBe('body');
			expect(enabled?.routing?.send?.property).toBe('enabled');

			const additional = node.description.properties.find(
				(p) =>
					p.name === 'additionalFields' &&
					p.displayOptions?.show?.resource?.includes('search') &&
					p.displayOptions?.show?.operation?.includes('enableSearch'),
			);
			const tokenize = additional?.options?.find((o) => o.name === 'tokenize');
			expect(tokenize).toBeDefined();
			const weights = additional?.options?.find((o) => o.name === 'weights');
			expect(weights).toBeDefined();
		});

		it('wires search collection selector to body.collection', () => {
			const searchColl = node.description.properties.find(
				(p) =>
					p.name === 'collection' &&
					p.displayOptions?.show?.resource?.includes('search') &&
					p.displayOptions?.show?.operation?.includes('rebuildIndex'),
			);
			expect(searchColl?.required).toBe(true);
			expect(searchColl?.routing?.send?.type).toBe('body');
			expect(searchColl?.routing?.send?.property).toBe('collection');
		});
	});

	describe('redirect operations routing', () => {
		const redirectOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('redirect'),
		);
		const options = redirectOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		const expectedRedirectOperations = [
			{ name: 'getAllRedirects', method: 'GET', url: '/redirects' },
			{ name: 'getRedirect', method: 'GET', url: '=/redirects/{{$parameter.redirectId}}' },
			{ name: 'createRedirect', method: 'POST', url: '/redirects' },
			{ name: 'updateRedirect', method: 'PUT', url: '=/redirects/{{$parameter.redirectId}}' },
			{ name: 'deleteRedirect', method: 'DELETE', url: '=/redirects/{{$parameter.redirectId}}' },
			{ name: 'get404Entries', method: 'GET', url: '/redirects/404s' },
			{ name: 'get404Summary', method: 'GET', url: '/redirects/404s/summary' },
			{ name: 'prune404Log', method: 'POST', url: '/redirects/404s' },
			{ name: 'clear404Log', method: 'DELETE', url: '/redirects/404s' },
		];

		it('registers all 9 redirect operations with correct HTTP methods and paths', () => {
			expect(options).toHaveLength(9);
			for (const expected of expectedRedirectOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('clearly labels clear404Log as destructive "Clear All 404 Entries"', () => {
			const clearOp = getOperation('clear404Log');
			expect(clearOp?.name).toBe('Clear All 404 Entries');
			expect(clearOp?.action).toBe('Clear all 404 entries');
			expect(clearOp?.description).toContain('destructive');
		});

		it('unwraps data.items for lists and data for single/action operations', () => {
			expect(getOperation('getAllRedirects')?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);
			expect(getOperation('get404Entries')?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);
			expect(getOperation('get404Summary')?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);

			for (const name of [
				'getRedirect',
				'createRedirect',
				'updateRedirect',
				'deleteRedirect',
				'prune404Log',
				'clear404Log',
			]) {
				expect(getOperation(name)?.routing?.output?.postReceive).toEqual([
					{
						type: 'rootProperty',
						properties: {
							property: 'data',
						},
					},
				]);
			}
		});

		it('configures cursor pagination on getAllRedirects and get404Entries', () => {
			const redirectReturnAll = node.description.properties.find(
				(p) =>
					p.name === 'returnAll' &&
					p.displayOptions?.show?.resource?.includes('redirect') &&
					p.displayOptions?.show?.operation?.includes('getAllRedirects'),
			);
			expect(redirectReturnAll?.routing?.send?.paginate).toBe('={{ $value }}');
			expect(redirectReturnAll?.routing?.operations?.pagination).toEqual(
				cursorPaginationOperations.pagination,
			);

			const logReturnAll = node.description.properties.find(
				(p) =>
					p.name === 'returnAll' &&
					p.displayOptions?.show?.resource?.includes('redirect') &&
					p.displayOptions?.show?.operation?.includes('get404Entries'),
			);
			expect(logReturnAll?.routing?.send?.paginate).toBe('={{ $value }}');
			expect(logReturnAll?.routing?.operations?.pagination).toEqual(
				cursorPaginationOperations.pagination,
			);
		});

		it('configures createRedirect body parameters and destination conditional display', () => {
			const source = node.description.properties.find(
				(p) =>
					p.name === 'source' &&
					p.displayOptions?.show?.resource?.includes('redirect') &&
					p.displayOptions?.show?.operation?.includes('createRedirect'),
			);
			expect(source?.required).toBe(true);
			expect(source?.routing?.send?.type).toBe('body');
			expect(source?.routing?.send?.property).toBe('source');

			const type = node.description.properties.find(
				(p) =>
					p.name === 'type' &&
					p.displayOptions?.show?.resource?.includes('redirect') &&
					p.displayOptions?.show?.operation?.includes('createRedirect'),
			);
			expect(type?.default).toBe(301);
			expect(type?.options).toHaveLength(6);

			const destination = node.description.properties.find(
				(p) =>
					p.name === 'destination' &&
					p.displayOptions?.show?.resource?.includes('redirect') &&
					p.displayOptions?.show?.operation?.includes('createRedirect'),
			);
			expect(destination?.displayOptions?.hide?.type).toEqual([410, 451]);

			const enabled = node.description.properties.find(
				(p) =>
					p.name === 'enabled' &&
					p.displayOptions?.show?.resource?.includes('redirect') &&
					p.displayOptions?.show?.operation?.includes('createRedirect'),
			);
			expect(enabled?.default).toBe(true);
		});

		it('configures updateRedirect updateFields', () => {
			const updateFields = node.description.properties.find(
				(p) =>
					p.name === 'updateFields' &&
					p.displayOptions?.show?.resource?.includes('redirect') &&
					p.displayOptions?.show?.operation?.includes('updateRedirect'),
			);
			expect(updateFields).toBeDefined();
			const names = updateFields?.options?.map((o) => o.name);
			expect(names).toEqual(
				expect.arrayContaining(['source', 'destination', 'type', 'enabled', 'groupName']),
			);
		});

		it('configures prune404Log with olderThan datetime parameter', () => {
			const olderThan = node.description.properties.find((p) => p.name === 'olderThan');
			expect(olderThan?.required).toBe(true);
			expect(olderThan?.type).toBe('dateTime');
			expect(olderThan?.routing?.send?.type).toBe('body');
			expect(olderThan?.routing?.send?.property).toBe('olderThan');
		});

		it('wires redirectId property with required flag', () => {
			const redirectId = node.description.properties.find((p) => p.name === 'redirectId');
			expect(redirectId?.required).toBe(true);
			expect(redirectId?.displayOptions?.show?.operation).toEqual([
				'getRedirect',
				'updateRedirect',
				'deleteRedirect',
			]);
		});
	});

	describe('listSearch methods', () => {
		it('registers getCollections, getMediaFolders, and getTaxonomies', () => {
			expect(node.methods?.listSearch?.getCollections).toBeDefined();
			expect(node.methods?.listSearch?.getMediaFolders).toBeDefined();
			expect(node.methods?.listSearch?.getTaxonomies).toBeDefined();
		});
	});

	describe('node class exports', () => {
		it('exports both Emdash and EmDash constructors identically', () => {
			expect(Emdash).toBeDefined();
			expect(EmDash).toBeDefined();
			expect(Emdash).toBe(EmDash);
			const instance = new Emdash();
			expect(instance.description.name).toBe('emdash');
		});
	});
});
