import type { INodeProperties } from 'n8n-workflow';

const showOnlyForWidgetAreaReorder = {
	resource: ['widgetArea'],
	operation: ['reorderWidgets'],
};

export const widgetAreaReorderWidgetsDescription: INodeProperties[] = [
	{
		displayName: 'Widget IDs',
		name: 'widgetIds',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: {
			show: showOnlyForWidgetAreaReorder,
		},
		description:
			'Array or comma-separated list of widget IDs in the desired order (all IDs must belong to the widget area)',
	},
];
