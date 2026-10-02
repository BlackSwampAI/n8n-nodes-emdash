import type { INodeProperties } from 'n8n-workflow';
import { sectionSelect } from '../../shared/descriptions';
import { validateCreateSection, validateUpdateSection } from '../../shared/transport';
import { sectionGetAllDescription } from './getAll';
import { sectionCreateDescription } from './create';
import { sectionUpdateDescription } from './update';

const showOnlyForSection = {
	resource: ['section'],
};

export const sectionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSection,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a section',
				description: 'Create a new section template with structured content',
				routing: {
					request: {
						method: 'POST',
						url: '/sections',
					},
					send: {
						preSend: [validateCreateSection],
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
				action: 'Delete a section',
				description:
					'Permanently delete a section (cannot delete theme sections; does not delete referenced content/media)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/sections/{{$parameter.section}}',
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
				action: 'Get a section',
				description: 'Retrieve a single section by slug',
				routing: {
					request: {
						method: 'GET',
						url: '=/sections/{{$parameter.section}}',
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
				action: 'Get many sections',
				description: 'Retrieve many sections with pagination and filters',
				routing: {
					request: {
						method: 'GET',
						url: '/sections',
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
				name: 'Update',
				value: 'update',
				action: 'Update a section',
				description: 'Update an existing section by slug',
				routing: {
					request: {
						method: 'PUT',
						url: '=/sections/{{$parameter.section}}',
					},
					send: {
						preSend: [validateUpdateSection],
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
	sectionSelect,
	...sectionGetAllDescription,
	...sectionCreateDescription,
	...sectionUpdateDescription,
];
