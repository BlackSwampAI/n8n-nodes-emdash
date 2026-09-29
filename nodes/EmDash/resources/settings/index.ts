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
						method: 'PUT',
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
