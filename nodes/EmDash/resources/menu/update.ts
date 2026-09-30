import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuUpdate = {
	resource: ['menu'],
	operation: ['update'],
};

export const menuUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMenuUpdate,
		},
		description: 'Updated human-readable label for the menu',
		routing: {
			send: {
				type: 'body',
				property: 'label',
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForMenuUpdate,
		},
		options: [
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'Target BCP-47 locale code (query parameter)',
				routing: {
					request: {
						qs: {
							locale: '={{$value || undefined}}',
						},
					},
				},
			},
		],
	},
];
