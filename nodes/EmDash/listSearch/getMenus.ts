import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { emdashApiRequest } from '../shared/transport';

interface MenuRecord {
	name: string;
	label?: string;
	locale?: string;
}

interface MenuListResponse {
	items?: MenuRecord[];
	menus?: MenuRecord[];
}

export async function getMenus(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	let menus: MenuRecord[] = [];

	try {
		const response = (await emdashApiRequest.call(this, 'GET', '/menus')) as
			| MenuRecord[]
			| MenuListResponse;

		if (Array.isArray(response)) {
			menus = response;
		} else if (response && Array.isArray((response as { menus?: MenuRecord[] }).menus)) {
			menus = (response as { menus: MenuRecord[] }).menus;
		} else if (response && Array.isArray(response.items)) {
			menus = response.items;
		}
	} catch {
		return { results: [] };
	}

	if (filter) {
		const lower = filter.toLowerCase();
		menus = menus.filter(
			(menu) =>
				(menu.label && menu.label.toLowerCase().includes(lower)) ||
				(menu.name && menu.name.toLowerCase().includes(lower)),
		);
	}

	const results: INodeListSearchItems[] = menus.map((menu) => {
		const localeSuffix = menu.locale ? ` [${menu.locale}]` : '';
		const nameSuffix = menu.label && menu.label !== menu.name ? ` (${menu.name})` : '';
		const name = `${menu.label || menu.name}${localeSuffix}${nameSuffix}`;
		return {
			name,
			value: menu.name,
		};
	});

	return { results };
}
