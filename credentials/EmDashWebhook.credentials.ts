import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export type IEmDashWebhookCredentialType = ICredentialType;

export class EmDashWebhook implements IEmDashWebhookCredentialType {
	name = 'emdashWebhook';

	displayName = 'EmDash Webhook';

	icon: Icon = { light: 'file:../icons/emdash.svg', dark: 'file:../icons/emdash.dark.svg' };

	documentationUrl = 'https://github.com/emdash-cms/emdash#readme';

	properties: INodeProperties[] = [
		{
			displayName: 'Secret Token',
			name: 'secretToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Shared secret token configured in EmDash Webhook Notifier settings',
		},
	];
}
