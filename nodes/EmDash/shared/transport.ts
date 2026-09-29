import type {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { normalizeBaseUrl } from './utils';

export interface EmDashErrorPayload {
	code: string;
	message: string;
}

export interface EmDashEnvelope<T = unknown> {
	success: boolean;
	data?: T;
	error?: EmDashErrorPayload;
}

export class EmDashApiError extends Error {
	code: string;

	constructor(code: string, message: string) {
		super(message);
		this.name = 'EmDashApiError';
		this.code = code;
	}
}

export function unwrapEnvelope<T = unknown>(response: unknown): T {
	if (typeof response === 'object' && response !== null) {
		const envelope = response as EmDashEnvelope<T>;
		if (envelope.success === false || envelope.error) {
			const code = envelope.error?.code ?? 'UNKNOWN_ERROR';
			const message = envelope.error?.message ?? 'An unknown EmDash API error occurred';
			throw new EmDashApiError(code, message);
		}
		if (envelope.success === true && 'data' in envelope) {
			return envelope.data as T;
		}
	}
	return response as T;
}

export function unwrapContentItem<T = Record<string, unknown>>(response: unknown): T {
	const data = unwrapEnvelope<Record<string, unknown>>(response);
	if (data && typeof data === 'object' && 'item' in data) {
		const item = { ...(data.item as Record<string, unknown>) };
		if (data._rev && item._rev === undefined) {
			item._rev = data._rev;
		}
		return item as T;
	}
	return data as T;
}

export const cursorPaginationOperations = {
	pagination: {
		type: 'generic' as const,
		properties: {
			continue: '={{ !!$response.body?.data?.nextCursor }}',
			request: {
				qs: {
					cursor: '={{ $response.body?.data?.nextCursor }}',
				},
			},
		},
	},
};

export async function emdashApiRequest(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = undefined,
	qs: IDataObject = {},
) {
	const credentials = await this.getCredentials('emdashApi');
	const siteUrl = (credentials.siteUrl as string) ?? '';
	const baseURL = normalizeBaseUrl(siteUrl);
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	const options: IHttpRequestOptions = {
		method,
		url: `${baseURL}${normalizedEndpoint}`,
		qs,
		body,
		json: true,
	};

	const response = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'emdashApi',
		options,
	);
	return unwrapEnvelope(response);
}

export async function prepareMediaUpload(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let binaryPropertyName = 'data';
	try {
		const prop = this.getNodeParameter('binaryPropertyName', 'data');
		if (typeof prop === 'string' && prop.trim() !== '') {
			binaryPropertyName = prop.trim();
		}
	} catch {
		// keep default 'data'
	}

	const itemIndex = typeof this.getItemIndex === 'function' ? this.getItemIndex() : 0;

	let binaryData: { fileName?: string; mimeType?: string };
	let dataBuffer: Buffer;

	try {
		binaryData = this.helpers.assertBinaryData(binaryPropertyName);
	} catch {
		// @ts-expect-error fallback if helper uses multi-item signature (itemIndex, propertyName)
		binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	}

	try {
		dataBuffer = await this.helpers.getBinaryDataBuffer(binaryPropertyName);
	} catch {
		// @ts-expect-error fallback if helper uses multi-item signature (itemIndex, propertyName)
		dataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
	}

	let folderId: string | undefined;
	let deduplicate: boolean | undefined;
	let ensureUniqueFilename: boolean | undefined;

	try {
		const additional = this.getNodeParameter('additionalFields', {}) as IDataObject;
		if (additional && typeof additional === 'object') {
			if (typeof additional.folderId === 'string' && additional.folderId.trim() !== '') {
				folderId = additional.folderId.trim();
			}
			if (typeof additional.deduplicate === 'boolean') {
				deduplicate = additional.deduplicate;
			}
			if (typeof additional.ensureUniqueFilename === 'boolean') {
				ensureUniqueFilename = additional.ensureUniqueFilename;
			}
		}
	} catch {
		// ignore
	}

	if (folderId === undefined) {
		try {
			const val = this.getNodeParameter('folderId', '') as string;
			if (typeof val === 'string' && val.trim() !== '') {
				folderId = val.trim();
			}
		} catch {
			// ignore
		}
	}
	if (deduplicate === undefined) {
		try {
			const val = this.getNodeParameter('deduplicate', undefined) as boolean | undefined;
			if (typeof val === 'boolean') {
				deduplicate = val;
			}
		} catch {
			// ignore
		}
	}
	if (ensureUniqueFilename === undefined) {
		try {
			const val = this.getNodeParameter('ensureUniqueFilename', undefined) as boolean | undefined;
			if (typeof val === 'boolean') {
				ensureUniqueFilename = val;
			}
		} catch {
			// ignore
		}
	}

	const formData = new FormData();
	const mimeType = binaryData?.mimeType || 'application/octet-stream';
	const fileName = binaryData?.fileName || 'file';
	const blob = new Blob([dataBuffer as unknown as Uint8Array<ArrayBuffer>], { type: mimeType });
	formData.append('file', blob, fileName);

	if (folderId) {
		formData.append('folderId', folderId);
	}
	if (deduplicate !== undefined) {
		formData.append('deduplicate', String(deduplicate));
	}
	if (ensureUniqueFilename !== undefined) {
		formData.append('ensureUniqueFilename', String(ensureUniqueFilename));
	}

	requestOptions.body = formData;
	if (requestOptions.headers) {
		delete requestOptions.headers['Content-Type'];
		delete requestOptions.headers['content-type'];
	}

	return requestOptions;
}

