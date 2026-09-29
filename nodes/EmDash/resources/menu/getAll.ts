import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuGetAll = {
	resource: ['menu'],
	operation: ['getAll'],
};

export const menuGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForMenuGetAll,
		},
		description: 'Filter menus by BCP-47 locale code (e.g. en, fr, de)',
		routing: {
			request: {
				qs: {
					locale: '={{$value || undefined}}',
				},
			},
		},
	},
];
