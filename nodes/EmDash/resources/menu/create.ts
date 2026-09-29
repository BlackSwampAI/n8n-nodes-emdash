import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuCreate = {
	resource: ['menu'],
	operation: ['create'],
};

export const menuCreateDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMenuCreate,
		},
		description: 'Unique identifier name for the menu (e.g. main-navigation)',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForMenuCreate,
		},
		description: 'Human-readable label for the menu',
		routing: {
			send: {
				type: 'body',
				property: 'label',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForMenuCreate,
		},
		options: [
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				description: 'BCP-47 locale code for this menu variant (e.g. en, fr, de)',
				routing: {
					send: {
						type: 'body',
						property: 'locale',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Translation Of',
				name: 'translationOf',
				type: 'string',
				default: '',
				description:
					'ID of the canonical menu this menu translates (clones items and joins translation group)',
				routing: {
					send: {
						type: 'body',
						property: 'translationOf',
						value: '={{$value || undefined}}',
					},
				},
			},
		],
	},
];
