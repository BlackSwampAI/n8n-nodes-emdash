import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMenuCreateItem = {
	resource: ['menu'],
	operation: ['createItem'],
};

export const menuCreateItemDescription: INodeProperties[] = [
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'custom',
		displayOptions: {
			show: showOnlyForMenuCreateItem,
		},
		options: [
			{
				name: 'Collection',
				value: 'collection',
				description: 'Link to a collection archive',
			},
			{
				name: 'Custom URL',
				value: 'custom',
				description: 'Link to an arbitrary URL',
			},
			{
				name: 'Page',
				value: 'page',
				description: 'Link to a page content item',
			},
			{
				name: 'Post',
				value: 'post',
				description: 'Link to a post content item',
			},
			{
				name: 'Taxonomy',
				value: 'taxonomy',
				description: 'Link to a taxonomy term archive',
			},
		],
		description: 'The type of menu item to create',
		routing: {
			send: {
				type: 'body',
				property: 'type',
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
			show: showOnlyForMenuCreateItem,
		},
		description: 'The text displayed for this navigation item',
		routing: {
			send: {
				type: 'body',
				property: 'label',
			},
		},
	},
	{
		displayName: 'Custom URL',
		name: 'customUrl',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				...showOnlyForMenuCreateItem,
				type: ['custom'],
			},
		},
		description:
			'Destination URL for custom link (http, https, mailto, tel, relative, or fragment)',
		routing: {
			send: {
				type: 'body',
				property: 'customUrl',
				value: '={{$value || undefined}}',
			},
		},
	},
	{
		displayName: 'Reference Collection',
		name: 'referenceCollection',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				...showOnlyForMenuCreateItem,
				type: ['collection', 'page', 'post', 'taxonomy'],
			},
		},
		description: 'The collection slug of the referenced content',
		routing: {
			send: {
				type: 'body',
				property: 'referenceCollection',
				value: '={{$value || undefined}}',
			},
		},
	},
	{
		displayName: 'Reference ID',
		name: 'referenceId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				...showOnlyForMenuCreateItem,
				type: ['collection', 'page', 'post', 'taxonomy'],
			},
		},
		description: 'Translation group ID of the referenced content',
		routing: {
			send: {
				type: 'body',
				property: 'referenceId',
				value: '={{$value || undefined}}',
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
			show: showOnlyForMenuCreateItem,
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
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				description: 'ID of the parent menu item to nest under (empty for root)',
				routing: {
					send: {
						type: 'body',
						property: 'parentId',
						value: '={{$value || undefined}}',
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
