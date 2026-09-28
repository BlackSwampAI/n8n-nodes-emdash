import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentPublish = {
	resource: ['content'],
	operation: ['publish'],
};

export const contentPublishDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'publishOptions',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Option',
		},
		displayOptions: {
			show: showOnlyForContentPublish,
		},
		default: {},
		options: [
			{
				displayName: 'Revision (_Rev)',
				name: '_rev',
				type: 'string',
				default: '',
				description: 'Opaque revision token for optimistic concurrency control',
				routing: {
					send: {
						type: 'body',
						property: '_rev',
						value: '={{$value || undefined}}',
					},
				},
			},
			{
				displayName: 'Override Lock',
				name: 'overrideLock',
				type: 'boolean',
				default: false,
				description: 'Whether to publish even if another editor holds the edit lock',
				routing: {
					send: {
						type: 'body',
						property: 'overrideLock',
					},
				},
			},
			{
				displayName: 'Published At',
				name: 'publishedAt',
				type: 'dateTime',
				default: '',
				description: 'Optional ISO 8601 datetime to backdate the publication timestamp',
				routing: {
					send: {
						type: 'body',
						property: 'publishedAt',
						value: '={{$value || undefined}}',
					},
				},
			},
		],
	},
];
