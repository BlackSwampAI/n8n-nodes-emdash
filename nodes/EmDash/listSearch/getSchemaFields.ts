import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { emdashApiRequest } from '../shared/transport';

interface SchemaFieldRecord {
	slug: string;
	label?: string;
}

interface FieldListResponse {
	items?: SchemaFieldRecord[];
}

export async function getSchemaFields(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	let collectionValue: unknown;
	try {
		collectionValue = this.getNodeParameter('collection');
	} catch {
		return { results: [] };
	}

	let collectionSlug = '';
	if (typeof collectionValue === 'string') {
		collectionSlug = collectionValue.trim();
	} else if (
		typeof collectionValue === 'object' &&
		collectionValue !== null &&
		'value' in collectionValue
	) {
		const val = (collectionValue as { value?: unknown }).value;
		collectionSlug = typeof val === 'string' ? val.trim() : '';
	}

	if (!collectionSlug) {
		return { results: [] };
	}

	let fields: SchemaFieldRecord[] = [];

	try {
		const response = (await emdashApiRequest.call(
			this,
			'GET',
			`/schema/collections/${encodeURIComponent(collectionSlug)}/fields`,
		)) as SchemaFieldRecord[] | FieldListResponse;

		if (Array.isArray(response)) {
			fields = response;
		} else if (response && Array.isArray(response.items)) {
			fields = response.items;
		}
	} catch {
		return { results: [] };
	}

	const trimmedFilter = filter?.trim();
	if (trimmedFilter) {
		const lower = trimmedFilter.toLowerCase();
		fields = fields.filter(
			(f) =>
				(f.label && f.label.toLowerCase().includes(lower)) ||
				(f.slug && f.slug.toLowerCase().includes(lower)),
		);
	}

	const results: INodeListSearchItems[] = fields.map((field) => ({
		name: field.label ? `${field.label} (${field.slug})` : field.slug,
		value: field.slug,
	}));

	return { results };
}
