import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { contentDescription } from './resources/content';
import { mediaDescription } from './resources/media';
import { redirectDescription } from './resources/redirect';
import { searchDescription } from './resources/search';
import { taxonomyDescription } from './resources/taxonomy';
import { getCollections } from './listSearch/getCollections';
import { getMediaFolders } from './listSearch/getMediaFolders';
import { getTaxonomies } from './listSearch/getTaxonomies';

export class Emdash implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EmDash',
		name: 'emdash',
		icon: { light: 'file:../../icons/emdash.svg', dark: 'file:../../icons/emdash.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume and manage content and media from EmDash CMS',
		defaults: {
			name: 'EmDash',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'emdashApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.siteUrl.trim().replace(/\\/+$/, "") + "/_emdash/api"}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Content',
						value: 'content',
					},
					{
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Redirect',
						value: 'redirect',
					},
					{
						name: 'Search',
						value: 'search',
					},
					{
						name: 'Taxonomy',
						value: 'taxonomy',
					},
				],
				default: 'content',
			},
			...contentDescription,
			...mediaDescription,
			...redirectDescription,
			...searchDescription,
			...taxonomyDescription,
		],
	};

	methods = {
		listSearch: {
			getCollections,
			getMediaFolders,
			getTaxonomies,
		},
	};
}

export { Emdash as EmDash };
