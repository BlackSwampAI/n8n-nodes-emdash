import { EmdashTrigger } from './EmdashTrigger.node';

/**
 * Visible picker registration for the EmDash webhook trigger.
 *
 * The legacy `emdashTrigger` registration remains loadable for saved workflows. Extending it keeps
 * the webhook implementation and lifecycle behavior identical across both node type identifiers.
 */
export class EmdashWebhookTrigger extends EmdashTrigger {
	constructor() {
		super();
		const description = {
			...this.description,
			displayName: 'EmDash Webhook Trigger',
			name: 'emdashWebhookTrigger',
			defaults: {
				name: 'EmDash Trigger',
			},
		};
		delete description.hidden;
		this.description = description;
	}
}

export { EmdashWebhookTrigger as EmDashWebhookTrigger };
