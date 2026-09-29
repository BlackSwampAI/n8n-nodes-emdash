import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { emdashApiRequest } from '../shared/transport';

interface WidgetAreaRecord {
	name: string;
	label: string;
	description?: string | null;
}

interface WidgetAreaListResponse {
	items?: WidgetAreaRecord[];
}

export async function getWidgetAreas(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	let areas: WidgetAreaRecord[] = [];

	try {
		const response = (await emdashApiRequest.call(this, 'GET', '/widget-areas')) as
			| WidgetAreaRecord[]
			| WidgetAreaListResponse;

		if (Array.isArray(response)) {
			areas = response;
		} else if (response && Array.isArray((response as WidgetAreaListResponse).items)) {
			areas = (response as WidgetAreaListResponse).items!;
		}
	} catch {
		return { results: [] };
	}

	if (filter) {
		const lower = filter.toLowerCase();
		areas = areas.filter(
			(area) =>
				(area.label && area.label.toLowerCase().includes(lower)) ||
				(area.name && area.name.toLowerCase().includes(lower)),
		);
	}

	const results: INodeListSearchItems[] = areas.map((area) => ({
		name: `${area.label} (${area.name})`,
		value: area.name,
	}));

	return { results };
}
