import type { INodeProperties } from 'n8n-workflow';
import { validateUpdateSettings } from '../../shared/transport';
import { settingsGetDescription } from './get';
import { settingsUpdateDescription } from './update';

const showOnlyForSettings = {
	resource: ['settings'],
};

export const settingsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSettings,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get site settings',
				description: 'Retrieve current site settings',
				routing: {
					request: {
						method: 'GET',
						url: '/settings',
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
				value: 'update',
				action: 'Update site settings',
				description: 'Update site settings with a JSON object',
				routing: {
					request: {
						// Note: Upstream OpenAPI (packages/core/src/api/openapi/document.ts) specifies PUT /_emdash/api/settings (updateSettings).
						// However, the actual EmDash route implementation (packages/core/src/astro/routes/api/settings.ts) only exports
						// GET and POST handlers (POST /_emdash/api/settings - Update site settings), and EmDash's first-party admin client
						// (packages/admin/src/lib/api/settings.ts) calls POST /settings.
						// Therefore, POST /settings is intentionally used for runtime compatibility with EmDash 1.0.1.
						method: 'POST',
						url: '/settings',
					},
					send: {
						preSend: [validateUpdateSettings],
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
		default: 'get',
	},
	...settingsGetDescription,
	...settingsUpdateDescription,
];
