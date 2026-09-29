import type { INodeProperties } from 'n8n-workflow';

const showOnlyForWidgetAreaCreateWidget = {
	resource: ['widgetArea'],
	operation: ['createWidget'],
};

export const widgetAreaCreateWidgetDescription: INodeProperties[] = [
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'content',
		displayOptions: {
			show: showOnlyForWidgetAreaCreateWidget,
		},
		options: [
			{
				name: 'Component',
				value: 'component',
				description: 'Render a registered theme or plugin component',
			},
			{
				name: 'Content',
				value: 'content',
				description: 'Render structured content blocks directly',
			},
			{
				name: 'Menu',
				value: 'menu',
				description: 'Render a navigation menu',
			},
		],
		description: 'The type of widget to create',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForWidgetAreaCreateWidget,
		},
		description: 'Optional display title for the widget',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: {
			show: {
				...showOnlyForWidgetAreaCreateWidget,
				type: ['content'],
			},
		},
		description:
			'Structured content for the widget as a JSON array of objects ([{ type: "...", ... }]).',
	},
	{
		displayName: 'Menu Name',
		name: 'menuName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForWidgetAreaCreateWidget,
				type: ['menu'],
			},
		},
		description: 'The name or identifier of the menu to display',
	},
	{
		displayName: 'Component ID',
		name: 'componentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForWidgetAreaCreateWidget,
				type: ['component'],
			},
		},
		description: 'Registered component identifier',
	},
	{
		displayName: 'Component Properties',
		name: 'componentProps',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				...showOnlyForWidgetAreaCreateWidget,
				type: ['component'],
			},
		},
		description: 'Component properties as a JSON object',
	},
];
