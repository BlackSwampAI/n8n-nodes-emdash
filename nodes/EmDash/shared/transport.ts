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
		type: 'generic',
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
