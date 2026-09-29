import type { INodeProperties } from 'n8n-workflow';

const showOnlyForWidgetAreaUpdateWidget = {
	resource: ['widgetArea'],
	operation: ['updateWidget'],
};

export const widgetAreaUpdateWidgetDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: showOnlyForWidgetAreaUpdateWidget,
		},
		default: {},
		options: [
			{
				displayName: 'Component ID',
				name: 'componentId',
				type: 'string',
				default: '',
				description: 'Registered component identifier',
			},
			{
				displayName: 'Component Properties',
				name: 'componentProps',
				type: 'json',
				default: '{}',
				description: 'Component properties as a JSON object',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'json',
				default: '[]',
				description:
					'Structured content for the widget as a JSON array of objects ([{ type: "...", ... }]).',
			},
			{
				displayName: 'Menu Name',
				name: 'menuName',
				type: 'string',
				default: '',
				description: 'The name or identifier of the menu to display',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Display title for the widget',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Component',
						value: 'component',
					},
					{
						name: 'Content',
						value: 'content',
					},
					{
						name: 'Menu',
						value: 'menu',
					},
				],
				default: 'content',
				description: 'The type of widget',
			},
		],
	},
];
