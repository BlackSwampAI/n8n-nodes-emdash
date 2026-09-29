import type { INodeProperties } from 'n8n-workflow';
import { menuItemIdProperty, menuSelect } from '../../shared/descriptions';
import { validateReorderMenuItems } from '../../shared/transport';
import { menuGetAllDescription } from './getAll';
import { menuGetDescription } from './get';
import { menuCreateDescription } from './create';
import { menuUpdateDescription } from './update';
import { menuDeleteDescription } from './delete';
import { menuCreateItemDescription } from './createItem';
import { menuUpdateItemDescription } from './updateItem';
import { menuDeleteItemDescription } from './deleteItem';
import { menuReorderItemsDescription } from './reorderItems';

const showOnlyForMenu = {
	resource: ['menu'],
};

export const menuDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMenu,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a menu',
				description: 'Create a new navigation menu',
				routing: {
					request: {
						method: 'POST',
						url: '/menus',
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
				name: 'Create Item',
				value: 'createItem',
				action: 'Create a menu item',
				description: 'Create a navigation item in a menu',
				routing: {
					request: {
						method: 'POST',
						url: '=/menus/{{$parameter.menu}}/items',
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
				action: 'Delete a menu',
				description:
					'Permanently delete a menu and all its navigation items for the targeted menu/locale (does not delete referenced content)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/menus/{{$parameter.menu}}',
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
				name: 'Delete Item',
				value: 'deleteItem',
				action: 'Delete a menu item',
				description: 'Delete a navigation item from a menu (does not delete referenced content)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/menus/{{$parameter.menu}}/items/{{$parameter.itemId}}',
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
				action: 'Get a menu',
				description: 'Get a single menu by name including its navigation items',
				routing: {
					request: {
						method: 'GET',
						url: '=/menus/{{$parameter.menu}}',
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
				action: 'Get many menus',
				description: 'List many navigation menus',
				routing: {
					request: {
						method: 'GET',
						url: '/menus',
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
				name: 'Reorder Items',
				value: 'reorderItems',
				action: 'Reorder menu items',
				description: 'Update the hierarchy and display ordering of items within a menu',
				routing: {
					request: {
						method: 'POST',
						url: '=/menus/{{$parameter.menu}}/reorder',
					},
					send: {
						preSend: [validateReorderMenuItems],
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
				name: 'Update',
				value: 'update',
				action: 'Update a menu',
				description: 'Update a menu label',
				routing: {
					request: {
						method: 'PUT',
						url: '=/menus/{{$parameter.menu}}',
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
				name: 'Update Item',
				value: 'updateItem',
				action: 'Update a menu item',
				description: 'Update a navigation item in a menu',
				routing: {
					request: {
						method: 'PUT',
						url: '=/menus/{{$parameter.menu}}/items/{{$parameter.itemId}}',
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
	menuSelect,
	menuItemIdProperty,
	...menuGetAllDescription,
	...menuGetDescription,
	...menuCreateDescription,
	...menuUpdateDescription,
	...menuDeleteDescription,
	...menuCreateItemDescription,
	...menuUpdateItemDescription,
	...menuDeleteItemDescription,
	...menuReorderItemsDescription,
];
