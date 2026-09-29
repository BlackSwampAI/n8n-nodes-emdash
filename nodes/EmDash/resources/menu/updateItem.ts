import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuUpdateItem = {
	resource: ['menu'],
	operation: ['updateItem'],
};

export const menuUpdateItemDescription: INodeProperties[] = [
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForMenuUpdateItem,
		},
		description: 'Target BCP-47 locale code (query parameter)',
		routing: {
			request: {
				qs: {
					locale: '={{$value || undefined}}',
				},
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForMenuUpdateItem,
		},
		options: [
			{
				displayName: 'CSS Classes',
				name: 'cssClasses',
				type: 'string',
				default: '',
				description: 'Custom CSS class names separated by spaces',
				routing: {
					send: {
						type: 'body',
						property: 'cssClasses',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Custom URL',
				name: 'customUrl',
				type: 'string',
				default: '',
				description: 'Updated URL for custom navigation links',
				routing: {
					send: {
						type: 'body',
						property: 'customUrl',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'Updated human-readable label for the menu item',
				routing: {
					send: {
						type: 'body',
						property: 'label',
					},
				},
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				description:
					'Parent menu item ID to nest under, or empty string / "null" to move to top level (root)',
				routing: {
					send: {
						type: 'body',
						property: 'parentId',
						value: '={{ $value === "null" || $value === "" ? null : $value }}',
					},
				},
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Display order among sibling menu items (0-indexed integer)',
				routing: {
					send: {
						type: 'body',
						property: 'sortOrder',
					},
				},
			},
			{
				displayName: 'Target',
				name: 'target',
				type: 'options',
				options: [
					{
						name: 'New Window (_Blank)',
						value: '_blank',
					},
					{
						name: 'Parent Frame (_Parent)',
						value: '_parent',
					},
					{
						name: 'Same Window (_Self)',
						value: '_self',
					},
					{
						name: 'Top Frame (_Top)',
						value: '_top',
					},
				],
				default: '_self',
				description: 'Target browsing context for opening the link',
				routing: {
					send: {
						type: 'body',
						property: 'target',
					},
				},
			},
			{
				displayName: 'Title Attribute',
				name: 'titleAttr',
				type: 'string',
				default: '',
				description: 'HTML title attribute for hover text',
				routing: {
					send: {
						type: 'body',
						property: 'titleAttr',
						value: '={{$value || undefined}}',
					},
				},
			},
		],
	},
];
