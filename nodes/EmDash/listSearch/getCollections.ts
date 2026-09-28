import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { emdashApiRequest } from '../shared/transport';

interface CollectionRecord {
	slug: string;
	name?: string;
	label?: string;
}

interface CollectionListResponse {
	items?: CollectionRecord[];
}

export async function getCollections(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	let collections: CollectionRecord[] = [];

	try {
		const response = (await emdashApiRequest.call(this, 'GET', '/schema/collections')) as
			| CollectionRecord[]
			| CollectionListResponse;

		if (Array.isArray(response)) {
			collections = response;
		} else if (response && Array.isArray(response.items)) {
			collections = response.items;
		}
	} catch {
		return { results: [] };
	}

	if (filter) {
		const lower = filter.toLowerCase();
		collections = collections.filter(
			(col) =>
				(col.name && col.name.toLowerCase().includes(lower)) ||
				(col.label && col.label.toLowerCase().includes(lower)) ||
				(col.slug && col.slug.toLowerCase().includes(lower)),
		);
	}

	const results: INodeListSearchItems[] = collections.map((col) => ({
		name: col.name || col.label || col.slug,
		value: col.slug,
	}));

	return { results };
}