export function parseAndValidateCommentIds(value: unknown): string[] {
	if (value === null || value === undefined) {
		throw new Error('At least 1 comment ID is required');
	}

	let rawList: unknown[];
	if (Array.isArray(value)) {
		rawList = value;
	} else if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error('At least 1 comment ID is required');
		}
		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			let parsed: unknown = null;
			let isJsonValid = false;
			try {
				parsed = JSON.parse(trimmed);
				isJsonValid = true;
			} catch {
				isJsonValid = false;
			}
			if (!isJsonValid || !Array.isArray(parsed)) {
				throw new Error('Comment IDs JSON expression must evaluate to an array');
			}
			rawList = parsed;
		} else {
			rawList = trimmed.split(',');
		}
	} else {
		throw new Error('Comment IDs must be an array, comma-separated string, or JSON array string');
	}

	if (rawList.length === 0) {
		throw new Error('At least 1 comment ID is required');
	}

	if (rawList.length > 100) {
		throw new Error(
			`Cannot process more than 100 comment IDs at once (received ${rawList.length})`,
		);
	}

	const ids: string[] = [];
	for (const item of rawList) {
		if (typeof item !== 'string') {
			throw new Error('Comment ID must be a non-empty string');
		}
		const trimmed = item.trim();
		if (!trimmed) {
			throw new Error('Comment ID cannot be empty or whitespace');
		}
		ids.push(trimmed);
	}

	return ids;
}

const ALLOWED_BULK_ACTIONS = ['approve', 'spam', 'trash', 'delete'] as const;

export async function validateBulkCommentAction(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let rawIds: unknown;
	try {
		rawIds = this.getNodeParameter('ids', '');
	} catch {
		rawIds = '';
	}

	let action: unknown;
	try {
		action = this.getNodeParameter('action', '');
	} catch {
		action = '';
	}

	const validatedIds = parseAndValidateCommentIds(rawIds);

	if (!action || typeof action !== 'string' || !action.trim()) {
		throw new Error('Action is required for bulk comment action');
	}

	const trimmedAction = action.trim();
	if (!ALLOWED_BULK_ACTIONS.includes(trimmedAction as (typeof ALLOWED_BULK_ACTIONS)[number])) {
		throw new Error(
			`Invalid bulk comment action: "${trimmedAction}". Must be one of: approve, spam, trash, delete`,
		);
	}

	requestOptions.body = {
		...(typeof requestOptions.body === 'object' && requestOptions.body !== null
			? (requestOptions.body as Record<string, unknown>)
			: {}),
		ids: validatedIds,
		action: trimmedAction,
	};

	return requestOptions;
}

export interface ReorderMenuItem {
	id: string;
	parentId: string | null;
	sortOrder: number;
}

