import type { INodeProperties } from 'n8n-workflow';
import { searchCollectionSelect } from '../../shared/descriptions';
import { searchSearchDescription } from './search';
import { searchSuggestDescription } from './suggest';
import { searchGetStatsDescription } from './getStats';
import { searchRebuildIndexDescription } from './rebuildIndex';
import { searchEnableSearchDescription } from './enableSearch';

const showOnlyForSearch = {
	resource: ['search'],
};

export const searchDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSearch,
		},
		options: [
			{
				name: 'Enable / Configure Search',
				value: 'enableSearch',
				action: 'Enable or configure search for a collection',
				description: 'Enable or configure SQLite FTS5 full-text search for a collection',
				routing: {
					request: {
						method: 'POST',
						url: '/search/enable',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Stats',
				value: 'getStats',
				action: 'Get search index statistics',
				description: 'Retrieve search index statistics across indexed collections',
				routing: {
					request: {
						method: 'GET',
						url: '/search/stats',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Rebuild Index',
				value: 'rebuildIndex',
				action: 'Rebuild search index',
				description: 'Trigger a full-text search index rebuild for a collection',
				routing: {
					request: {
						method: 'POST',
						url: '/search/rebuild',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search content',
				description: 'Execute full-text search across indexed content',
				routing: {
					request: {
						method: 'GET',
						url: '/search',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				name: 'Suggest',
				value: 'suggest',
				action: 'Get search suggestions',
				description: 'Get autocompletion suggestions for search queries',
				routing: {
					request: {
						method: 'GET',
						url: '/search/suggest',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'search',
	},
	searchCollectionSelect,
	...searchSearchDescription,
	...searchSuggestDescription,
	...searchGetStatsDescription,
	...searchRebuildIndexDescription,
	...searchEnableSearchDescription,
];
