import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContentDiscardDraft = {
	resource: ['content'],
	operation: ['discardDraft'],
};

export const contentDiscardDraftDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'discardDraftOptions',
		type: 'collection',
		typeOptions: {
			multipleValueButtonText: 'Add Option',
		},
		displayOptions: {
			show: showOnlyForContentDiscardDraft,
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
				description: 'Whether to discard draft even if another editor holds the edit lock',
				routing: {
					send: {
						type: 'body',
						property: 'overrideLock',
					},
				},
			},
		],
	},
];
