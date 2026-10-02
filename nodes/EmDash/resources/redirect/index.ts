import type { INodeProperties } from 'n8n-workflow';
import { redirectIdProperty } from '../../shared/descriptions';
import { redirectGetAllRedirectsDescription } from './getAllRedirects';
import { redirectCreateRedirectDescription } from './createRedirect';
import { redirectUpdateRedirectDescription } from './updateRedirect';
import { redirectGet404EntriesDescription } from './get404Entries';
import { redirectGet404SummaryDescription } from './get404Summary';
import { redirectPrune404LogDescription } from './prune404Log';

const showOnlyForRedirect = {
	resource: ['redirect'],
};

export const redirectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRedirect,
		},
		options: [
			{
				name: 'Clear All 404 Entries',
				value: 'clear404Log',
				action: 'Clear all 404 entries',
				description: 'Permanently remove all recorded 404 log entries (destructive)',
				routing: {
					request: {
						method: 'DELETE',
						url: '/redirects/404s',
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
				name: 'Create',
				value: 'createRedirect',
				action: 'Create a redirect',
				description: 'Create a new URL redirect rule',
				routing: {
					request: {
						method: 'POST',
						url: '/redirects',
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
				name: 'Delete',
				value: 'deleteRedirect',
				action: 'Delete a redirect',
				description: 'Delete a URL redirect rule by ID',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/redirects/{{$parameter.redirectId}}',
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
				name: 'Get',
				value: 'getRedirect',
				action: 'Get a redirect',
				description: 'Get a single redirect rule by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/redirects/{{$parameter.redirectId}}',
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
				name: 'Get 404 Entries',
				value: 'get404Entries',
				action: 'Get 404 log entries',
				description: 'Retrieve recorded 404 Not Found error entries with pagination',
				routing: {
					request: {
						method: 'GET',
						url: '/redirects/404s',
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
				name: 'Get 404 Summary',
				value: 'get404Summary',
				action: 'Get 404 log summary',
				description: 'Get aggregated summary of top 404 Not Found paths',
				routing: {
					request: {
						method: 'GET',
						url: '/redirects/404s/summary',
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
				name: 'Get Many',
				value: 'getAllRedirects',
				action: 'Get many redirects',
				description: 'Retrieve URL redirect rules with optional filtering and pagination',
				routing: {
					request: {
						method: 'GET',
						url: '/redirects',
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
				name: 'Prune 404 Log',
				value: 'prune404Log',
				action: 'Prune 404 log entries',
				description: 'Prune 404 log entries older than a specified ISO 8601 datetime',
				routing: {
					request: {
						method: 'POST',
						url: '/redirects/404s',
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
				name: 'Update',
				value: 'updateRedirect',
				action: 'Update a redirect',
				description: 'Update an existing URL redirect rule by ID',
				routing: {
					request: {
						method: 'PUT',
						url: '=/redirects/{{$parameter.redirectId}}',
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
		default: 'getAllRedirects',
	},
	redirectIdProperty,
	...redirectGetAllRedirectsDescription,
	...redirectCreateRedirectDescription,
	...redirectUpdateRedirectDescription,
	...redirectGet404EntriesDescription,
	...redirectGet404SummaryDescription,
	...redirectPrune404LogDescription,
];
