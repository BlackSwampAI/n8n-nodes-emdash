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
			'Array or comma-separated list of widget IDs in the desired order. EmDash assigns new zero-based sort positions to supplied widgets; provide the complete ordered list of widgets in the area for deterministic ordering.',
	},
];
