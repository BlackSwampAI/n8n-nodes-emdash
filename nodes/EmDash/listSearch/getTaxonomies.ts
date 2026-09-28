import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { emdashApiRequest } from '../shared/transport';

interface TaxonomyRecord {
	name: string;
	label?: string;
}

interface TaxonomyListResponse {
	items?: TaxonomyRecord[];
	taxonomies?: TaxonomyRecord[];
}

export async function getTaxonomies(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	let taxonomies: TaxonomyRecord[] = [];

	try {
		const response = (await emdashApiRequest.call(this, 'GET', '/taxonomies')) as
			| TaxonomyRecord[]
			| TaxonomyListResponse;

		if (Array.isArray(response)) {
			taxonomies = response;
		} else if (
			response &&
			Array.isArray((response as { taxonomies?: TaxonomyRecord[] }).taxonomies)
		) {
			taxonomies = (response as { taxonomies: TaxonomyRecord[] }).taxonomies;
		} else if (response && Array.isArray(response.items)) {
			taxonomies = response.items;
		}
	} catch {
		return { results: [] };
	}

	if (filter) {
		const lower = filter.toLowerCase();
		taxonomies = taxonomies.filter(
			(tax) =>
				(tax.label && tax.label.toLowerCase().includes(lower)) ||
				(tax.name && tax.name.toLowerCase().includes(lower)),
		);
	}

	const results: INodeListSearchItems[] = taxonomies.map((tax) => ({
		name: tax.label || tax.name,
		value: tax.name,
	}));

	return { results };
}
