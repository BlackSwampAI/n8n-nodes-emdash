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
	let fieldId: string | undefined;
	let width: number | undefined;
	let height: number | undefined;
	let thumbnailBinaryPropertyName: string | undefined;

	let additional: IDataObject = {};
	try {
		additional = (this.getNodeParameter('additionalFields', {}) as IDataObject) || {};
	} catch {
		additional = {};
	}
	if (
		additional &&
		typeof additional.additionalFields === 'object' &&
		additional.additionalFields !== null
	) {
		additional = additional.additionalFields as IDataObject;
	}

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
		if (typeof additional.fieldId === 'string' && additional.fieldId.trim() !== '') {
			fieldId = additional.fieldId.trim();
		}
		if (
			additional.width !== undefined &&
			additional.width !== null &&
			(additional.width as unknown) !== ''
		) {
			const w = additional.width;
			if (typeof w !== 'number' || !Number.isInteger(w) || w <= 0) {
				throw new Error('Width must be an integer greater than 0');
			}
			width = w;
		}
		if (
			additional.height !== undefined &&
			additional.height !== null &&
			(additional.height as unknown) !== ''
		) {
			const h = additional.height;
			if (typeof h !== 'number' || !Number.isInteger(h) || h <= 0) {
				throw new Error('Height must be an integer greater than 0');
			}
			height = h;
		}
		if (
			typeof additional.thumbnailBinaryPropertyName === 'string' &&
			additional.thumbnailBinaryPropertyName.trim() !== ''
		) {
			thumbnailBinaryPropertyName = additional.thumbnailBinaryPropertyName.trim();
		}
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
	if (fieldId === undefined) {
		try {
			const val = this.getNodeParameter('fieldId', '') as string;
			if (typeof val === 'string' && val.trim() !== '') {
				fieldId = val.trim();
			}
		} catch {
			// ignore
		}
	}
	if (width === undefined) {
		let val: unknown;
		try {
			val = this.getNodeParameter('width', undefined);
		} catch {
			val = undefined;
		}
		if (val !== undefined && val !== null && (val as unknown) !== '') {
			if (typeof val !== 'number' || !Number.isInteger(val) || val <= 0) {
				throw new Error('Width must be an integer greater than 0');
			}
			width = val as number;
		}
	}
	if (height === undefined) {
		let val: unknown;
		try {
			val = this.getNodeParameter('height', undefined);
		} catch {
			val = undefined;
		}
		if (val !== undefined && val !== null && (val as unknown) !== '') {
			if (typeof val !== 'number' || !Number.isInteger(val) || val <= 0) {
				throw new Error('Height must be an integer greater than 0');
			}
			height = val as number;
		}
	}
	if (thumbnailBinaryPropertyName === undefined) {
		try {
			const val = this.getNodeParameter('thumbnailBinaryPropertyName', '') as string;
			if (typeof val === 'string' && val.trim() !== '') {
				thumbnailBinaryPropertyName = val.trim();
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

	if (thumbnailBinaryPropertyName) {
		let thumbBinaryData: { fileName?: string; mimeType?: string };
		let thumbBuffer: Buffer;
		try {
			thumbBinaryData = this.helpers.assertBinaryData(thumbnailBinaryPropertyName);
		} catch {
			// @ts-expect-error fallback if helper uses multi-item signature (itemIndex, propertyName)
			thumbBinaryData = this.helpers.assertBinaryData(itemIndex, thumbnailBinaryPropertyName);
		}

		try {
			thumbBuffer = await this.helpers.getBinaryDataBuffer(thumbnailBinaryPropertyName);
		} catch {
			// @ts-expect-error fallback if helper uses multi-item signature (itemIndex, propertyName)
			thumbBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, thumbnailBinaryPropertyName);
		}

		const thumbMimeType = thumbBinaryData?.mimeType || 'application/octet-stream';
		const thumbFileName = thumbBinaryData?.fileName || 'thumbnail';
		const thumbBlob = new Blob([thumbBuffer as unknown as Uint8Array<ArrayBuffer>], {
			type: thumbMimeType,
		});
		formData.append('thumbnail', thumbBlob, thumbFileName);
	}

	if (folderId) {
		formData.append('folderId', folderId);
	}
	if (deduplicate !== undefined) {
		formData.append('deduplicate', String(deduplicate));
	}
	if (ensureUniqueFilename !== undefined) {
		formData.append('ensureUniqueFilename', String(ensureUniqueFilename));
	}
	if (fieldId) {
		formData.append('fieldId', fieldId);
	}
	if (width !== undefined) {
		formData.append('width', String(width));
	}
	if (height !== undefined) {
		formData.append('height', String(height));
	}

	requestOptions.body = formData;
	if (requestOptions.headers) {
		delete requestOptions.headers['Content-Type'];
		delete requestOptions.headers['content-type'];
	}

	return requestOptions;
}

export async function prepareMediaReplacement(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let width: unknown;
	try {
		width = this.getNodeParameter('width');
	} catch {
		width = undefined;
	}
	if (typeof width !== 'number' || !Number.isInteger(width) || width <= 0) {
		throw new Error('Width must be an integer greater than 0');
	}

	let height: unknown;
	try {
		height = this.getNodeParameter('height');
	} catch {
		height = undefined;
	}
	if (typeof height !== 'number' || !Number.isInteger(height) || height <= 0) {
		throw new Error('Height must be an integer greater than 0');
	}

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

	const formData = new FormData();
	const mimeType = binaryData?.mimeType || 'application/octet-stream';
	const fileName = binaryData?.fileName || 'file';
	const blob = new Blob([dataBuffer as unknown as Uint8Array<ArrayBuffer>], { type: mimeType });
	formData.append('file', blob, fileName);
	formData.append('width', String(width));
	formData.append('height', String(height));

	requestOptions.body = formData;
	if (requestOptions.headers) {
		delete requestOptions.headers['Content-Type'];
		delete requestOptions.headers['content-type'];
	}

	return requestOptions;
}

export async function prepareGetUploadTarget(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let filename: string;
	try {
		filename = this.getNodeParameter('filename', '') as string;
	} catch {
		filename = '';
	}
	const trimmedFilename = String(filename ?? '').trim();
	if (!trimmedFilename) {
		throw new Error('Filename is required');
	}

	let contentType: string;
	try {
		contentType = this.getNodeParameter('contentType', '') as string;
	} catch {
		contentType = '';
	}
	const trimmedContentType = String(contentType ?? '').trim();
	if (!trimmedContentType) {
		throw new Error('Content Type is required');
	}

	let size: unknown;
	try {
		size = this.getNodeParameter('size');
	} catch {
		size = undefined;
	}
	if (typeof size !== 'number' || !Number.isInteger(size) || size < 0) {
		throw new Error('Size must be an integer greater than or equal to 0');
	}

	const body: Record<string, unknown> = {
		filename: trimmedFilename,
		contentType: trimmedContentType,
		size,
	};

	let additionalFields: Record<string, unknown> = {};
	try {
		additionalFields =
			(this.getNodeParameter('additionalFields', {}) as Record<string, unknown>) || {};
	} catch {
		additionalFields = {};
	}

	if (typeof additionalFields.contentHash === 'string' && additionalFields.contentHash.trim()) {
		body.contentHash = additionalFields.contentHash.trim();
	}
	if (typeof additionalFields.fieldId === 'string' && additionalFields.fieldId.trim()) {
		body.fieldId = additionalFields.fieldId.trim();
	}
	if (typeof additionalFields.deduplicate === 'boolean') {
		body.deduplicate = additionalFields.deduplicate;
	}
	if (typeof additionalFields.ensureUniqueFilename === 'boolean') {
		body.ensureUniqueFilename = additionalFields.ensureUniqueFilename;
	}
	if ('folderId' in additionalFields && additionalFields.folderId !== undefined) {
		const rawFolderId = additionalFields.folderId;
		if (rawFolderId === null) {
			body.folderId = null;
		} else if (typeof rawFolderId === 'string') {
			const trimmed = rawFolderId.trim();
			if (trimmed === '' || trimmed === 'unfiled' || trimmed === 'null') {
				body.folderId = null;
			} else {
				body.folderId = trimmed;
			}
		}
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function preparePendingMediaUpload(
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

	requestOptions.body = dataBuffer;
	if (!requestOptions.headers) {
		requestOptions.headers = {};
	}
	const mimeType = binaryData?.mimeType || 'application/octet-stream';
	requestOptions.headers['Content-Type'] = mimeType;
	requestOptions.headers['Content-Length'] = String(dataBuffer.length);

	return requestOptions;
}

export async function prepareConfirmUpload(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let additionalFields: Record<string, unknown> = {};
	try {
		additionalFields =
			(this.getNodeParameter('additionalFields', {}) as Record<string, unknown>) || {};
	} catch {
		additionalFields = {};
	}
	if (
		additionalFields &&
		typeof additionalFields.additionalFields === 'object' &&
		additionalFields.additionalFields !== null
	) {
		additionalFields = additionalFields.additionalFields as Record<string, unknown>;
	}

	const body: Record<string, unknown> = {};

	if (
		'size' in additionalFields &&
		additionalFields.size !== undefined &&
		additionalFields.size !== null &&
		(additionalFields.size as unknown) !== ''
	) {
		const size = additionalFields.size;
		if (typeof size !== 'number' || !Number.isInteger(size) || size < 0) {
			throw new Error('Size must be an integer greater than or equal to 0');
		}
		body.size = size;
	}

	if (
		'width' in additionalFields &&
		additionalFields.width !== undefined &&
		additionalFields.width !== null &&
		(additionalFields.width as unknown) !== ''
	) {
		const width = additionalFields.width;
		if (typeof width !== 'number' || !Number.isInteger(width) || width <= 0) {
			throw new Error('Width must be an integer greater than 0');
		}
		body.width = width;
	}

	if (
		'height' in additionalFields &&
		additionalFields.height !== undefined &&
		additionalFields.height !== null &&
		(additionalFields.height as unknown) !== ''
	) {
		const height = additionalFields.height;
		if (typeof height !== 'number' || !Number.isInteger(height) || height <= 0) {
			throw new Error('Height must be an integer greater than 0');
		}
		body.height = height;
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateMediaUpdate(
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

	if ('alt' in updateFields && updateFields.alt !== undefined) {
		body.alt = String(updateFields.alt);
	}

	if ('caption' in updateFields && updateFields.caption !== undefined) {
		body.caption = String(updateFields.caption);
	}

	if (
		'width' in updateFields &&
		updateFields.width !== undefined &&
		updateFields.width !== null &&
		(updateFields.width as unknown) !== ''
	) {
		const width = updateFields.width;
		if (typeof width !== 'number' || !Number.isInteger(width) || width <= 0) {
			throw new Error('Width must be an integer greater than 0');
		}
		body.width = width;
	}

	if (
		'height' in updateFields &&
		updateFields.height !== undefined &&
		updateFields.height !== null &&
		(updateFields.height as unknown) !== ''
	) {
		const height = updateFields.height;
		if (typeof height !== 'number' || !Number.isInteger(height) || height <= 0) {
			throw new Error('Height must be an integer greater than 0');
		}
		body.height = height;
	}

	const hasClearFocalPoint = updateFields.clearFocalPoint === true;
	const hasFocalX =
		'focalX' in updateFields &&
		updateFields.focalX !== undefined &&
		(updateFields.focalX as unknown) !== '';
	const hasFocalY =
		'focalY' in updateFields &&
		updateFields.focalY !== undefined &&
		(updateFields.focalY as unknown) !== '';

	if (hasClearFocalPoint) {
		body.focalX = null;
		body.focalY = null;
	} else if (hasFocalX || hasFocalY) {
		if (!hasFocalX || !hasFocalY) {
			throw new Error(
				'Both focalX and focalY must be provided together (numbers between 0 and 1, or both null to clear)',
			);
		}
		const focalX = updateFields.focalX;
		const focalY = updateFields.focalY;

		if (focalX === null && focalY === null) {
			body.focalX = null;
			body.focalY = null;
		} else if (
			typeof focalX === 'number' &&
			typeof focalY === 'number' &&
			!Number.isNaN(focalX) &&
			!Number.isNaN(focalY) &&
			focalX >= 0 &&
			focalX <= 1 &&
			focalY >= 0 &&
			focalY <= 1
		) {
			body.focalX = focalX;
			body.focalY = focalY;
		} else {
			throw new Error(
				'Both focalX and focalY must be provided together (numbers between 0 and 1, or both null to clear)',
			);
		}
	}

	if ('folderId' in updateFields && updateFields.folderId !== undefined) {
		const rawFolderId = updateFields.folderId;
		if (rawFolderId === null) {
			body.folderId = null;
		} else if (typeof rawFolderId === 'string') {
			const trimmed = rawFolderId.trim();
			if (trimmed === '' || trimmed === 'unfiled' || trimmed === 'null') {
				body.folderId = null;
			} else {
				body.folderId = trimmed;
			}
		} else {
			throw new Error('Folder ID must be a string or null');
		}
	}

	if (Object.keys(body).length === 0) {
		throw new Error('At least one media property must be provided for update');
	}

	requestOptions.body = body;
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

export const SCHEMA_FIELD_TYPES = [
	'string',
	'text',
	'url',
	'number',
	'integer',
	'boolean',
	'datetime',
	'select',
	'multiSelect',
	'portableText',
	'image',
	'file',
	'reference',
	'json',
	'slug',
	'repeater',
	'blocks',
] as const;

export function parseJsonParameter<T = unknown>(
	value: unknown,
	label = 'Parameter',
	allowRawString = false,
): T {
	if (value === null || value === undefined) {
		return value as T;
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed === '') {
			return undefined as unknown as T;
		}
		let parsed: unknown;
		let jsonError: string | undefined;
		try {
			parsed = JSON.parse(trimmed);
		} catch (err) {
			jsonError = (err as Error).message;
		}
		if (jsonError) {
			if (allowRawString && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
				return trimmed as unknown as T;
			}
			throw new Error(`Invalid JSON for ${label}: ${jsonError}`);
		}
		return parsed as T;
	}
	return value as T;
}

export function parseAndValidateCollectionSlugs(value: unknown): string[] {
	if (value === null || value === undefined) {
		throw new Error('At least 1 collection slug is required to reorder');
	}

	let rawList: unknown[];
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error('At least 1 collection slug is required to reorder');
		}

		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			let parsed: unknown;
			let jsonError: string | undefined;
			try {
				parsed = JSON.parse(trimmed);
			} catch (err) {
				jsonError = (err as Error).message;
			}
			if (jsonError) {
				throw new Error(`Invalid JSON for slugs: ${jsonError}`);
			}
			if (!Array.isArray(parsed)) {
				throw new Error('slugs JSON expression must evaluate to an array');
			}
			rawList = parsed;
		} else {
			rawList = trimmed.split(',');
		}
	} else if (Array.isArray(value)) {
		rawList = value;
	} else {
		throw new Error(`slugs must be an array or comma-separated string (received ${typeof value})`);
	}

	if (rawList.length === 0) {
		throw new Error('At least 1 collection slug is required to reorder');
	}

	const seen = new Set<string>();
	const result: string[] = [];

	for (let i = 0; i < rawList.length; i++) {
		const item = rawList[i];
		if (typeof item !== 'string') {
			throw new Error(
				`Collection slug at index ${i} must be a non-empty string (received ${typeof item})`,
			);
		}
		const trimmed = item.trim();
		if (!trimmed) {
			throw new Error(`Collection slug at index ${i} cannot be empty or whitespace`);
		}
		if (seen.has(trimmed)) {
			throw new Error(`Duplicate collection slug found in reorder list: "${trimmed}"`);
		}
		seen.add(trimmed);
		result.push(trimmed);
	}

	return result;
}

export function parseAndValidateFieldSlugs(value: unknown): string[] {
	if (value === null || value === undefined) {
		throw new Error('At least 1 field slug is required to reorder');
	}

	let rawList: unknown[];
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error('At least 1 field slug is required to reorder');
		}

		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			let parsed: unknown;
			let jsonError: string | undefined;
			try {
				parsed = JSON.parse(trimmed);
			} catch (err) {
				jsonError = (err as Error).message;
			}
			if (jsonError) {
				throw new Error(`Invalid JSON for fieldSlugs: ${jsonError}`);
			}
			if (!Array.isArray(parsed)) {
				throw new Error('fieldSlugs JSON expression must evaluate to an array');
			}
			rawList = parsed;
		} else {
			rawList = trimmed.split(',');
		}
	} else if (Array.isArray(value)) {
		rawList = value;
	} else {
		throw new Error(
			`fieldSlugs must be an array or comma-separated string (received ${typeof value})`,
		);
	}

	if (rawList.length === 0) {
		throw new Error('At least 1 field slug is required to reorder');
	}

	const seen = new Set<string>();
	const result: string[] = [];

	for (let i = 0; i < rawList.length; i++) {
		const item = rawList[i];
		if (typeof item !== 'string') {
			throw new Error(
				`Field slug at index ${i} must be a non-empty string (received ${typeof item})`,
			);
		}
		const trimmed = item.trim();
		if (!trimmed) {
			throw new Error(`Field slug at index ${i} cannot be empty or whitespace`);
		}
		if (seen.has(trimmed)) {
			throw new Error(`Duplicate field slug found in reorder list: "${trimmed}"`);
		}
		seen.add(trimmed);
		result.push(trimmed);
	}

	return result;
}

