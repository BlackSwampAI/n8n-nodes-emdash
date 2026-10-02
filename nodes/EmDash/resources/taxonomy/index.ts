import type { INodeProperties } from 'n8n-workflow';
import { taxonomySelect, termSlugProperty } from '../../shared/descriptions';
import { taxonomyUpdateTaxonomyDescription } from './updateTaxonomy';
import { taxonomyGetAllTermsDescription } from './getAllTerms';
import { taxonomyCreateTermDescription } from './createTerm';
import { taxonomyUpdateTermDescription } from './updateTerm';
import { taxonomyReorderTermsDescription } from './reorderTerms';

const showOnlyForTaxonomy = {
	resource: ['taxonomy'],
};

export const taxonomyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForTaxonomy,
		},
		options: [
			{
				name: 'Create Term',
				value: 'createTerm',
				action: 'Create a taxonomy term',
				description: 'Create a new term within a taxonomy',
				routing: {
					request: {
						method: 'POST',
						url: '=/taxonomies/{{$parameter.taxonomy}}/terms',
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
				value: 'deleteTaxonomy',
				action: 'Delete a taxonomy',
				description: 'Delete a taxonomy definition and all its terms',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/taxonomies/{{$parameter.taxonomy}}',
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
				name: 'Delete Term',
				value: 'deleteTerm',
				action: 'Delete a taxonomy term',
				description: 'Delete a taxonomy term by slug',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/taxonomies/{{$parameter.taxonomy}}/terms/{{$parameter.termSlug}}',
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
				value: 'getTaxonomy',
				action: 'Get a taxonomy',
				description: 'Get taxonomy schema and metadata by name',
				routing: {
					request: {
						method: 'GET',
						url: '=/taxonomies/{{$parameter.taxonomy}}',
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
				value: 'getAllTaxonomies',
				action: 'Get many taxonomies',
				description: 'List all registered taxonomies',
				routing: {
					request: {
						method: 'GET',
						url: '/taxonomies',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.taxonomies',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Many Terms',
				value: 'getAllTerms',
				action: 'Get many taxonomy terms',
				description: 'List all terms in a taxonomy',
				routing: {
					request: {
						method: 'GET',
						url: '=/taxonomies/{{$parameter.taxonomy}}/terms',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.terms',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Term',
				value: 'getTerm',
				action: 'Get a taxonomy term',
				description: 'Get a single taxonomy term by slug',
				routing: {
					request: {
						method: 'GET',
						url: '=/taxonomies/{{$parameter.taxonomy}}/terms/{{$parameter.termSlug}}',
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
				name: 'Reorder Terms',
				value: 'reorderTerms',
				action: 'Reorder taxonomy terms',
				description: 'Update the display order of terms within a taxonomy',
				routing: {
					request: {
						method: 'POST',
						url: '=/taxonomies/{{$parameter.taxonomy}}/reorder',
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
				value: 'updateTaxonomy',
				action: 'Update a taxonomy',
				description: 'Update taxonomy configuration and metadata',
				routing: {
					request: {
						method: 'PUT',
						url: '=/taxonomies/{{$parameter.taxonomy}}',
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
				name: 'Update Term',
				value: 'updateTerm',
				action: 'Update a taxonomy term',
				description: 'Update an existing taxonomy term by slug',
				routing: {
					request: {
						method: 'PUT',
						url: '=/taxonomies/{{$parameter.taxonomy}}/terms/{{$parameter.termSlug}}',
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
		default: 'getAllTaxonomies',
	},
	taxonomySelect,
	termSlugProperty,
	...taxonomyUpdateTaxonomyDescription,
	...taxonomyGetAllTermsDescription,
	...taxonomyCreateTermDescription,
	...taxonomyUpdateTermDescription,
	...taxonomyReorderTermsDescription,
];
