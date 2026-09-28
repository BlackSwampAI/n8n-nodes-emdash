import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRedirectGet404Summary = {
	resource: ['redirect'],
	operation: ['get404Summary'],
};

export const redirectGet404SummaryDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		displayOptions: {
			show: showOnlyForRedirectGet404Summary,
		},
		description: 'Max number of results to return',
		routing: {
			request: {
				qs: {
					limit: '={{$value}}',
				},
			},
		},
	},
];
