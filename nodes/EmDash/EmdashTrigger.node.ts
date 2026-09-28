import { createHash, timingSafeEqual } from 'node:crypto';
import {
	NodeConnectionTypes,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';
import { parseStringList } from './shared/utils';

const CREDENTIAL_NAME = 'emdashWebhook';

export class EmdashTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EmDash Trigger',
		name: 'emdashTrigger',
		icon: { light: 'file:../../icons/emdash.svg', dark: 'file:../../icons/emdash.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when EmDash content or media events occur',
		defaults: {
			name: 'EmDash Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: CREDENTIAL_NAME,
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'EmDash Webhook Setup Instructions:\n1. Install @emdash-cms/plugin-webhook-notifier in your EmDash instance.\n2. In n8n, create an EmDash Webhook credential and configure a Secret Token.\n3. In EmDash Webhook Notifier settings, enter the n8n Webhook URL and Secret Token.\n4. Note: EmDash stores one webhook URL per site. Use branching/Switch nodes in n8n to handle multiple actions.\n5. When testing in the canvas, use the Test URL; remember to switch to the Production URL once the workflow is activated.',
				name: 'setupNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['*'],
				description: 'The events that trigger this workflow',
				options: [
					{
						name: 'All Events',
						value: '*',
					},
					{
						name: 'Content Created',
						value: 'content:create',
					},
					{
						name: 'Content Deleted',
						value: 'content:delete',
					},
					{
						name: 'Content Updated',
						value: 'content:update',
					},
					{
						name: 'Media Uploaded',
						value: 'media:upload',
					},
				],
			},
			{
				displayName: 'Collection Filter',
				name: 'collectionFilter',
				type: 'string',
				default: '',
				placeholder: 'posts, pages',
				description:
					'Comma-separated list of collection slugs to trigger on. Leave blank to process all collections. Applies only to content events.',
			},
		],
	};

	// EmDash does not expose a supported public REST API for programmatic webhook registration.
	// Users configure the webhook URL and Secret Token manually in the EmDash Webhook Notifier settings.
	// These static lifecycle hooks satisfy n8n community node scanner requirements without making remote calls.
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const res = this.getResponseObject();
		const credentials = await this.getCredentials<{ secretToken?: string }>('emdashWebhook');
		const secretToken = credentials?.secretToken;

		if (!secretToken || typeof secretToken !== 'string' || secretToken.trim() === '') {
			res.status(401).json({ error: 'Webhook secret token not configured' }).end();
			return { noWebhookResponse: true };
		}

		const headers = this.getHeaderData();
		const authHeader = (headers['authorization'] ?? headers['Authorization']) as string | undefined;

		if (!authHeader || typeof authHeader !== 'string') {
			res.status(401).json({ error: 'Missing Authorization header' }).end();
			return { noWebhookResponse: true };
		}

		if (!authHeader.startsWith('Bearer ')) {
			res.status(401).json({ error: 'Invalid authorization scheme' }).end();
			return { noWebhookResponse: true };
		}

		const providedToken = authHeader.slice(7).trim();
		if (!providedToken) {
			res.status(401).json({ error: 'Empty authorization token' }).end();
			return { noWebhookResponse: true };
		}

		const expectedHash = createHash('sha256').update(secretToken).digest();
		const providedHash = createHash('sha256').update(providedToken).digest();

		if (!timingSafeEqual(expectedHash, providedHash)) {
			res.status(401).json({ error: 'Invalid secret token' }).end();
			return { noWebhookResponse: true };
		}

		const body = this.getBodyData();
		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			res.status(400).json({ error: 'Invalid payload: body must be an object' }).end();
			return { noWebhookResponse: true };
		}

		const { event, timestamp, resourceId, resourceType, collection } = body as Record<
			string,
			unknown
		>;

		if (
			typeof event !== 'string' ||
			typeof timestamp !== 'string' ||
			typeof resourceId !== 'string' ||
			typeof resourceType !== 'string'
		) {
			res.status(400).json({ error: 'Missing required payload fields' }).end();
			return { noWebhookResponse: true };
		}

		const validEvents = ['content:create', 'content:update', 'content:delete', 'media:upload'];
		if (!validEvents.includes(event)) {
			res
				.status(400)
				.json({ error: `Unsupported event: ${event}` })
				.end();
			return { noWebhookResponse: true };
		}

		if (event.startsWith('content:')) {
			if (resourceType !== 'content') {
				res
					.status(400)
					.json({ error: `Resource type must be "content" for event "${event}"` })
					.end();
				return { noWebhookResponse: true };
			}
			if (typeof collection !== 'string' || collection.trim() === '') {
				res.status(400).json({ error: 'Collection is required for content events' }).end();
				return { noWebhookResponse: true };
			}
		}

		if (event === 'media:upload') {
			if (resourceType !== 'media') {
				res
					.status(400)
					.json({ error: 'Resource type must be "media" for media:upload event' })
					.end();
				return { noWebhookResponse: true };
			}
		}

		const headerEvent = (headers['x-emdash-event'] ?? headers['X-EmDash-Event']) as
			| string
			| undefined;
		if (headerEvent !== undefined && headerEvent !== event) {
			res.status(400).json({ error: 'X-EmDash-Event header does not match payload event' }).end();
			return { noWebhookResponse: true };
		}

		const configuredEvents = (this.getNodeParameter('events', ['*']) as string[]) ?? ['*'];
		if (!configuredEvents.includes('*') && !configuredEvents.includes(event)) {
			res.status(200).json({ message: 'Event ignored by filter' }).end();
			return { noWebhookResponse: true };
		}

		if (event.startsWith('content:')) {
			const collectionFilterParam = this.getNodeParameter('collectionFilter', '') as string;
			const allowedCollections = parseStringList(collectionFilterParam);
			const targetCollection = (collection as string).trim();
			if (allowedCollections.length > 0 && !allowedCollections.includes(targetCollection)) {
				res.status(200).json({ message: 'Collection ignored by filter' }).end();
				return { noWebhookResponse: true };
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray([body])],
		};
	}
}

export { EmdashTrigger as EmDashTrigger };
