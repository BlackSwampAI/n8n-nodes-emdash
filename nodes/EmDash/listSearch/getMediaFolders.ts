import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { emdashApiRequest } from '../shared/transport';

interface FolderRecord {
	id: string;
	name?: string;
}

interface FolderListResponse {
	items?: FolderRecord[];
}

export async function getMediaFolders(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	let folders: FolderRecord[] = [];

	try {
		const response = (await emdashApiRequest.call(this, 'GET', '/media/folders')) as
			| FolderRecord[]
			| FolderListResponse;

		if (Array.isArray(response)) {
			folders = response;
		} else if (response && Array.isArray(response.items)) {
			folders = response.items;
		}
	} catch {
		return { results: [] };
	}

	if (filter) {
		const lower = filter.toLowerCase();
		folders = folders.filter(
			(folder) =>
				(folder.name && folder.name.toLowerCase().includes(lower)) ||
				(folder.id && folder.id.toLowerCase().includes(lower)),
		);
	}

	const results: INodeListSearchItems[] = folders.map((folder) => ({
		name: folder.name || folder.id,
		value: folder.id,
	}));

	return { results };
}
