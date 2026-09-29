import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { emdashApiRequest } from '../shared/transport';

interface SectionRecord {
	slug: string;
	title: string;
	description?: string | null;
}

interface SectionListResponse {
	items?: SectionRecord[];
}

export async function getSections(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	let sections: SectionRecord[] = [];

	const qs: IDataObject = { limit: 100 };
	if (filter && filter.trim()) {
		qs.search = filter.trim();
	}

	try {
		const response = (await emdashApiRequest.call(this, 'GET', '/sections', undefined, qs)) as
			| SectionRecord[]
			| SectionListResponse;

		if (Array.isArray(response)) {
			sections = response;
		} else if (response && Array.isArray((response as SectionListResponse).items)) {
			sections = (response as SectionListResponse).items!;
		}
	} catch {
		return { results: [] };
	}

	if (filter) {
		const lower = filter.toLowerCase();
		sections = sections.filter(
			(section) =>
				(section.title && section.title.toLowerCase().includes(lower)) ||
				(section.slug && section.slug.toLowerCase().includes(lower)),
		);
	}

	const results: INodeListSearchItems[] = sections.map((section) => ({
		name: section.title ? `${section.title} (${section.slug})` : section.slug,
		value: section.slug,
	}));

	return { results };
}