export async function validateCreateCollection(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let slug = '';
	try {
		slug = this.getNodeParameter('slug', '') as string;
	} catch {
		slug = '';
	}
	const trimmedSlug = String(slug ?? '').trim();
	if (!trimmedSlug) {
		throw new Error('slug is required');
	}
	if (!/^[a-z][a-z0-9_]*$/.test(trimmedSlug) || trimmedSlug.length > 63) {
		throw new Error(
			'slug must start with a letter and contain only lowercase letters, numbers, and underscores (1–63 characters)',
		);
	}

	let label = '';
	try {
		label = this.getNodeParameter('label', '') as string;
	} catch {
		label = '';
	}
	const trimmedLabel = String(label ?? '').trim();
	if (!trimmedLabel) {
		throw new Error('label is required');
	}

	let additionalFields: Record<string, unknown> = {};
	try {
		additionalFields =
			(this.getNodeParameter('additionalFields', {}) as Record<string, unknown>) || {};
	} catch {
		additionalFields = {};
	}

	const getParam = (name: string): unknown => {
		if (additionalFields[name] !== undefined) return additionalFields[name];
		try {
			return this.getNodeParameter(name);
		} catch {
			return undefined;
		}
	};

	const body: Record<string, unknown> = {
		slug: trimmedSlug,
		label: trimmedLabel,
	};

	const labelSingular = getParam('labelSingular');
	if (typeof labelSingular === 'string' && labelSingular.trim()) {
		body.labelSingular = labelSingular.trim();
	}

	const description = getParam('description');
	if (typeof description === 'string' && description.trim()) {
		body.description = description.trim();
	}

	const icon = getParam('icon');
	if (typeof icon === 'string' && icon.trim()) {
		body.icon = icon.trim();
	}

	const supports = getParam('supports');
	if (supports !== undefined && supports !== null && supports !== '') {
		const supportsArray = validateStringArray(supports, 'Supports');
		if (supportsArray.length > 0) {
			body.supports = supportsArray;
		}
	}

	const admin = getParam('admin');
	if (admin !== undefined && admin !== null && admin !== '' && admin !== '{}') {
		const parsedAdmin = parseJsonParameter(admin, 'Admin');
		if (parsedAdmin !== undefined && parsedAdmin !== null) {
			if (typeof parsedAdmin !== 'object' || Array.isArray(parsedAdmin)) {
				throw new Error('Admin must be a JSON object');
			}
			body.admin = parsedAdmin;
		}
	}

	const source = getParam('source');
	if (typeof source === 'string' && source.trim()) {
		body.source = source.trim();
	}

	const urlPattern = getParam('urlPattern');
	if (typeof urlPattern === 'string' && urlPattern.trim()) {
		body.urlPattern = urlPattern.trim();
	}

	const routable = getParam('routable');
	if (typeof routable === 'boolean') {
		body.routable = routable;
	}

	const hasSeo = getParam('hasSeo');
	if (typeof hasSeo === 'boolean') {
		body.hasSeo = hasSeo;
	}

	const hidden = getParam('hidden');
	if (typeof hidden === 'boolean') {
		body.hidden = hidden;
	}

	const sortOrder = getParam('sortOrder');
	if (sortOrder !== undefined && sortOrder !== null && (sortOrder as unknown) !== '') {
		if (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder)) {
			throw new Error('sortOrder must be an integer');
		}
		body.sortOrder = sortOrder;
	}

	const editLocking = getParam('editLocking');
	if (typeof editLocking === 'boolean') {
		body.editLocking = editLocking;
	}

	const group = getParam('group');
	if (group !== undefined && group !== null) {
		if (typeof group === 'string') {
			const trimmed = group.trim();
			body.group = trimmed === '' ? null : trimmed;
		} else {
			body.group = group;
		}
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateUpdateCollection(
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

	if ('label' in updateFields && updateFields.label !== undefined) {
		const label = String(updateFields.label).trim();
		if (!label) {
			throw new Error('label cannot be empty or whitespace');
		}
		body.label = label;
	}
	if ('labelSingular' in updateFields && updateFields.labelSingular !== undefined) {
		body.labelSingular = String(updateFields.labelSingular).trim();
	}
	if ('description' in updateFields && updateFields.description !== undefined) {
		body.description = String(updateFields.description);
	}
	if ('icon' in updateFields && updateFields.icon !== undefined) {
		body.icon = String(updateFields.icon).trim();
	}
	if (
		'supports' in updateFields &&
		updateFields.supports !== undefined &&
		updateFields.supports !== null
	) {
		body.supports = validateStringArray(updateFields.supports, 'Supports');
	}
	if (
		'admin' in updateFields &&
		updateFields.admin !== undefined &&
		updateFields.admin !== null &&
		updateFields.admin !== ''
	) {
		const parsedAdmin = parseJsonParameter(updateFields.admin, 'Admin');
		if (parsedAdmin !== undefined && parsedAdmin !== null) {
			if (typeof parsedAdmin !== 'object' || Array.isArray(parsedAdmin)) {
				throw new Error('Admin must be a JSON object');
			}
			body.admin = parsedAdmin;
		}
	}
	if ('urlPattern' in updateFields && updateFields.urlPattern !== undefined) {
		const val = updateFields.urlPattern;
		if (val === null) {
			body.urlPattern = null;
		} else if (typeof val === 'string') {
			const trimmed = val.trim();
			body.urlPattern = trimmed === '' || trimmed === 'null' ? null : trimmed;
		} else {
			body.urlPattern = val;
		}
	}
	if ('routable' in updateFields && typeof updateFields.routable === 'boolean') {
		body.routable = updateFields.routable;
	}
	if ('hasSeo' in updateFields && typeof updateFields.hasSeo === 'boolean') {
		body.hasSeo = updateFields.hasSeo;
	}
	if ('hidden' in updateFields && typeof updateFields.hidden === 'boolean') {
		body.hidden = updateFields.hidden;
	}
	const hasSortOrder = 'sortOrder' in updateFields && updateFields.sortOrder !== undefined;
	const clearSortOrder = updateFields.clearSortOrder === true;

	if (
		clearSortOrder &&
		hasSortOrder &&
		updateFields.sortOrder !== null &&
		(updateFields.sortOrder as unknown) !== '' &&
		(updateFields.sortOrder as unknown) !== 'null'
	) {
		throw new Error('Cannot specify both sortOrder and clearSortOrder');
	}

	if (clearSortOrder) {
		body.sortOrder = null;
	} else if (hasSortOrder) {
		const val = updateFields.sortOrder;
		if (val === null || (val as unknown) === 'null') {
			body.sortOrder = null;
		} else if ((val as unknown) !== '') {
			if (typeof val !== 'number' || !Number.isInteger(val)) {
				throw new Error('sortOrder must be an integer');
			}
			body.sortOrder = val;
		}
	}

	if ('group' in updateFields && updateFields.group !== undefined) {
		const val = updateFields.group;
		if (val === null) {
			body.group = null;
		} else if (typeof val === 'string') {
			const trimmed = val.trim();
			body.group = trimmed === '' || trimmed === 'null' ? null : trimmed;
		} else {
			body.group = val;
		}
	}
	if ('commentsEnabled' in updateFields && typeof updateFields.commentsEnabled === 'boolean') {
		body.commentsEnabled = updateFields.commentsEnabled;
	}
	if (
		'commentsModeration' in updateFields &&
		updateFields.commentsModeration !== undefined &&
		updateFields.commentsModeration !== ''
	) {
		const mod = String(updateFields.commentsModeration).trim();
		if (!['all', 'first_time', 'none'].includes(mod)) {
			throw new Error('commentsModeration must be "all", "first_time", or "none"');
		}
		body.commentsModeration = mod;
	}
	if (
		'commentsClosedAfterDays' in updateFields &&
		updateFields.commentsClosedAfterDays !== undefined &&
		updateFields.commentsClosedAfterDays !== null &&
		(updateFields.commentsClosedAfterDays as unknown) !== ''
	) {
		const days = updateFields.commentsClosedAfterDays;
		if (typeof days !== 'number' || !Number.isInteger(days) || days < 0) {
			throw new Error('commentsClosedAfterDays must be an integer greater than or equal to 0');
		}
		body.commentsClosedAfterDays = days;
	}
	if (
		'commentsAutoApproveUsers' in updateFields &&
		typeof updateFields.commentsAutoApproveUsers === 'boolean'
	) {
		body.commentsAutoApproveUsers = updateFields.commentsAutoApproveUsers;
	}
	if ('editLocking' in updateFields && typeof updateFields.editLocking === 'boolean') {
		body.editLocking = updateFields.editLocking;
	}
	if ('titleField' in updateFields && updateFields.titleField !== undefined) {
		const val = updateFields.titleField;
		if (val === null) {
			body.titleField = null;
		} else if (typeof val === 'string') {
			const trimmed = val.trim();
			body.titleField = trimmed === '' || trimmed === 'null' ? null : trimmed;
		} else {
			body.titleField = val;
		}
	}
	if ('dateField' in updateFields && updateFields.dateField !== undefined) {
		const val = updateFields.dateField;
		if (val === null) {
			body.dateField = null;
		} else if (typeof val === 'string') {
			const trimmed = val.trim();
			body.dateField = trimmed === '' || trimmed === 'null' ? null : trimmed;
		} else {
			body.dateField = val;
		}
	}

	if (Object.keys(body).length === 0) {
		throw new Error('At least one field must be provided to update collection');
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateReorderCollections(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let rawSlugs: unknown;
	try {
		rawSlugs = this.getNodeParameter('slugs', []);
	} catch {
		rawSlugs = [];
	}

	const validatedSlugs = parseAndValidateCollectionSlugs(rawSlugs);

	requestOptions.body = {
		slugs: validatedSlugs,
	};

	return requestOptions;
}

export async function validateCreateField(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let slug = '';
	try {
		slug = this.getNodeParameter('slug', '') as string;
	} catch {
		slug = '';
	}
	const trimmedSlug = String(slug ?? '').trim();
	if (!trimmedSlug) {
		throw new Error('slug is required');
	}
	if (!/^[a-z][a-z0-9_]*$/.test(trimmedSlug) || trimmedSlug.length > 63) {
		throw new Error(
			'slug must start with a letter and contain only lowercase letters, numbers, and underscores (1–63 characters)',
		);
	}

	let label = '';
	try {
		label = this.getNodeParameter('label', '') as string;
	} catch {
		label = '';
	}
	const trimmedLabel = String(label ?? '').trim();
	if (!trimmedLabel) {
		throw new Error('label is required');
	}

	let type = '';
	try {
		type = this.getNodeParameter('type', '') as string;
	} catch {
		type = '';
	}
	const trimmedType = String(type ?? '').trim();
	if (!trimmedType) {
		throw new Error('type is required');
	}
	if (!SCHEMA_FIELD_TYPES.includes(trimmedType as (typeof SCHEMA_FIELD_TYPES)[number])) {
		throw new Error(
			`Invalid field type: "${trimmedType}". Must be one of: ${SCHEMA_FIELD_TYPES.join(', ')}`,
		);
	}

	let additionalFields: Record<string, unknown> = {};
	try {
		additionalFields =
			(this.getNodeParameter('additionalFields', {}) as Record<string, unknown>) || {};
	} catch {
		additionalFields = {};
	}

	const getParam = (name: string): unknown => {
		if (additionalFields[name] !== undefined) return additionalFields[name];
		try {
			return this.getNodeParameter(name);
		} catch {
			return undefined;
		}
	};

	const body: Record<string, unknown> = {
		slug: trimmedSlug,
		label: trimmedLabel,
		type: trimmedType,
	};

	const required = getParam('required');
	if (typeof required === 'boolean') {
		body.required = required;
	}

	const unique = getParam('unique');
	if (typeof unique === 'boolean') {
		body.unique = unique;
	}

	const defaultValue = getParam('defaultValue');
	if (defaultValue !== undefined && defaultValue !== '') {
		body.defaultValue = parseJsonParameter(defaultValue, 'defaultValue', true);
	}

	const validation = getParam('validation');
	if (validation !== undefined && validation !== '') {
		const parsed = parseJsonParameter(validation, 'validation');
		if (parsed !== null && parsed !== undefined) {
			if (typeof parsed !== 'object' || Array.isArray(parsed)) {
				throw new Error('validation must be a JSON object or null');
			}
		}
		body.validation = parsed ?? null;
	}

	const widget = getParam('widget');
	if (typeof widget === 'string' && widget.trim()) {
		body.widget = widget.trim();
	}

	const options = getParam('options');
	if (options !== undefined && options !== '' && options !== '{}') {
		const parsed = parseJsonParameter(options, 'options');
		if (parsed !== undefined && parsed !== null) {
			if (typeof parsed !== 'object' || Array.isArray(parsed)) {
				throw new Error('options must be a JSON object');
			}
			body.options = parsed;
		}
	}

	const sortOrder = getParam('sortOrder');
	if (sortOrder !== undefined && sortOrder !== null && (sortOrder as unknown) !== '') {
		if (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder) || sortOrder < 0) {
			throw new Error('sortOrder must be an integer greater than or equal to 0');
		}
		body.sortOrder = sortOrder;
	}

	const searchable = getParam('searchable');
	if (typeof searchable === 'boolean') {
		body.searchable = searchable;
	}

	const indexed = getParam('indexed');
	if (typeof indexed === 'boolean') {
		body.indexed = indexed;
	}

	const translatable = getParam('translatable');
	if (typeof translatable === 'boolean') {
		body.translatable = translatable;
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateUpdateField(
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

	if ('label' in updateFields && updateFields.label !== undefined) {
		const label = String(updateFields.label).trim();
		if (!label) {
			throw new Error('label cannot be empty or whitespace');
		}
		body.label = label;
	}

	if ('type' in updateFields && updateFields.type !== undefined && updateFields.type !== '') {
		const type = String(updateFields.type).trim();
		if (!SCHEMA_FIELD_TYPES.includes(type as (typeof SCHEMA_FIELD_TYPES)[number])) {
			throw new Error(
				`Invalid field type: "${type}". Must be one of: ${SCHEMA_FIELD_TYPES.join(', ')}`,
			);
		}
		body.type = type;
	}

	if ('required' in updateFields && typeof updateFields.required === 'boolean') {
		body.required = updateFields.required;
	}

	if ('unique' in updateFields && typeof updateFields.unique === 'boolean') {
		body.unique = updateFields.unique;
	}

	if ('defaultValue' in updateFields && updateFields.defaultValue !== undefined) {
		const val = updateFields.defaultValue;
		if (val === null) {
			body.defaultValue = null;
		} else if (val === '') {
			body.defaultValue = undefined;
		} else {
			body.defaultValue = parseJsonParameter(val, 'defaultValue', true);
		}
	}

	if ('validation' in updateFields && updateFields.validation !== undefined) {
		const val = updateFields.validation;
		if (val === null || val === 'null') {
			body.validation = null;
		} else if (val === '') {
			body.validation = null;
		} else {
			const parsed = parseJsonParameter(val, 'validation');
			if (parsed !== null && parsed !== undefined) {
				if (typeof parsed !== 'object' || Array.isArray(parsed)) {
					throw new Error('validation must be a JSON object or null');
				}
			}
			body.validation = parsed ?? null;
		}
	}

	if (
		'widget' in updateFields &&
		updateFields.widget !== undefined &&
		updateFields.widget !== null
	) {
		const trimmed = String(updateFields.widget).trim();
		body.widget = trimmed;
	}

	if (
		'options' in updateFields &&
		updateFields.options !== undefined &&
		updateFields.options !== ''
	) {
		const val = updateFields.options;
		if (val === null || val === 'null') {
			body.options = undefined;
		} else {
			const parsed = parseJsonParameter(val, 'options');
			if (parsed !== undefined && parsed !== null) {
				if (typeof parsed !== 'object' || Array.isArray(parsed)) {
					throw new Error('options must be a JSON object');
				}
				body.options = parsed;
			}
		}
	}

	if (
		'sortOrder' in updateFields &&
		updateFields.sortOrder !== undefined &&
		updateFields.sortOrder !== null &&
		(updateFields.sortOrder as unknown) !== ''
	) {
		const val = updateFields.sortOrder;
		if (typeof val !== 'number' || !Number.isInteger(val) || val < 0) {
			throw new Error('sortOrder must be an integer greater than or equal to 0');
		}
		body.sortOrder = val;
	}

	if ('searchable' in updateFields && typeof updateFields.searchable === 'boolean') {
		body.searchable = updateFields.searchable;
	}

	if ('indexed' in updateFields && typeof updateFields.indexed === 'boolean') {
		body.indexed = updateFields.indexed;
	}

	if ('translatable' in updateFields && typeof updateFields.translatable === 'boolean') {
		body.translatable = updateFields.translatable;
	}

	if (Object.keys(body).length === 0) {
		throw new Error('At least one field must be provided to update field');
	}

	requestOptions.body = body;
	return requestOptions;
}

export async function validateReorderFields(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	let rawSlugs: unknown;
	try {
		rawSlugs = this.getNodeParameter('fieldSlugs', []);
	} catch {
		rawSlugs = [];
	}

	const validatedSlugs = parseAndValidateFieldSlugs(rawSlugs);

	requestOptions.body = {
		fieldSlugs: validatedSlugs,
	};

	return requestOptions;
}