export function parseAndValidateReorderMenuItems(value: unknown): ReorderMenuItem[] {
	if (value === null || value === undefined) {
		throw new Error('Items must be an array or JSON string');
	}

	let rawList: unknown[];
	if (Array.isArray(value)) {
		rawList = value;
	} else if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error('Items must be an array or JSON string');
		}
		let parsed: unknown;
		let jsonError: string | undefined;
		try {
			parsed = JSON.parse(trimmed);
		} catch (err) {
			jsonError = (err as Error).message;
		}
		if (jsonError) {
			throw new Error(`Invalid JSON for items: ${jsonError}`);
		}
		if (!Array.isArray(parsed)) {
			throw new Error('Items JSON expression must evaluate to an array');
		}
		rawList = parsed;
	} else {
		throw new Error('Items must be an array or JSON string');
	}

	if (rawList.length === 0) {
		throw new Error('At least 1 item is required to reorder');
	}

	const validatedItems: ReorderMenuItem[] = [];

	for (let i = 0; i < rawList.length; i++) {
		const rawItem = rawList[i];

		if (typeof rawItem !== 'object' || rawItem === null || Array.isArray(rawItem)) {
			throw new Error(`Item at index ${i} must be an object (received ${typeof rawItem})`);
		}

		const item = rawItem as Record<string, unknown>;

		// Validate id: non-empty string, no empty/whitespace, no coercion
		if (typeof item.id !== 'string') {
			throw new Error(
				`Item at index ${i} has invalid id: must be a non-empty string (received ${typeof item.id})`,
			);
		}
		const trimmedId = item.id.trim();
		if (!trimmedId) {
			throw new Error(`Item at index ${i} has blank id: cannot be empty or whitespace`);
		}

		// Validate parentId: string or null, must not be missing
		if (!('parentId' in item) || item.parentId === undefined) {
			throw new Error(`Item at index ${i} is missing required property "parentId"`);
		}
		if (item.parentId !== null && typeof item.parentId !== 'string') {
			throw new Error(
				`Item at index ${i} has invalid parentId type: must be a string or null (received ${typeof item.parentId})`,
			);
		}
		let parentId: string | null = null;
		if (typeof item.parentId === 'string') {
			const trimmedParent = item.parentId.trim();
			if (!trimmedParent) {
				throw new Error(`Item at index ${i} has blank parentId: use null for root items`);
			}
			parentId = trimmedParent;
		}

		// Validate sortOrder: integer >= 0, no coercion, must not be missing
		if (!('sortOrder' in item) || item.sortOrder === undefined) {
			throw new Error(`Item at index ${i} is missing required property "sortOrder"`);
		}
		if (
			typeof item.sortOrder !== 'number' ||
			!Number.isInteger(item.sortOrder) ||
			item.sortOrder < 0
		) {
			throw new Error(
				`Item at index ${i} has invalid sortOrder: must be an integer >= 0 (received ${item.sortOrder})`,
			);
		}

		validatedItems.push({
			id: trimmedId,
			parentId,
			sortOrder: item.sortOrder,
		});
	}

	return validatedItems;
}

export async function validateReorderMenuItems(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let rawItems: unknown;
	try {
		rawItems = this.getNodeParameter('items', []);
	} catch {
		rawItems = [];
	}

	const validatedItems = parseAndValidateReorderMenuItems(rawItems);

	requestOptions.body = {
		...(typeof requestOptions.body === 'object' && requestOptions.body !== null
			? (requestOptions.body as Record<string, unknown>)
			: {}),
		items: validatedItems,
	};

	return requestOptions;
}

export function parseAndValidateSettings(value: unknown): Record<string, unknown> {
	if (value === null) {
		throw new Error('Settings must be an object (received null)');
	}
	if (value === undefined) {
		throw new Error('Settings must be an object or JSON string (received undefined)');
	}

	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			throw new Error('Settings must be an object (received array)');
		}
		return value as Record<string, unknown>;
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error('Settings JSON string cannot be empty');
		}

		let parsed: unknown;
		let jsonError: string | undefined;
		try {
			parsed = JSON.parse(trimmed);
		} catch (err) {
			jsonError = (err as Error).message;
		}
		if (jsonError) {
			throw new Error(`Invalid JSON for settings: ${jsonError}`);
		}

		if (parsed === null) {
			throw new Error('Settings JSON expression must evaluate to an object (received null)');
		}
		if (Array.isArray(parsed)) {
			throw new Error('Settings JSON expression must evaluate to an object (received array)');
		}
		if (typeof parsed !== 'object') {
			throw new Error(
				`Settings JSON expression must evaluate to an object (received ${typeof parsed})`,
			);
		}

		return parsed as Record<string, unknown>;
	}

	throw new Error(`Settings must be an object or JSON string (received ${typeof value})`);
}

export async function validateUpdateSettings(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let rawSettings: unknown;
	try {
		rawSettings = this.getNodeParameter('settings', {});
	} catch {
		rawSettings = {};
	}

	const validatedSettings = parseAndValidateSettings(rawSettings);

	requestOptions.body = validatedSettings;

	return requestOptions;
}

export {
	validateStructuredContent,
	validateJsonObject,
	validateStringArray,
	validateReorderWidgetIds,
} from './validation';

import {
	validateStructuredContent,
	validateJsonObject,
	validateStringArray,
	validateReorderWidgetIds,
} from './validation';

