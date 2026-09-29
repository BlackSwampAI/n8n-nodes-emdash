import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSettingsUpdate = {
	resource: ['settings'],
	operation: ['update'],
};

export const settingsUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'json',
		required: true,
		default: '{}',
		displayOptions: {
			show: showOnlyForSettingsUpdate,
		},
		description: 'Settings to update as a JSON object',
	},
];
