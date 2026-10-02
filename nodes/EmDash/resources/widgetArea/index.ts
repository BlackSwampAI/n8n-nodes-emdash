import type { INodeProperties } from 'n8n-workflow';
import { widgetAreaSelect, widgetIdProperty } from '../../shared/descriptions';
import {
	validateCreateWidgetArea,
	validateCreateWidget,
	validateUpdateWidget,
	validateReorderWidgets,
} from '../../shared/transport';
import { widgetAreaCreateDescription } from './create';
import { widgetAreaCreateWidgetDescription } from './createWidget';
import { widgetAreaUpdateWidgetDescription } from './updateWidget';
import { widgetAreaReorderWidgetsDescription } from './reorderWidgets';

const showOnlyForWidgetArea = {
	resource: ['widgetArea'],
};

export const widgetAreaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForWidgetArea,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a widget area',
				description: 'Create a new widget area',
				routing: {
					request: {
						method: 'POST',
						url: '/widget-areas',
					},
					send: {
						preSend: [validateCreateWidgetArea],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Create Widget',
				value: 'createWidget',
				action: 'Create a widget',
				description: 'Add a new widget to a widget area',
				routing: {
					request: {
						method: 'POST',
						url: '=/widget-areas/{{$parameter.widgetArea}}/widgets',
					},
					send: {
						preSend: [validateCreateWidget],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a widget area',
				description:
					'Permanently delete a widget area. Deleting a widget area also deletes its widgets.',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/widget-areas/{{$parameter.widgetArea}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Delete Widget',
				value: 'deleteWidget',
				action: 'Delete a widget',
				description:
					'Delete a widget from a widget area (does not delete the widget area, menus, or components)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/widget-areas/{{$parameter.widgetArea}}/widgets/{{$parameter.widgetId}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a widget area',
				description: 'Retrieve a single widget area by name including its widgets',
				routing: {
					request: {
						method: 'GET',
						url: '=/widget-areas/{{$parameter.widgetArea}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many widget areas',
				description: 'Retrieve many widget areas with their widgets (no pagination)',
				routing: {
					request: {
						method: 'GET',
						url: '/widget-areas',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				name: 'Reorder Widgets',
				value: 'reorderWidgets',
				action: 'Reorder widgets',
				description: 'Update the display sequence of widgets within a widget area',
				routing: {
					request: {
						method: 'POST',
						url: '=/widget-areas/{{$parameter.widgetArea}}/reorder',
					},
					send: {
						preSend: [validateReorderWidgets],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update Widget',
				value: 'updateWidget',
				action: 'Update a widget',
				description: 'Update an existing widget in a widget area',
				routing: {
					request: {
						method: 'PUT',
						url: '=/widget-areas/{{$parameter.widgetArea}}/widgets/{{$parameter.widgetId}}',
					},
					send: {
						preSend: [validateUpdateWidget],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	widgetAreaSelect,
	widgetIdProperty,
	...widgetAreaCreateDescription,
	...widgetAreaCreateWidgetDescription,
	...widgetAreaUpdateWidgetDescription,
	...widgetAreaReorderWidgetsDescription,
];