export async function validateCreateSection(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let slug = '';
	try {
		slug = this.getNodeParameter('slug', '') as string;
	} catch {
		slug = '';
	}

	let title = '';
	try {
		title = this.getNodeParameter('title', '') as string;
	} catch {
		title = '';
	}

	let rawContent: unknown;
	try {
		rawContent = this.getNodeParameter('content', []);
	} catch {
		rawContent = [];
	}

	let additionalFields: Record<string, unknown> = {};
	try {
		additionalFields =
			(this.getNodeParameter('additionalFields', {}) as Record<string, unknown>) || {};
	} catch {
		additionalFields = {};
	}

	const trimmedSlug = String(slug).trim();
	if (!trimmedSlug) {
		throw new Error('slug is required');
	}
	if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
		throw new Error('slug must only contain lowercase letters, numbers, and hyphens');
	}

	const trimmedTitle = String(title).trim();
	if (!trimmedTitle) {
		throw new Error('title is required');
	}

	const validatedContent = validateStructuredContent(rawContent, 'Content');

	const body: Record<string, unknown> = {
		slug: trimmedSlug,
		title: trimmedTitle,
		content: validatedContent,
	};

	if (typeof additionalFields.description === 'string' && additionalFields.description.trim()) {
		body.description = additionalFields.description.trim();
	}
	if (additionalFields.keywords !== undefined && additionalFields.keywords !== '') {
		const keywords = validateStringArray(additionalFields.keywords, 'Keywords');
		if (keywords.length > 0) {
			body.keywords = keywords;
		}
	}
	if (
		typeof additionalFields.previewMediaId === 'string' &&
		additionalFields.previewMediaId.trim()
	) {
		body.previewMediaId = additionalFields.previewMediaId.trim();
	}
	if (typeof additionalFields.source === 'string' && additionalFields.source.trim()) {
		const source = additionalFields.source.trim();
		if (source !== 'user' && source !== 'import') {
			throw new Error(
				'Section source must be "user" or "import" (theme sections cannot be created)',
			);
		}
		body.source = source;
	}
	if (typeof additionalFields.themeId === 'string' && additionalFields.themeId.trim()) {
		body.themeId = additionalFields.themeId.trim();
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateUpdateSection(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let updateFields: Record<string, unknown> = {};
	try {
		updateFields = (this.getNodeParameter('updateFields', {}) as Record<string, unknown>) || {};
	} catch {
		updateFields = {};
	}

	const body: Record<string, unknown> = {};

	if ('slug' in updateFields && updateFields.slug !== undefined) {
		const slug = String(updateFields.slug).trim();
		if (!slug) {
			throw new Error('slug cannot be empty or whitespace');
		}
		if (!/^[a-z0-9-]+$/.test(slug)) {
			throw new Error('slug must only contain lowercase letters, numbers, and hyphens');
		}
		body.slug = slug;
	}
	if ('title' in updateFields && updateFields.title !== undefined) {
		const title = String(updateFields.title).trim();
		if (!title) {
			throw new Error('title cannot be empty or whitespace');
		}
		body.title = title;
	}
	if ('description' in updateFields && updateFields.description !== undefined) {
		body.description = String(updateFields.description);
	}
	if ('keywords' in updateFields && updateFields.keywords !== undefined) {
		body.keywords = validateStringArray(updateFields.keywords, 'Keywords');
	}
	if ('content' in updateFields && updateFields.content !== undefined) {
		body.content = validateStructuredContent(updateFields.content, 'Content');
	}
	if ('previewMediaId' in updateFields && updateFields.previewMediaId !== undefined) {
		const val = updateFields.previewMediaId;
		if (val === null) {
			body.previewMediaId = null;
		} else if (typeof val === 'string') {
			const trimmed = val.trim();
			if (trimmed === '' || trimmed === 'null') {
				body.previewMediaId = null;
			} else {
				body.previewMediaId = trimmed;
			}
		} else {
			throw new Error(
				`Preview Media ID must be a string, null, or empty string (received ${typeof val})`,
			);
		}
	}

	if (Object.keys(body).length === 0) {
		throw new Error('At least one field must be provided to update section');
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateCreateWidgetArea(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let name = '';
	try {
		name = this.getNodeParameter('name', '') as string;
	} catch {
		name = '';
	}

	let label = '';
	try {
		label = this.getNodeParameter('label', '') as string;
	} catch {
		label = '';
	}

	let additionalFields: Record<string, unknown> = {};
	try {
		additionalFields =
			(this.getNodeParameter('additionalFields', {}) as Record<string, unknown>) || {};
	} catch {
		additionalFields = {};
	}

	const trimmedName = String(name).trim();
	if (!trimmedName) {
		throw new Error('name is required');
	}

	const trimmedLabel = String(label).trim();
	if (!trimmedLabel) {
		throw new Error('label is required');
	}

	const body: Record<string, unknown> = {
		name: trimmedName,
		label: trimmedLabel,
	};

	if (typeof additionalFields.description === 'string' && additionalFields.description.trim()) {
		body.description = additionalFields.description.trim();
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateCreateWidget(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let type = 'content';
	try {
		type = this.getNodeParameter('type', 'content') as string;
	} catch {
		type = 'content';
	}

	let title = '';
	try {
		title = this.getNodeParameter('title', '') as string;
	} catch {
		title = '';
	}

	if (!['content', 'menu', 'component'].includes(type)) {
		throw new Error('Widget type must be "content", "menu", or "component"');
	}

	const body: Record<string, unknown> = {
		type,
	};

	if (typeof title === 'string' && title.trim()) {
		body.title = title.trim();
	}

	if (type === 'content') {
		let content: unknown;
		try {
			content = this.getNodeParameter('content', []);
		} catch {
			content = [];
		}
		body.content = validateStructuredContent(content, 'Content');
	} else if (type === 'menu') {
		let rawMenu: unknown;
		try {
			rawMenu = this.getNodeParameter('menuName', '');
		} catch {
			rawMenu = '';
		}
		const menuName =
			typeof rawMenu === 'object' && rawMenu !== null
				? String((rawMenu as { value?: unknown }).value || '').trim()
				: String(rawMenu || '').trim();
		if (!menuName) {
			throw new Error('menuName is required for menu widgets');
		}
		body.menuName = menuName;
	} else if (type === 'component') {
		let componentId = '';
		try {
			componentId = this.getNodeParameter('componentId', '') as string;
		} catch {
			componentId = '';
		}
		const trimmedId = String(componentId).trim();
		if (!trimmedId) {
			throw new Error('componentId is required for component widgets');
		}
		body.componentId = trimmedId;

		let componentProps: unknown;
		try {
			componentProps = this.getNodeParameter('componentProps', '{}');
		} catch {
			componentProps = '{}';
		}
		if (
			componentProps !== undefined &&
			componentProps !== null &&
			componentProps !== '' &&
			componentProps !== '{}'
		) {
			body.componentProps = validateJsonObject(componentProps, 'Component Props');
		}
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateUpdateWidget(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let updateFields: Record<string, unknown> = {};
	try {
		updateFields = (this.getNodeParameter('updateFields', {}) as Record<string, unknown>) || {};
	} catch {
		updateFields = {};
	}

	const body: Record<string, unknown> = {};

	if ('type' in updateFields && updateFields.type !== undefined) {
		const type = String(updateFields.type).trim();
		if (!['content', 'menu', 'component'].includes(type)) {
			throw new Error('Widget type must be "content", "menu", or "component"');
		}
		body.type = type;
	}
	if ('title' in updateFields && updateFields.title !== undefined) {
		body.title =
			typeof updateFields.title === 'string'
				? updateFields.title.trim()
				: String(updateFields.title ?? '').trim();
	}
	if ('content' in updateFields && updateFields.content !== undefined) {
		body.content = validateStructuredContent(updateFields.content, 'Content');
	}
	if ('menuName' in updateFields && updateFields.menuName !== undefined) {
		const raw = updateFields.menuName;
		const name =
			typeof raw === 'object' && raw !== null
				? String((raw as { value?: unknown }).value ?? '').trim()
				: typeof raw === 'string'
					? raw.trim()
					: String(raw ?? '').trim();
		body.menuName = name;
	}
	if ('componentId' in updateFields && updateFields.componentId !== undefined) {
		body.componentId =
			typeof updateFields.componentId === 'string'
				? updateFields.componentId.trim()
				: String(updateFields.componentId ?? '').trim();
	}
	if ('componentProps' in updateFields && updateFields.componentProps !== undefined) {
		body.componentProps = validateJsonObject(updateFields.componentProps, 'Component Props');
	}

	if (Object.keys(body).length === 0) {
		throw new Error('At least one field must be provided to update widget');
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateReorderWidgets(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let rawWidgetIds: unknown;
	try {
		rawWidgetIds = this.getNodeParameter('widgetIds', []);
	} catch {
		rawWidgetIds = [];
	}

	const validatedIds = validateReorderWidgetIds(rawWidgetIds);

	requestOptions.body = {
		widgetIds: validatedIds,
	};

	return requestOptions;
}
