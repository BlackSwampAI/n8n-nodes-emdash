import {
	NodeConnectionTypes,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { commentDescription } from './resources/comment';
import { contentDescription } from './resources/content';
import { mediaDescription } from './resources/media';
import { menuDescription } from './resources/menu';
import { redirectDescription } from './resources/redirect';
import { searchDescription } from './resources/search';
import { sectionDescription } from './resources/section';
import { settingsDescription } from './resources/settings';
import { taxonomyDescription } from './resources/taxonomy';
import { widgetAreaDescription } from './resources/widgetArea';
import { getCollections } from './listSearch/getCollections';
import { getMediaFolders } from './listSearch/getMediaFolders';
import { getMenus } from './listSearch/getMenus';
import { getSections } from './listSearch/getSections';
import { getTaxonomies } from './listSearch/getTaxonomies';
import { getWidgetAreas } from './listSearch/getWidgetAreas';

const resourceOptions: INodePropertyOptions[] = [
	{
		name: 'Comment',
		value: 'comment',
	},
	{
		name: 'Content',
		value: 'content',
	},
	{
		name: 'Media',
		value: 'media',
	},
	{
		name: 'Menu',
		value: 'menu',
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
		name: 'Section',
		value: 'section',
	},
	{
		name: 'Settings',
		value: 'settings',
	},
	{
		name: 'Taxonomy',
		value: 'taxonomy',
	},
	{
		name: 'Widget Area',
		value: 'widgetArea',
	},
];

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
				options: resourceOptions,
				default: 'content',
			},
			...commentDescription,
			...contentDescription,
			...mediaDescription,
			...menuDescription,
			...redirectDescription,
			...searchDescription,
			...sectionDescription,
			...settingsDescription,
			...taxonomyDescription,
			...widgetAreaDescription,
		],
	};

	methods = {
		listSearch: {
			getCollections,
			getMediaFolders,
			getMenus,
			getSections,
			getTaxonomies,
			getWidgetAreas,
		},
	};
}

export { Emdash as EmDash };
