import type { INodeProperties } from 'n8n-workflow';

const showOnlyForWidgetAreaCreate = {
	resource: ['widgetArea'],
	operation: ['create'],
};

export const widgetAreaCreateDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForWidgetAreaCreate,
		},
		description: 'Unique identifier for the widget area (e.g. sidebar-main, footer-1)',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForWidgetAreaCreate,
		},
		description: 'Human-readable display label for the widget area (e.g. Main Sidebar)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForWidgetAreaCreate,
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Brief description of the widget area location or purpose',
			},
		],
	},
];
