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
	parseAndValidateCommentIds,
	validateBulkCommentAction,
	parseAndValidateReorderMenuItems,
	validateReorderMenuItems,
	parseAndValidateSettings,
	validateUpdateSettings,
	validateCreateSection,
	validateUpdateSection,
	validateCreateWidgetArea,
	validateCreateWidget,
	validateUpdateWidget,
	validateReorderWidgets,
	validateStructuredContent,
	validateJsonObject,
	validateStringArray,
	validateReorderWidgetIds,
} from '../nodes/EmDash/shared/transport';
import { getMenus } from '../nodes/EmDash/listSearch/getMenus';
import { getSections } from '../nodes/EmDash/listSearch/getSections';
import { getWidgetAreas } from '../nodes/EmDash/listSearch/getWidgetAreas';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

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

	describe('comment moderation operation routing', () => {
		const commentOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('comment'),
		);
		const options = commentOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		it('registers Comment operation property with default getAll', () => {
			expect(commentOpProp).toBeDefined();
			expect(commentOpProp?.default).toBe('getAll');
			expect(options).toHaveLength(6);
		});

		const expectedOperations = [
			{
				name: 'getAll',
				method: 'GET',
				url: '/admin/comments',
				postReceiveProp: 'data.items',
			},
			{
				name: 'getCounts',
				method: 'GET',
				url: '/admin/comments/counts',
				postReceiveProp: 'data',
			},
			{
				name: 'get',
				method: 'GET',
				url: '=/admin/comments/{{$parameter.commentId}}',
				postReceiveProp: 'data',
			},
			{
				name: 'updateStatus',
				method: 'PUT',
				url: '=/admin/comments/{{$parameter.commentId}}/status',
				postReceiveProp: 'data',
			},
			{
				name: 'bulkAction',
				method: 'POST',
				url: '/admin/comments/bulk',
				postReceiveProp: 'data',
			},
			{
				name: 'delete',
				method: 'DELETE',
				url: '=/admin/comments/{{$parameter.commentId}}',
				postReceiveProp: 'data',
			},
		];

		it('registers all 6 comment operations with correct HTTP methods and paths', () => {
			for (const expected of expectedOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('unwraps data.items for getAll and data for other comment operations', () => {
			for (const expected of expectedOperations) {
				const op = getOperation(expected.name);
				expect(op?.routing?.output?.postReceive).toEqual([
					{
						type: 'rootProperty',
						properties: {
							property: expected.postReceiveProp,
						},
					},
				]);
			}
		});

		it('configures bulkAction operation with validateBulkCommentAction preSend hook', () => {
			const bulkAction = getOperation('bulkAction');
			expect(bulkAction?.routing?.send?.preSend).toEqual([validateBulkCommentAction]);
		});

		it('configures cursor pagination and returnAll logic for comment getAll', () => {
			const commentReturnAll = node.description.properties.find(
				(p) =>
					p.name === 'returnAll' &&
					p.displayOptions?.show?.resource?.includes('comment') &&
					p.displayOptions?.show?.operation?.includes('getAll'),
			);
			expect(commentReturnAll?.routing?.send?.paginate).toBe('={{ $value }}');
			expect(commentReturnAll?.routing?.send?.property).toBe('limit');
			expect(commentReturnAll?.routing?.send?.value).toBe('100');
			expect(commentReturnAll?.routing?.operations?.pagination).toEqual(
				cursorPaginationOperations.pagination,
			);

			const commentLimit = node.description.properties.find(
				(p) =>
					p.name === 'limit' &&
					p.displayOptions?.show?.resource?.includes('comment') &&
					p.displayOptions?.show?.operation?.includes('getAll'),
			);
			expect(commentLimit?.default).toBe(50);
			expect(commentLimit?.typeOptions?.minValue).toBe(1);
			expect(commentLimit?.typeOptions?.maxValue).toBe(100);
			expect(commentLimit?.routing?.send?.property).toBe('limit');
			expect(commentLimit?.routing?.output?.maxResults).toBe('={{$value}}');
		});

		it('configures comment getAll filters (collection, status, search)', () => {
			const filters = node.description.properties.find(
				(p) =>
					p.name === 'filters' &&
					p.displayOptions?.show?.resource?.includes('comment') &&
					p.displayOptions?.show?.operation?.includes('getAll'),
			);
			expect(filters).toBeDefined();
			const filterOptions = filters?.options as INodeProperties[];
			expect(filterOptions).toBeDefined();

			const collectionFilter = filterOptions.find((f) => f.name === 'collection');
			expect(collectionFilter).toBeDefined();
			expect(collectionFilter?.type).toBe('resourceLocator');
			expect(collectionFilter?.modes).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: 'list' }),
					expect.objectContaining({ name: 'id' }),
				]),
			);
			expect(collectionFilter?.routing?.request?.qs?.collection).toBeDefined();

			const statusFilter = filterOptions.find((f) => f.name === 'status');
			expect(statusFilter).toBeDefined();
			expect(statusFilter?.type).toBe('options');
			expect(statusFilter?.default).toBe('any');
			const statusOpts = (statusFilter?.options as Array<{ name: string; value: string }>).map(
				(o) => o.value,
			);
			expect(statusOpts).toEqual(['any', 'approved', 'pending', 'spam', 'trash']);
			expect(statusFilter?.routing?.request?.qs?.status).toBeDefined();

			const searchFilter = filterOptions.find((f) => f.name === 'search');
			expect(searchFilter).toBeDefined();
			expect(searchFilter?.type).toBe('string');
			expect(searchFilter?.routing?.request?.qs?.search).toBeDefined();
		});

		it('configures updateStatus status parameter options', () => {
			const statusProp = node.description.properties.find(
				(p) =>
					p.name === 'status' &&
					p.displayOptions?.show?.resource?.includes('comment') &&
					p.displayOptions?.show?.operation?.includes('updateStatus'),
			);
			expect(statusProp?.required).toBe(true);
			expect(statusProp?.default).toBe('approved');
			const statusOpts = (statusProp?.options as Array<{ name: string; value: string }>).map(
				(o) => o.value,
			);
			expect(statusOpts).toEqual(['approved', 'pending', 'spam', 'trash']);
			expect(statusProp?.routing?.send?.type).toBe('body');
			expect(statusProp?.routing?.send?.property).toBe('status');
		});

		it('wires commentId property with required flag for get, updateStatus, delete', () => {
			const commentId = node.description.properties.find((p) => p.name === 'commentId');
			expect(commentId?.required).toBe(true);
			expect(commentId?.displayOptions?.show?.resource).toEqual(['comment']);
			expect(commentId?.displayOptions?.show?.operation).toEqual(['get', 'updateStatus', 'delete']);
		});
	});

	describe('parseAndValidateCommentIds and validateBulkCommentAction', () => {
		describe('parseAndValidateCommentIds', () => {
			it('rejects empty array, blank string, and null/undefined', () => {
				expect(() => parseAndValidateCommentIds([])).toThrow('At least 1 comment ID is required');
				expect(() => parseAndValidateCommentIds('')).toThrow('At least 1 comment ID is required');
				expect(() => parseAndValidateCommentIds('   ')).toThrow(
					'At least 1 comment ID is required',
				);
				expect(() => parseAndValidateCommentIds(null)).toThrow('At least 1 comment ID is required');
				expect(() => parseAndValidateCommentIds(undefined)).toThrow(
					'At least 1 comment ID is required',
				);
			});

			it('rejects more than 100 IDs', () => {
				const ids101 = Array.from({ length: 101 }, (_, i) => `cmt_${i + 1}`);
				expect(() => parseAndValidateCommentIds(ids101)).toThrow(
					/Cannot process more than 100 comment IDs/,
				);
				expect(() => parseAndValidateCommentIds(ids101.join(','))).toThrow(
					/Cannot process more than 100 comment IDs/,
				);
			});

			it('rejects blank/whitespace items within list', () => {
				expect(() => parseAndValidateCommentIds(['cmt_1', '', 'cmt_2'])).toThrow(
					'Comment ID cannot be empty or whitespace',
				);
				expect(() => parseAndValidateCommentIds(['cmt_1', '   ', 'cmt_2'])).toThrow(
					'Comment ID cannot be empty or whitespace',
				);
				expect(() => parseAndValidateCommentIds('cmt_1,  , cmt_2')).toThrow(
					'Comment ID cannot be empty or whitespace',
				);
				expect(() => parseAndValidateCommentIds('cmt_1,')).toThrow(
					'Comment ID cannot be empty or whitespace',
				);
			});

			it('parses comma-separated, JSON array, and native array correctly', () => {
				expect(parseAndValidateCommentIds('cmt_1, cmt_2, cmt_3')).toEqual([
					'cmt_1',
					'cmt_2',
					'cmt_3',
				]);
				expect(parseAndValidateCommentIds('["cmt_1", "cmt_2", "cmt_3"]')).toEqual([
					'cmt_1',
					'cmt_2',
					'cmt_3',
				]);
				expect(parseAndValidateCommentIds([' cmt_1 ', 'cmt_2 '])).toEqual(['cmt_1', 'cmt_2']);
				expect(parseAndValidateCommentIds(' cmt_single ')).toEqual(['cmt_single']);
			});

			it('rejects non-string inputs such as numbers, objects, and booleans', () => {
				expect(() => parseAndValidateCommentIds(123)).toThrow(
					'Comment IDs must be an array, comma-separated string, or JSON array string',
				);
				expect(() => parseAndValidateCommentIds({ id: 'cmt_1' })).toThrow(
					'Comment IDs must be an array, comma-separated string, or JSON array string',
				);
				expect(() => parseAndValidateCommentIds(true)).toThrow(
					'Comment IDs must be an array, comma-separated string, or JSON array string',
				);
			});

			it('rejects non-string elements inside an array', () => {
				expect(() => parseAndValidateCommentIds([123])).toThrow(
					'Comment ID must be a non-empty string',
				);
				expect(() => parseAndValidateCommentIds(['cmt_1', 123])).toThrow(
					'Comment ID must be a non-empty string',
				);
				expect(() => parseAndValidateCommentIds([null])).toThrow(
					'Comment ID must be a non-empty string',
				);
				expect(() => parseAndValidateCommentIds([{}])).toThrow(
					'Comment ID must be a non-empty string',
				);
			});
		});

		describe('validateBulkCommentAction preSend hook', () => {
			const createMockContext = (params: Record<string, unknown>) => ({
				getNodeParameter: (name: string, fallback?: unknown) =>
					params[name] !== undefined ? params[name] : fallback,
			});

			it('rejects empty array or blank string', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: '', action: 'approve' }) as never,
						req,
					),
				).rejects.toThrow('At least 1 comment ID is required');

				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: [], action: 'approve' }) as never,
						req,
					),
				).rejects.toThrow('At least 1 comment ID is required');
			});

			it('rejects missing or blank action', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: 'cmt_1', action: '' }) as never,
						req,
					),
				).rejects.toThrow('Action is required for bulk comment action');

				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: 'cmt_1', action: '   ' }) as never,
						req,
					),
				).rejects.toThrow('Action is required for bulk comment action');

				await expect(
					validateBulkCommentAction.call(createMockContext({ ids: 'cmt_1' }) as never, req),
				).rejects.toThrow('Action is required for bulk comment action');
			});

			it('rejects invalid action strings with descriptive error', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: 'cmt_1', action: 'unapprove' }) as never,
						req,
					),
				).rejects.toThrow(
					'Invalid bulk comment action: "unapprove". Must be one of: approve, spam, trash, delete',
				);

				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: 'cmt_1', action: 'invalid' }) as never,
						req,
					),
				).rejects.toThrow(
					'Invalid bulk comment action: "invalid". Must be one of: approve, spam, trash, delete',
				);
			});

			it('rejects >100 IDs', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				const ids101 = Array.from({ length: 101 }, (_, i) => `cmt_${i + 1}`);
				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: ids101, action: 'trash' }) as never,
						req,
					),
				).rejects.toThrow(/Cannot process more than 100 comment IDs/);
			});

			it('rejects blank/whitespace items', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				await expect(
					validateBulkCommentAction.call(
						createMockContext({ ids: 'cmt_1,  , cmt_2', action: 'spam' }) as never,
						req,
					),
				).rejects.toThrow('Comment ID cannot be empty or whitespace');
			});

			it('parses comma-separated, JSON array, and native array and passes correct body', async () => {
				const baseReq = { method: 'POST' as const, url: 'https://example.com' };

				const res1 = await validateBulkCommentAction.call(
					createMockContext({ ids: 'cmt_1, cmt_2', action: 'approve' }) as never,
					{ ...baseReq },
				);
				expect(res1.body).toEqual({
					ids: ['cmt_1', 'cmt_2'],
					action: 'approve',
				});

				const res2 = await validateBulkCommentAction.call(
					createMockContext({ ids: '["cmt_3", "cmt_4"]', action: 'spam' }) as never,
					{ ...baseReq },
				);
				expect(res2.body).toEqual({
					ids: ['cmt_3', 'cmt_4'],
					action: 'spam',
				});

				const res3 = await validateBulkCommentAction.call(
					createMockContext({ ids: ['cmt_5', 'cmt_6'], action: 'delete' }) as never,
					{ ...baseReq },
				);
				expect(res3.body).toEqual({
					ids: ['cmt_5', 'cmt_6'],
					action: 'delete',
				});
			});
		});
	});

	describe('menu operations routing', () => {
		const menuOpProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('menu'),
		);
		const options = menuOpProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		it('registers Menu operation property with default getAll', () => {
			expect(menuOpProp).toBeDefined();
			expect(menuOpProp?.default).toBe('getAll');
			expect(options).toHaveLength(9);
		});

		const expectedOperations = [
			{
				name: 'getAll',
				method: 'GET',
				url: '/menus',
				postReceiveProp: 'data',
			},
			{
				name: 'get',
				method: 'GET',
				url: '=/menus/{{$parameter.menu}}',
				postReceiveProp: 'data',
			},
			{
				name: 'create',
				method: 'POST',
				url: '/menus',
				postReceiveProp: 'data',
			},
			{
				name: 'update',
				method: 'PUT',
				url: '=/menus/{{$parameter.menu}}',
				postReceiveProp: 'data',
			},
			{
				name: 'delete',
				method: 'DELETE',
				url: '=/menus/{{$parameter.menu}}',
				postReceiveProp: 'data',
			},
			{
				name: 'createItem',
				method: 'POST',
				url: '=/menus/{{$parameter.menu}}/items',
				postReceiveProp: 'data',
			},
			{
				name: 'updateItem',
				method: 'PUT',
				url: '=/menus/{{$parameter.menu}}/items/{{$parameter.itemId}}',
				postReceiveProp: 'data',
			},
			{
				name: 'deleteItem',
				method: 'DELETE',
				url: '=/menus/{{$parameter.menu}}/items/{{$parameter.itemId}}',
				postReceiveProp: 'data',
			},
			{
				name: 'reorderItems',
				method: 'POST',
				url: '=/menus/{{$parameter.menu}}/reorder',
				postReceiveProp: 'data',
			},
		];

		it('registers all 9 menu operations with correct HTTP methods and paths', () => {
			for (const expected of expectedOperations) {
				const op = getOperation(expected.name);
				expect(op, `Operation ${expected.name} should exist`).toBeDefined();
				expect(op?.routing?.request?.method).toBe(expected.method);
				expect(op?.routing?.request?.url).toBe(expected.url);
			}
		});

		it('unwraps data rootProperty for all 9 menu operations', () => {
			for (const expected of expectedOperations) {
				const op = getOperation(expected.name);
				expect(op?.routing?.output?.postReceive).toEqual([
					{
						type: 'rootProperty',
						properties: {
							property: expected.postReceiveProp,
						},
					},
				]);
			}
		});

		it('configures reorderItems operation with validateReorderMenuItems preSend hook', () => {
			const reorderOp = getOperation('reorderItems');
			expect(reorderOp?.routing?.send?.preSend).toEqual([validateReorderMenuItems]);
		});

		it('places locale query parameter across 8 operations and body parameter on create', () => {
			const queryOperations = [
				'getAll',
				'get',
				'update',
				'delete',
				'createItem',
				'updateItem',
				'deleteItem',
				'reorderItems',
			];

			for (const op of queryOperations) {
				const localeProp = node.description.properties.find(
					(p) =>
						p.name === 'locale' &&
						p.displayOptions?.show?.resource?.includes('menu') &&
						p.displayOptions?.show?.operation?.includes(op),
				);
				expect(localeProp, `locale property should exist for ${op}`).toBeDefined();
				expect(localeProp?.routing?.request?.qs?.locale).toBe('={{$value || undefined}}');
			}

			// create operation has locale in request body via additionalFields
			const createAdditional = node.description.properties.find(
				(p) =>
					p.name === 'additionalFields' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('create'),
			);
			expect(createAdditional).toBeDefined();
			const localeBody = (createAdditional?.options as INodeProperties[])?.find(
				(o) => o.name === 'locale',
			);
			expect(localeBody).toBeDefined();
			expect(localeBody?.routing?.send?.type).toBe('body');
			expect(localeBody?.routing?.send?.property).toBe('locale');
		});

		it('configures menu create parameters with name, label, and additionalFields', () => {
			const nameProp = node.description.properties.find(
				(p) =>
					p.name === 'name' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('create'),
			);
			expect(nameProp?.required).toBe(true);
			expect(nameProp?.routing?.send?.type).toBe('body');
			expect(nameProp?.routing?.send?.property).toBe('name');

			const labelProp = node.description.properties.find(
				(p) =>
					p.name === 'label' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('create'),
			);
			expect(labelProp?.required).toBe(true);
			expect(labelProp?.routing?.send?.type).toBe('body');
			expect(labelProp?.routing?.send?.property).toBe('label');

			const additional = node.description.properties.find(
				(p) =>
					p.name === 'additionalFields' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('create'),
			);
			const translationOf = (additional?.options as INodeProperties[])?.find(
				(o) => o.name === 'translationOf',
			);
			expect(translationOf).toBeDefined();
			expect(translationOf?.routing?.send?.type).toBe('body');
			expect(translationOf?.routing?.send?.property).toBe('translationOf');
		});

		it('configures menu update parameter with label and does not expose name changing', () => {
			const labelProp = node.description.properties.find(
				(p) =>
					p.name === 'label' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('update'),
			);
			expect(labelProp?.required).toBe(true);
			expect(labelProp?.routing?.send?.type).toBe('body');
			expect(labelProp?.routing?.send?.property).toBe('label');

			const nameProp = node.description.properties.find(
				(p) =>
					p.name === 'name' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('update'),
			);
			expect(nameProp).toBeUndefined();
		});

		it('provides clear destructive warning on menu delete', () => {
			const deleteOp = getOperation('delete');
			expect(deleteOp?.description).toContain('does not delete referenced content');
		});

		it('configures createItem parameters with conditional display for type', () => {
			const typeProp = node.description.properties.find(
				(p) =>
					p.name === 'type' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('createItem'),
			);
			expect(typeProp?.required).toBe(true);
			expect(typeProp?.default).toBe('custom');
			const typeValues = (typeProp?.options as Array<{ value: string }>).map((o) => o.value);
			expect(typeValues).toEqual(['collection', 'custom', 'page', 'post', 'taxonomy']);

			const labelProp = node.description.properties.find(
				(p) =>
					p.name === 'label' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('createItem'),
			);
			expect(labelProp?.required).toBe(true);

			const customUrlProp = node.description.properties.find(
				(p) =>
					p.name === 'customUrl' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('createItem'),
			);
			expect(customUrlProp?.displayOptions?.show?.type).toEqual(['custom']);

			const refCollProp = node.description.properties.find(
				(p) =>
					p.name === 'referenceCollection' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('createItem'),
			);
			expect(refCollProp?.displayOptions?.show?.type).toEqual([
				'collection',
				'page',
				'post',
				'taxonomy',
			]);

			const refIdProp = node.description.properties.find(
				(p) =>
					p.name === 'referenceId' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('createItem'),
			);
			expect(refIdProp?.displayOptions?.show?.type).toEqual([
				'collection',
				'page',
				'post',
				'taxonomy',
			]);

			const additional = node.description.properties.find(
				(p) =>
					p.name === 'additionalFields' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('createItem'),
			);
			expect(additional).toBeDefined();
			const fieldNames = additional?.options?.map((o) => o.name);
			expect(fieldNames).toEqual(
				expect.arrayContaining(['target', 'titleAttr', 'cssClasses', 'parentId', 'sortOrder']),
			);
		});

		it('configures updateItem with updateFields and does not expose type or reference properties', () => {
			const updateFields = node.description.properties.find(
				(p) =>
					p.name === 'updateFields' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('updateItem'),
			);
			expect(updateFields).toBeDefined();
			const names = updateFields?.options?.map((o) => o.name);
			expect(names).toEqual(
				expect.arrayContaining([
					'label',
					'customUrl',
					'target',
					'titleAttr',
					'cssClasses',
					'parentId',
					'sortOrder',
				]),
			);
			expect(names).not.toContain('type');
			expect(names).not.toContain('referenceCollection');
			expect(names).not.toContain('referenceId');
		});

		it('configures updateItem parentId behavior with null conversion for empty/null values', () => {
			const updateFields = node.description.properties.find(
				(p) =>
					p.name === 'updateFields' &&
					p.displayOptions?.show?.resource?.includes('menu') &&
					p.displayOptions?.show?.operation?.includes('updateItem'),
			);
			const parentIdProp = (updateFields?.options as INodeProperties[])?.find(
				(o) => o.name === 'parentId',
			);
			expect(parentIdProp).toBeDefined();
			expect(parentIdProp?.routing?.send?.property).toBe('parentId');
			expect(parentIdProp?.routing?.send?.value).toBe(
				'={{ $value === "null" || $value === "" ? null : $value }}',
			);

			// Test expression logic directly
			const evaluateExpr = ($value: unknown) =>
				$value === 'null' || $value === '' ? null : $value;
			expect(evaluateExpr('')).toBe(null);
			expect(evaluateExpr('null')).toBe(null);
			expect(evaluateExpr('parent_item_123')).toBe('parent_item_123');
		});

		it('provides clear non-destructive warning on deleteItem', () => {
			const deleteItemOp = getOperation('deleteItem');
			expect(deleteItemOp?.description).toContain('does not delete referenced content');
		});

		it('wires menuSelect and menuItemIdProperty with required flags', () => {
			const menu = node.description.properties.find((p) => p.name === 'menu');
			expect(menu?.required).toBe(true);
			expect(menu?.type).toBe('resourceLocator');
			expect(menu?.displayOptions?.show?.resource).toEqual(['menu']);

			const itemId = node.description.properties.find((p) => p.name === 'itemId');
			expect(itemId?.required).toBe(true);
			expect(itemId?.type).toBe('string');
			expect(itemId?.displayOptions?.show?.resource).toEqual(['menu']);
			expect(itemId?.displayOptions?.show?.operation).toEqual(['updateItem', 'deleteItem']);
		});
	});

	describe('parseAndValidateReorderMenuItems and validateReorderMenuItems', () => {
		const createMockContext = (params: Record<string, unknown>) => ({
			getNodeParameter: (name: string, fallback?: unknown) =>
				params[name] !== undefined ? params[name] : fallback,
		});

		it('validates valid flat reorder array', () => {
			const items = [
				{ id: 'item_1', parentId: null, sortOrder: 0 },
				{ id: 'item_2', parentId: null, sortOrder: 1 },
			];
			const result = parseAndValidateReorderMenuItems(items);
			expect(result).toEqual([
				{ id: 'item_1', parentId: null, sortOrder: 0 },
				{ id: 'item_2', parentId: null, sortOrder: 1 },
			]);
		});

		it('validates nested hierarchy with string parentId', () => {
			const items = [
				{ id: 'item_1', parentId: null, sortOrder: 0 },
				{ id: 'item_1_child', parentId: 'item_1', sortOrder: 0 },
			];
			const result = parseAndValidateReorderMenuItems(items);
			expect(result).toEqual([
				{ id: 'item_1', parentId: null, sortOrder: 0 },
				{ id: 'item_1_child', parentId: 'item_1', sortOrder: 0 },
			]);
		});

		it('supports explicit null parentId for root items', () => {
			const items = [{ id: 'item_root', parentId: null, sortOrder: 0 }];
			const result = parseAndValidateReorderMenuItems(items);
			expect(result[0].parentId).toBeNull();
		});

		it('parses valid JSON string representation', () => {
			const jsonStr = JSON.stringify([{ id: 'item_1', parentId: null, sortOrder: 0 }]);
			const result = parseAndValidateReorderMenuItems(jsonStr);
			expect(result).toEqual([{ id: 'item_1', parentId: null, sortOrder: 0 }]);
		});

		it('rejects malformed JSON', () => {
			expect(() => parseAndValidateReorderMenuItems('{ invalid json')).toThrow(
				/Invalid JSON for items/,
			);
		});

		it('rejects JSON that does not evaluate to an array', () => {
			expect(() => parseAndValidateReorderMenuItems('{"id": "item_1"}')).toThrow(
				'Items JSON expression must evaluate to an array',
			);
		});

		it('rejects empty array or missing input', () => {
			expect(() => parseAndValidateReorderMenuItems([])).toThrow(
				'At least 1 item is required to reorder',
			);
			expect(() => parseAndValidateReorderMenuItems('')).toThrow(
				'Items must be an array or JSON string',
			);
			expect(() => parseAndValidateReorderMenuItems(null)).toThrow(
				'Items must be an array or JSON string',
			);
			expect(() => parseAndValidateReorderMenuItems(undefined)).toThrow(
				'Items must be an array or JSON string',
			);
		});

		it('rejects blank IDs', () => {
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: '', parentId: null, sortOrder: 0 }]),
			).toThrow('cannot be empty or whitespace');
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: '   ', parentId: null, sortOrder: 0 }]),
			).toThrow('cannot be empty or whitespace');
		});

		it('rejects missing parentId', () => {
			expect(() => parseAndValidateReorderMenuItems([{ id: 'item_1', sortOrder: 0 }])).toThrow(
				'is missing required property "parentId"',
			);
		});

		it('rejects missing sortOrder', () => {
			expect(() => parseAndValidateReorderMenuItems([{ id: 'item_1', parentId: null }])).toThrow(
				'is missing required property "sortOrder"',
			);
		});

		it('rejects invalid parentId type', () => {
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: 'item_1', parentId: 123, sortOrder: 0 }]),
			).toThrow(/invalid parentId type: must be a string or null/);
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: 'item_1', parentId: true, sortOrder: 0 }]),
			).toThrow(/invalid parentId type: must be a string or null/);
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: 'item_1', parentId: '  ', sortOrder: 0 }]),
			).toThrow(/blank parentId: use null for root items/);
		});

		it('rejects negative sortOrder', () => {
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: 'item_1', parentId: null, sortOrder: -1 }]),
			).toThrow(/must be an integer >= 0/);
		});

		it('rejects fractional sortOrder', () => {
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: 'item_1', parentId: null, sortOrder: 1.5 }]),
			).toThrow(/must be an integer >= 0/);
		});

		it('rejects arbitrary coerced scalars and non-object items', () => {
			expect(() => parseAndValidateReorderMenuItems(['item_1'])).toThrow(/must be an object/);
			expect(() => parseAndValidateReorderMenuItems([123])).toThrow(/must be an object/);
			expect(() =>
				parseAndValidateReorderMenuItems([{ id: 123, parentId: null, sortOrder: 0 }]),
			).toThrow(/invalid id: must be a non-empty string/);
			expect(() =>
				parseAndValidateReorderMenuItems([
					{ id: 'item_1', parentId: null, sortOrder: '0' as never },
				]),
			).toThrow(/must be an integer >= 0/);
		});

		it('validateReorderMenuItems preSend hook populates requestOptions.body.items', async () => {
			const req = { method: 'POST' as const, url: 'https://example.com' };
			const items = [
				{ id: 'item_1', parentId: null, sortOrder: 0 },
				{ id: 'item_2', parentId: 'item_1', sortOrder: 0 },
			];
			const result = await validateReorderMenuItems.call(createMockContext({ items }) as never, {
				...req,
			});
			expect(result.body).toEqual({ items });
		});
	});

	describe('getMenus listSearch', () => {
		it('formats menu items with label, locale, and name clarity', async () => {
			const mockContext = {
				getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
				helpers: {
					httpRequestWithAuthentication: async () => ({
						success: true,
						data: [
							{ name: 'main', label: 'Main Navigation', locale: 'en' },
							{ name: 'footer', label: 'footer' },
							{ name: 'sidebar', label: 'Sidebar Links', locale: 'fr' },
						],
					}),
				},
			};

			const result = await getMenus.call(mockContext as never);
			expect(result.results).toEqual([
				{
					name: 'Main Navigation [en] (main)',
					value: 'main',
				},
				{
					name: 'footer',
					value: 'footer',
				},
				{
					name: 'Sidebar Links [fr] (sidebar)',
					value: 'sidebar',
				},
			]);
		});

		it('filters menus by search query', async () => {
			const mockContext = {
				getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
				helpers: {
					httpRequestWithAuthentication: async () => ({
						success: true,
						data: [
							{ name: 'main', label: 'Main Navigation', locale: 'en' },
							{ name: 'footer', label: 'Footer Links', locale: 'en' },
						],
					}),
				},
			};

			const result = await getMenus.call(mockContext as never, 'foot');
			expect(result.results).toEqual([
				{
					name: 'Footer Links [en] (footer)',
					value: 'footer',
				},
			]);
		});

		it('returns empty results on API error', async () => {
			const mockContext = {
				getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
				helpers: {
					httpRequestWithAuthentication: async () => {
						throw new Error('Network error');
					},
				},
			};

			const result = await getMenus.call(mockContext as never);
			expect(result.results).toEqual([]);
		});
	});

	describe('resource: settings', () => {
		const operationProp = node.description.properties.find(
			(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('settings'),
		);
		const options = operationProp?.options as INodePropertyOptions[];
		const getOperation = (val: string) => options?.find((o) => o.value === val);

		it('registers get and update operations with correct HTTP methods and paths', () => {
			expect(options).toHaveLength(2);

			const getOp = getOperation('get');
			expect(getOp, 'Operation get should exist').toBeDefined();
			expect(getOp?.routing?.request?.method).toBe('GET');
			expect(getOp?.routing?.request?.url).toBe('/settings');

			const updateOp = getOperation('update');
			expect(updateOp, 'Operation update should exist').toBeDefined();
			expect(updateOp?.routing?.request?.method).toBe('POST');
			expect(updateOp?.routing?.request?.url).toBe('/settings');
		});

		it('intentionally routes update operation with POST for EmDash 1.0.1 runtime compatibility despite OpenAPI PUT definition', () => {
			// Generated OpenAPI contract (packages/core/src/api/openapi/document.ts) specifies PUT /_emdash/api/settings (updateSettings).
			// However, actual EmDash 1.0.1 route implementation (packages/core/src/astro/routes/api/settings.ts) exports only GET and POST handlers,
			// and first-party admin client (packages/admin/src/lib/api/settings.ts) dispatches POST /settings.
			// Node intentionally wires POST to ensure reliable runtime execution with upstream EmDash 1.0.1.
			const updateOp = getOperation('update');
			expect(updateOp?.routing?.request?.method).toBe('POST');
			expect(updateOp?.routing?.request?.url).toBe('/settings');
		});

		it('unwraps data rootProperty for get and update operations', () => {
			const getOp = getOperation('get');
			expect(getOp?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);

			const updateOp = getOperation('update');
			expect(updateOp?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data',
					},
				},
			]);
		});

		it('wires validateUpdateSettings preSend hook on update operation', () => {
			const updateOp = getOperation('update');
			expect(updateOp?.routing?.send?.preSend).toEqual([validateUpdateSettings]);
		});

		it('wires settings property with required flag and json type', () => {
			const settingsProp = node.description.properties.find(
				(p) =>
					p.name === 'settings' &&
					p.displayOptions?.show?.resource?.includes('settings') &&
					p.displayOptions?.show?.operation?.includes('update'),
			);
			expect(settingsProp).toBeDefined();
			expect(settingsProp?.type).toBe('json');
			expect(settingsProp?.required).toBe(true);
			expect(settingsProp?.default).toBe('{}');
		});

		describe('Settings Update validation', () => {
			const createMockContext = (params: Record<string, unknown>) => ({
				getNodeParameter: (name: string, fallback?: unknown) =>
					params[name] !== undefined ? params[name] : fallback,
			});

			it('accepts valid object', () => {
				const input = { title: 'My Blog', tagline: 'A blog' };
				const validated = parseAndValidateSettings(input);
				expect(validated).toEqual({ title: 'My Blog', tagline: 'A blog' });
			});

			it('accepts valid JSON string', () => {
				const input = '{"title":"My Blog"}';
				const validated = parseAndValidateSettings(input);
				expect(validated).toEqual({ title: 'My Blog' });
			});

			it('accepts arbitrary custom settings fields', () => {
				const input = { customKey: 123, nested: { enabled: true } };
				const validated = parseAndValidateSettings(input);
				expect(validated).toEqual({ customKey: 123, nested: { enabled: true } });
			});

			it('rejects null', () => {
				expect(() => parseAndValidateSettings(null)).toThrow(/must be an object.*null/i);
			});

			it('rejects array', () => {
				expect(() => parseAndValidateSettings([1, 2, 3])).toThrow(/must be an object.*array/i);
				expect(() => parseAndValidateSettings('[1, 2, 3]')).toThrow(
					/must evaluate to an object.*array/i,
				);
			});

			it('rejects primitive values: number, boolean, string', () => {
				expect(() => parseAndValidateSettings(42)).toThrow(/must be an object.*number/i);
				expect(() => parseAndValidateSettings(true)).toThrow(/must be an object.*boolean/i);
				expect(() => parseAndValidateSettings('just a string')).toThrow(
					/Invalid JSON|must evaluate to an object/i,
				);
				expect(() => parseAndValidateSettings('"just a string"')).toThrow(
					/must evaluate to an object.*string/i,
				);
			});

			it('rejects empty string or malformed JSON string', () => {
				expect(() => parseAndValidateSettings('')).toThrow(/cannot be empty/i);
				expect(() => parseAndValidateSettings('   ')).toThrow(/cannot be empty/i);
				expect(() => parseAndValidateSettings('{ bad json')).toThrow(/Invalid JSON for settings/i);
			});

			it('executes preSend hook and sets requestOptions.body to validated settings', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				const settings = { title: 'My Blog', tagline: 'A blog' };
				const result = await validateUpdateSettings.call(createMockContext({ settings }) as never, {
					...req,
				});
				expect(result.body).toEqual(settings);
			});

			it('executes preSend hook with JSON string and sets requestOptions.body to parsed settings object', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				const settings = '{"title":"Parsed Title","featureFlags":{"beta":true}}';
				const result = await validateUpdateSettings.call(createMockContext({ settings }) as never, {
					...req,
				});
				expect(result.body).toEqual({
					title: 'Parsed Title',
					featureFlags: { beta: true },
				});
			});

			it('preSend hook rejects invalid settings input with informative error', async () => {
				const req = { method: 'POST' as const, url: 'https://example.com' };
				await expect(
					validateUpdateSettings.call(createMockContext({ settings: null }) as never, { ...req }),
				).rejects.toThrow(/must be an object/i);
				await expect(
					validateUpdateSettings.call(createMockContext({ settings: [1, 2] }) as never, { ...req }),
				).rejects.toThrow(/must be an object/i);
				await expect(
					validateUpdateSettings.call(createMockContext({ settings: 'invalid' }) as never, {
						...req,
					}),
				).rejects.toThrow(/Invalid JSON/i);
			});
		});
	});

	describe('section operations routing', () => {
		const sectionOperations = node.description.properties.find(
			(p) =>
				p.name === 'operation' &&
				(p.displayOptions?.show?.resource as string[])?.includes('section'),
		);
		const options = (sectionOperations?.options || []) as INodePropertyOptions[];

		it('registers Section operation property with default getAll', () => {
			expect(sectionOperations).toBeDefined();
			expect(sectionOperations?.default).toBe('getAll');
			expect(options).toHaveLength(5);
		});

		it('registers all 5 section operations with correct HTTP methods and paths', () => {
			const expected: Record<string, { method: string; url: string }> = {
				create: { method: 'POST', url: '/sections' },
				delete: { method: 'DELETE', url: '=/sections/{{$parameter.section}}' },
				get: { method: 'GET', url: '=/sections/{{$parameter.section}}' },
				getAll: { method: 'GET', url: '/sections' },
				update: { method: 'PUT', url: '=/sections/{{$parameter.section}}' },
			};

			for (const [operation, { method, url }] of Object.entries(expected)) {
				const option = options.find((opt) => opt.value === operation);
				expect(option, `Missing operation ${operation}`).toBeDefined();
				expect(option?.routing?.request?.method).toBe(method);
				expect(option?.routing?.request?.url).toBe(url);
			}
		});

		it('unwraps data.items for getAll and data for other section operations', () => {
			const getAll = options.find((opt) => opt.value === 'getAll');
			expect(getAll?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);

			for (const op of ['create', 'delete', 'get', 'update']) {
				const option = options.find((opt) => opt.value === op);
				expect(option?.routing?.output?.postReceive).toEqual([
					{
						type: 'rootProperty',
						properties: {
							property: 'data',
						},
					},
				]);
			}
		});

		it('configures cursor pagination and returnAll logic for section getAll', () => {
			const returnAll = node.description.properties.find(
				(p) =>
					p.name === 'returnAll' &&
					(p.displayOptions?.show?.resource as string[])?.includes('section'),
			);
			expect(returnAll).toBeDefined();
			expect(returnAll?.default).toBe(false);
			expect(returnAll?.routing?.operations).toEqual(cursorPaginationOperations);

			const limit = node.description.properties.find(
				(p) =>
					p.name === 'limit' && (p.displayOptions?.show?.resource as string[])?.includes('section'),
			);
			expect(limit).toBeDefined();
			expect(limit?.default).toBe(50);
		});

		it('wires sectionSelect with required flag for get, update, delete', () => {
			const section = node.description.properties.find((p) => p.name === 'section');
			expect(section).toBeDefined();
			expect(section?.required).toBe(true);
			expect(section?.displayOptions?.show?.resource).toEqual(['section']);
			expect(section?.displayOptions?.show?.operation).toEqual(['get', 'update', 'delete']);
		});

		it('provides clear warning on section delete', () => {
			const deleteOption = options.find((opt) => opt.value === 'delete');
			expect(deleteOption?.description).toContain('cannot delete theme sections');
			expect(deleteOption?.description).toContain('does not delete referenced content/media');
		});
	});

	describe('section validation and preSend', () => {
		const createMockContext = (params: Record<string, unknown>) => ({
			getNodeParameter: (name: string, fallback?: unknown) =>
				params[name] !== undefined ? params[name] : fallback,
		});

		describe('validateStructuredContent', () => {
			it('accepts valid array of objects', () => {
				const content = [{ type: 'hero', heading: 'Hello' }];
				expect(validateStructuredContent(content)).toEqual(content);
			});

			it('accepts valid JSON array string of objects', () => {
				const content = '[{"type":"hero","heading":"Hello"}]';
				expect(validateStructuredContent(content)).toEqual([{ type: 'hero', heading: 'Hello' }]);
			});

			it('accepts empty array', () => {
				expect(validateStructuredContent([])).toEqual([]);
				expect(validateStructuredContent('[]')).toEqual([]);
			});

			it('rejects null, undefined, and empty string', () => {
				expect(() => validateStructuredContent(null)).toThrow(/required and must be an array/i);
				expect(() => validateStructuredContent(undefined)).toThrow(
					/required and must be an array/i,
				);
				expect(() => validateStructuredContent('')).toThrow(/required and must be an array/i);
			});

			it('rejects JSON that is not an array', () => {
				expect(() => validateStructuredContent('{"type":"hero"}')).toThrow(
					/must evaluate to an array/i,
				);
			});

			it('rejects arrays containing primitive or null elements', () => {
				expect(() => validateStructuredContent([123])).toThrow(/must be an object/i);
				expect(() => validateStructuredContent(['hero'])).toThrow(/must be an object/i);
				expect(() => validateStructuredContent([null])).toThrow(/must be an object/i);
				expect(() => validateStructuredContent([true])).toThrow(/must be an object/i);
				expect(() => validateStructuredContent([[{}], [{}]])).toThrow(/must be an object/i);
			});
		});

		describe('validateStringArray', () => {
			it('accepts string array', () => {
				expect(validateStringArray(['tag1', 'tag2'])).toEqual(['tag1', 'tag2']);
			});

			it('accepts comma-separated string', () => {
				expect(validateStringArray('tag1, tag2, tag3')).toEqual(['tag1', 'tag2', 'tag3']);
			});

			it('accepts JSON array string', () => {
				expect(validateStringArray('["tag1", "tag2"]')).toEqual(['tag1', 'tag2']);
			});

			it('returns empty array for empty inputs', () => {
				expect(validateStringArray(null)).toEqual([]);
				expect(validateStringArray(undefined)).toEqual([]);
				expect(validateStringArray('')).toEqual([]);
			});

			it('rejects non-string array members', () => {
				expect(() => validateStringArray([123])).toThrow(/must be a string/i);
			});
		});

		describe('validateCreateSection preSend', () => {
			const req = { method: 'POST' as const, url: 'https://example.com' };

			it('populates valid section body with required and additional fields', async () => {
				const ctx = createMockContext({
					slug: 'hero-banner',
					title: 'Hero Banner',
					content: [{ type: 'heading', text: 'Welcome' }],
					additionalFields: {
						description: 'A hero banner section',
						keywords: 'hero, banner',
						previewMediaId: 'med_123',
						source: 'user',
						themeId: 'theme_456',
					},
				});

				const result = await validateCreateSection.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					slug: 'hero-banner',
					title: 'Hero Banner',
					content: [{ type: 'heading', text: 'Welcome' }],
					description: 'A hero banner section',
					keywords: ['hero', 'banner'],
					previewMediaId: 'med_123',
					source: 'user',
					themeId: 'theme_456',
				});
			});

			it('rejects invalid slug format', async () => {
				const ctx = createMockContext({
					slug: 'Hero Banner!',
					title: 'Hero Banner',
					content: [{ type: 'heading' }],
				});

				await expect(validateCreateSection.call(ctx as never, { ...req })).rejects.toThrow(
					/slug must only contain lowercase letters, numbers, and hyphens/i,
				);
			});

			it('rejects theme source on create', async () => {
				const ctx = createMockContext({
					slug: 'hero-banner',
					title: 'Hero Banner',
					content: [{ type: 'heading' }],
					additionalFields: {
						source: 'theme',
					},
				});

				await expect(validateCreateSection.call(ctx as never, { ...req })).rejects.toThrow(
					/Section source must be "user" or "import"/i,
				);
			});
		});

		describe('validateUpdateSection preSend', () => {
			const req = { method: 'PUT' as const, url: 'https://example.com' };

			it('rejects empty update with descriptive error', async () => {
				const ctx = createMockContext({ updateFields: {} });
				await expect(validateUpdateSection.call(ctx as never, { ...req })).rejects.toThrow(
					/At least one field must be provided to update section/i,
				);
			});

			it('clears previewMediaId when set to null, "null", or empty string', async () => {
				const ctx = createMockContext({
					updateFields: { previewMediaId: 'null' },
				});
				const result = await validateUpdateSection.call(ctx as never, { ...req });
				expect(result.body).toEqual({ previewMediaId: null });

				const ctxEmpty = createMockContext({
					updateFields: { previewMediaId: '' },
				});
				const resultEmpty = await validateUpdateSection.call(ctxEmpty as never, { ...req });
				expect(resultEmpty.body).toEqual({ previewMediaId: null });
			});

			it('updates title, content, and keywords', async () => {
				const ctx = createMockContext({
					updateFields: {
						title: 'New Title',
						content: [{ type: 'updated' }],
						keywords: ['new', 'keywords'],
					},
				});
				const result = await validateUpdateSection.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					title: 'New Title',
					content: [{ type: 'updated' }],
					keywords: ['new', 'keywords'],
				});
			});
		});
	});

	describe('widget area operations routing', () => {
		const widgetAreaOperations = node.description.properties.find(
			(p) =>
				p.name === 'operation' &&
				(p.displayOptions?.show?.resource as string[])?.includes('widgetArea'),
		);
		const options = (widgetAreaOperations?.options || []) as INodePropertyOptions[];

		it('registers Widget Area operation property with default getAll', () => {
			expect(widgetAreaOperations).toBeDefined();
			expect(widgetAreaOperations?.default).toBe('getAll');
			expect(options).toHaveLength(8);
		});

		it('registers all 8 widget area operations with correct HTTP methods and paths', () => {
			const expected: Record<string, { method: string; url: string }> = {
				create: { method: 'POST', url: '/widget-areas' },
				createWidget: {
					method: 'POST',
					url: '=/widget-areas/{{$parameter.widgetArea}}/widgets',
				},
				delete: { method: 'DELETE', url: '=/widget-areas/{{$parameter.widgetArea}}' },
				deleteWidget: {
					method: 'DELETE',
					url: '=/widget-areas/{{$parameter.widgetArea}}/widgets/{{$parameter.widgetId}}',
				},
				get: { method: 'GET', url: '=/widget-areas/{{$parameter.widgetArea}}' },
				getAll: { method: 'GET', url: '/widget-areas' },
				reorderWidgets: {
					method: 'POST',
					url: '=/widget-areas/{{$parameter.widgetArea}}/reorder',
				},
				updateWidget: {
					method: 'PUT',
					url: '=/widget-areas/{{$parameter.widgetArea}}/widgets/{{$parameter.widgetId}}',
				},
			};

			for (const [operation, { method, url }] of Object.entries(expected)) {
				const option = options.find((opt) => opt.value === operation);
				expect(option, `Missing operation ${operation}`).toBeDefined();
				expect(option?.routing?.request?.method).toBe(method);
				expect(option?.routing?.request?.url).toBe(url);
			}
		});

		it('unwraps data.items for getAll and data rootProperty for other widget area operations', () => {
			const getAll = options.find((opt) => opt.value === 'getAll');
			expect(getAll?.routing?.output?.postReceive).toEqual([
				{
					type: 'rootProperty',
					properties: {
						property: 'data.items',
					},
				},
			]);

			for (const op of [
				'create',
				'createWidget',
				'delete',
				'deleteWidget',
				'get',
				'reorderWidgets',
				'updateWidget',
			]) {
				const option = options.find((opt) => opt.value === op);
				expect(option?.routing?.output?.postReceive).toEqual([
					{
						type: 'rootProperty',
						properties: {
							property: 'data',
						},
					},
				]);
			}
		});

		it('wires widgetAreaSelect and widgetIdProperty with required flags', () => {
			const widgetArea = node.description.properties.find((p) => p.name === 'widgetArea');
			expect(widgetArea).toBeDefined();
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

			const widgetId = node.description.properties.find((p) => p.name === 'widgetId');
			expect(widgetId).toBeDefined();
			expect(widgetId?.required).toBe(true);
			expect(widgetId?.displayOptions?.show?.resource).toEqual(['widgetArea']);
			expect(widgetId?.displayOptions?.show?.operation).toEqual(['updateWidget', 'deleteWidget']);
		});

		it('clearly warns about cascade widget deletion on area delete', () => {
			const deleteOption = options.find((opt) => opt.value === 'delete');
			expect(deleteOption?.description).toContain(
				'Deleting a widget area also deletes its widgets.',
			);
		});

		it('clearly notes non-destructive scope on widget delete', () => {
			const deleteWidgetOption = options.find((opt) => opt.value === 'deleteWidget');
			expect(deleteWidgetOption?.description).toContain(
				'does not delete the widget area, menus, or components',
			);
		});
	});

	describe('widget area validation and preSend', () => {
		const createMockContext = (params: Record<string, unknown>) => ({
			getNodeParameter: (name: string, fallback?: unknown) =>
				params[name] !== undefined ? params[name] : fallback,
		});

		describe('validateJsonObject', () => {
			it('accepts valid object', () => {
				expect(validateJsonObject({ color: 'blue' })).toEqual({ color: 'blue' });
			});

			it('accepts valid JSON string', () => {
				expect(validateJsonObject('{"color":"blue"}')).toEqual({ color: 'blue' });
			});

			it('rejects null, undefined, empty string, arrays, and primitives', () => {
				expect(() => validateJsonObject(null)).toThrow(/must be an object.*null/i);
				expect(() => validateJsonObject(undefined)).toThrow(/must be an object.*undefined/i);
				expect(() => validateJsonObject('')).toThrow(/cannot be empty/i);
				expect(() => validateJsonObject([1, 2])).toThrow(/must be an object.*array/i);
				expect(() => validateJsonObject('[1, 2]')).toThrow(/must evaluate to an object.*array/i);
				expect(() => validateJsonObject(123)).toThrow(/must be an object.*number/i);
				expect(() => validateJsonObject('not-json')).toThrow(/Invalid JSON/i);
			});
		});

		describe('validateReorderWidgetIds', () => {
			it('accepts valid array of unique strings', () => {
				expect(validateReorderWidgetIds(['w1', 'w2'])).toEqual(['w1', 'w2']);
			});

			it('accepts comma-separated string', () => {
				expect(validateReorderWidgetIds('w1, w2')).toEqual(['w1', 'w2']);
			});

			it('accepts JSON array string', () => {
				expect(validateReorderWidgetIds('["w1", "w2"]')).toEqual(['w1', 'w2']);
			});

			it('rejects duplicate widget IDs', () => {
				expect(() => validateReorderWidgetIds(['w1', 'w1'])).toThrow(
					/Duplicate widget ID found in reorder list: "w1"/i,
				);
				expect(() => validateReorderWidgetIds('w1, w1')).toThrow(
					/Duplicate widget ID found in reorder list: "w1"/i,
				);
			});

			it('rejects empty or whitespace widget IDs', () => {
				expect(() => validateReorderWidgetIds([])).toThrow(/At least 1 widget ID is required/i);
				expect(() => validateReorderWidgetIds([''])).toThrow(/cannot be empty or whitespace/i);
				expect(() => validateReorderWidgetIds(['   '])).toThrow(/cannot be empty or whitespace/i);
			});

			it('rejects non-string members', () => {
				expect(() => validateReorderWidgetIds([123])).toThrow(/must be a non-empty string/i);
			});
		});

		describe('validateCreateWidgetArea preSend', () => {
			const req = { method: 'POST' as const, url: 'https://example.com' };

			it('populates valid widget area body', async () => {
				const ctx = createMockContext({
					name: 'sidebar-main',
					label: 'Main Sidebar',
					additionalFields: { description: 'Sidebar for blog pages' },
				});

				const result = await validateCreateWidgetArea.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					name: 'sidebar-main',
					label: 'Main Sidebar',
					description: 'Sidebar for blog pages',
				});
			});

			it('rejects blank name or label', async () => {
				const ctxBlankName = createMockContext({ name: '', label: 'Label' });
				await expect(
					validateCreateWidgetArea.call(ctxBlankName as never, { ...req }),
				).rejects.toThrow(/name is required/i);

				const ctxBlankLabel = createMockContext({ name: 'sidebar', label: '' });
				await expect(
					validateCreateWidgetArea.call(ctxBlankLabel as never, { ...req }),
				).rejects.toThrow(/label is required/i);
			});
		});

		describe('validateCreateWidget preSend', () => {
			const req = { method: 'POST' as const, url: 'https://example.com' };

			it('populates content widget', async () => {
				const ctx = createMockContext({
					type: 'content',
					title: 'Content Block',
					content: [{ type: 'html', body: '<p>Hi</p>' }],
				});

				const result = await validateCreateWidget.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					type: 'content',
					title: 'Content Block',
					content: [{ type: 'html', body: '<p>Hi</p>' }],
				});
			});

			it('populates menu widget', async () => {
				const ctx = createMockContext({
					type: 'menu',
					title: 'Navigation',
					menuName: 'main-menu',
				});

				const result = await validateCreateWidget.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					type: 'menu',
					title: 'Navigation',
					menuName: 'main-menu',
				});
			});

			it('populates component widget with props', async () => {
				const ctx = createMockContext({
					type: 'component',
					componentId: 'cmp_newsletter',
					componentProps: { showTitle: true },
				});

				const result = await validateCreateWidget.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					type: 'component',
					componentId: 'cmp_newsletter',
					componentProps: { showTitle: true },
				});
			});

			it('rejects invalid widget type', async () => {
				const ctx = createMockContext({
					type: 'invalid',
				});

				await expect(validateCreateWidget.call(ctx as never, { ...req })).rejects.toThrow(
					/Widget type must be "content", "menu", or "component"/i,
				);
			});
		});

		describe('validateUpdateWidget preSend', () => {
			const req = { method: 'PUT' as const, url: 'https://example.com' };

			it('rejects empty update with descriptive error', async () => {
				const ctx = createMockContext({ updateFields: {} });
				await expect(validateUpdateWidget.call(ctx as never, { ...req })).rejects.toThrow(
					/At least one field must be provided to update widget/i,
				);
			});

			it('updates provided fields', async () => {
				const ctx = createMockContext({
					updateFields: {
						title: 'New Widget Title',
						content: [{ type: 'updated' }],
					},
				});

				const result = await validateUpdateWidget.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					title: 'New Widget Title',
					content: [{ type: 'updated' }],
				});
			});
		});

		describe('validateReorderWidgets preSend', () => {
			const req = { method: 'POST' as const, url: 'https://example.com' };

			it('populates widgetIds and preserves order', async () => {
				const ctx = createMockContext({
					widgetIds: ['wid_3', 'wid_1', 'wid_2'],
				});

				const result = await validateReorderWidgets.call(ctx as never, { ...req });
				expect(result.body).toEqual({
					widgetIds: ['wid_3', 'wid_1', 'wid_2'],
				});
			});

			it('rejects duplicates in reorder', async () => {
				const ctx = createMockContext({
					widgetIds: ['wid_1', 'wid_1'],
				});

				await expect(validateReorderWidgets.call(ctx as never, { ...req })).rejects.toThrow(
					/Duplicate widget ID found in reorder list/i,
				);
			});
		});
	});

	describe('listSearch getSections and getWidgetAreas', () => {
		describe('getSections', () => {
			it('formats section items as title (slug)', async () => {
				const mockSections = [
					{ slug: 'hero-banner', title: 'Hero Banner' },
					{ slug: 'footer-links', title: 'Footer Links' },
				];

				const context = {
					getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
					helpers: {
						httpRequestWithAuthentication: async () => ({
							success: true,
							data: { items: mockSections },
						}),
					},
				};

				const result = await getSections.call(context as never);
				expect(result.results).toEqual([
					{ name: 'Hero Banner (hero-banner)', value: 'hero-banner' },
					{ name: 'Footer Links (footer-links)', value: 'footer-links' },
				]);
			});

			it('filters sections by search term', async () => {
				const mockSections = [
					{ slug: 'hero-banner', title: 'Hero Banner' },
					{ slug: 'footer-links', title: 'Footer Links' },
				];

				const context = {
					getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
					helpers: {
						httpRequestWithAuthentication: async () => ({
							success: true,
							data: { items: mockSections },
						}),
					},
				};

				const result = await getSections.call(context as never, 'hero');
				expect(result.results).toEqual([
					{ name: 'Hero Banner (hero-banner)', value: 'hero-banner' },
				]);
			});

			it('returns empty results on API error', async () => {
				const context = {
					getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
					helpers: {
						httpRequestWithAuthentication: async () => {
							throw new Error('Network error');
						},
					},
				};

				const result = await getSections.call(context as never);
				expect(result.results).toEqual([]);
			});
		});

		describe('getWidgetAreas', () => {
			it('formats widget area items as label (name)', async () => {
				const mockAreas = [
					{ name: 'sidebar-main', label: 'Main Sidebar' },
					{ name: 'footer-1', label: 'Footer Column 1' },
				];

				const context = {
					getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
					helpers: {
						httpRequestWithAuthentication: async () => ({
							success: true,
							data: { items: mockAreas },
						}),
					},
				};

				const result = await getWidgetAreas.call(context as never);
				expect(result.results).toEqual([
					{ name: 'Main Sidebar (sidebar-main)', value: 'sidebar-main' },
					{ name: 'Footer Column 1 (footer-1)', value: 'footer-1' },
				]);
			});

			it('filters widget areas by search term', async () => {
				const mockAreas = [
					{ name: 'sidebar-main', label: 'Main Sidebar' },
					{ name: 'footer-1', label: 'Footer Column 1' },
				];

				const context = {
					getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
					helpers: {
						httpRequestWithAuthentication: async () => ({
							success: true,
							data: { items: mockAreas },
						}),
					},
				};

				const result = await getWidgetAreas.call(context as never, 'footer');
				expect(result.results).toEqual([{ name: 'Footer Column 1 (footer-1)', value: 'footer-1' }]);
			});

			it('returns empty results on API error', async () => {
				const context = {
					getCredentials: async () => ({ siteUrl: 'https://cms.example.com' }),
					helpers: {
						httpRequestWithAuthentication: async () => {
							throw new Error('Network error');
						},
					},
				};

				const result = await getWidgetAreas.call(context as never);
				expect(result.results).toEqual([]);
			});
		});
	});

	describe('resource and operation counts', () => {
		it('registers 10 resources in resource options sorted alphabetically', () => {
			const resourceProp = node.description.properties.find((p) => p.name === 'resource');
			const options = resourceProp?.options as INodePropertyOptions[];
			expect(options).toHaveLength(10);
			expect(options.map((opt) => opt.value)).toEqual([
				'comment',
				'content',
				'media',
				'menu',
				'redirect',
				'search',
				'section',
				'settings',
				'taxonomy',
				'widgetArea',
			]);
			expect(resourceProp?.default).toBe('content');
		});

		it('preserves existing 68 operations and adds 5 section and 8 widgetArea operations for 81 total', () => {
			const operationProps = node.description.properties.filter((p) => p.name === 'operation');
			const countsByResource: Record<string, number> = {};
			let totalOperations = 0;

			for (const prop of operationProps) {
				const resources = (prop.displayOptions?.show?.resource || []) as string[];
				const count = (prop.options as INodePropertyOptions[]).length;
				for (const res of resources) {
					countsByResource[res] = (countsByResource[res] || 0) + count;
				}
				totalOperations += count;
			}

			expect(countsByResource['content']).toBe(16);
			expect(countsByResource['media']).toBe(11);
			expect(countsByResource['taxonomy']).toBe(10);
			expect(countsByResource['search']).toBe(5);
			expect(countsByResource['redirect']).toBe(9);
			expect(countsByResource['comment']).toBe(6);
			expect(countsByResource['menu']).toBe(9);
			expect(countsByResource['settings']).toBe(2);
			expect(countsByResource['section']).toBe(5);
			expect(countsByResource['widgetArea']).toBe(8);

			expect(
				countsByResource['content'] +
					countsByResource['media'] +
					countsByResource['taxonomy'] +
					countsByResource['search'] +
					countsByResource['redirect'] +
					countsByResource['comment'] +
					countsByResource['menu'] +
					countsByResource['settings'],
			).toBe(68);

			expect(totalOperations).toBe(81);
		});
	});

	describe('listSearch methods', () => {
		it('registers getCollections, getMediaFolders, getMenus, getSections, getTaxonomies, and getWidgetAreas', () => {
			expect(node.methods?.listSearch?.getCollections).toBeDefined();
			expect(node.methods?.listSearch?.getMediaFolders).toBeDefined();
			expect(node.methods?.listSearch?.getMenus).toBeDefined();
			expect(node.methods?.listSearch?.getSections).toBeDefined();
			expect(node.methods?.listSearch?.getTaxonomies).toBeDefined();
			expect(node.methods?.listSearch?.getWidgetAreas).toBeDefined();
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
