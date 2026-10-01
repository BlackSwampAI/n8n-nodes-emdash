/* eslint-disable @n8n/community-nodes/no-hardcoded-secrets */
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { readFile } from 'node:fs/promises';
import { NodeConnectionTypes, type IDataObject, type IWebhookFunctions } from 'n8n-workflow';
import { describe, expect, it, vi } from 'vitest';
import { EmDashWebhook } from '../credentials/EmDashWebhook.credentials';
import { EmdashTrigger, EmDashTrigger } from '../nodes/EmDash/EmdashTrigger.node';
import {
	EmdashWebhookTrigger,
	EmDashWebhookTrigger,
} from '../nodes/EmDash/EmdashWebhookTrigger.node';

const readJson = async (path: string) =>
	JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));

function createMockWebhookContext(options: {
	credentials?: { secretToken?: string };
	headers?: Record<string, string>;
	body?: unknown;
	parameters?: Record<string, unknown>;
}) {
	let statusCode = 200;
	let responseJson: unknown = null;
	let responseEnded = false;

	const mockResponse = {
		status(code: number) {
			statusCode = code;
			return mockResponse;
		},
		json(data: unknown) {
			responseJson = data;
			return mockResponse;
		},
		end() {
			responseEnded = true;
			return mockResponse;
		},
	};

	const context = {
		getResponseObject: () => mockResponse,
		getCredentials: vi.fn().mockImplementation(async (type: string) => {
			if (type === 'emdashWebhook') {
				return options.credentials ?? { secretToken: 'valid-secret-token-123' };
			}
			return {};
		}),
		getHeaderData: vi.fn().mockReturnValue(options.headers ?? {}),
		getBodyData: vi.fn().mockReturnValue(options.body as IDataObject),
		getNodeParameter: vi.fn().mockImplementation((name: string, fallback?: unknown) => {
			if (options.parameters && name in options.parameters) {
				return options.parameters[name];
			}
			return fallback;
		}),
		helpers: {
			returnJsonArray: (data: IDataObject | IDataObject[]) => {
				const arr = Array.isArray(data) ? data : [data];
				return arr.map((item) => ({ json: item }));
			},
		},
	};

	return {
		context: context as unknown as IWebhookFunctions,
		getResponse: () => ({ statusCode, responseJson, responseEnded }),
	};
}

const validContentPayload = {
	event: 'content:create',
	timestamp: '2026-09-28T20:00:00.000Z',
	collection: 'posts',
	resourceId: 'post_123',
	resourceType: 'content',
	data: { title: 'Hello World', slug: 'hello-world' },
	metadata: { userId: 'usr_abc' },
};

const validMediaPayload = {
	event: 'media:upload',
	timestamp: '2026-09-28T20:01:00.000Z',
	resourceId: 'media_789',
	resourceType: 'media',
	data: { filename: 'header.png', mimeType: 'image/png' },
};

describe('EmDash Trigger packaging & loader requirements', () => {
	it('exports EmdashTrigger and EmDashTrigger alias', () => {
		expect(EmdashTrigger).toBeDefined();
		expect(EmDashTrigger).toBe(EmdashTrigger);
		const instance = new EmdashTrigger();
		expect(instance.description.name).toBe('emdashTrigger');
		expect(instance.description.displayName).toBe('EmDash Trigger');
		expect(instance.description.group).toEqual(['trigger']);
		expect(instance.description.hidden).toBe(true);
		expect(instance.description.version).toBe(1);
		expect(instance.description.inputs).toEqual([]);
		expect(instance.description.outputs).toEqual([NodeConnectionTypes.Main]);
		expect(instance.description.credentials).toEqual([{ name: 'emdashWebhook', required: true }]);
		expect(instance.description.webhooks).toEqual([
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		]);
	});

	it('exposes a visible picker registration with the legacy runtime behavior', () => {
		expect(EmDashWebhookTrigger).toBe(EmdashWebhookTrigger);
		const legacy = new EmdashTrigger();
		const visible = new EmdashWebhookTrigger();
		expect(visible.description).toMatchObject({
			name: 'emdashWebhookTrigger',
			displayName: 'EmDash Webhook Trigger',
			defaults: { name: 'EmDash Trigger' },
		});
		expect(visible.description.hidden).toBeUndefined();
		expect(visible.description.credentials).toEqual(legacy.description.credentials);
		expect(visible.description.webhooks).toEqual(legacy.description.webhooks);
		expect(visible.description.properties).toEqual(legacy.description.properties);
		expect(Object.keys(visible.webhookMethods.default)).toEqual(
			Object.keys(legacy.webhookMethods.default),
		);
		for (const method of ['checkExists', 'create', 'delete'] as const) {
			expect(visible.webhookMethods.default[method].toString()).toBe(
				legacy.webhookMethods.default[method].toString(),
			);
		}
		expect(visible.webhook).toBe(legacy.webhook);
	});

	it('configures EmDashWebhook credential type correctly', () => {
		const credential = new EmDashWebhook();
		expect(credential.name).toBe('emdashWebhook');
		expect(credential.displayName).toBe('EmDash Webhook');
		expect(credential.documentationUrl).toBe('https://github.com/emdash-cms/emdash#readme');
		const secretProp = credential.properties.find((p) => p.name === 'secretToken');
		expect(secretProp).toBeDefined();
		expect(secretProp?.type).toBe('string');
		expect(secretProp?.typeOptions?.password).toBe(true);
		expect(secretProp?.required).toBe(true);
		expect((credential as { authenticate?: unknown }).authenticate).toBeUndefined();
		expect((credential as { test?: unknown }).test).toBeUndefined();
	});

	it('registers trigger node and credential in package.json', async () => {
		const packageJson = (await readJson('package.json')) as {
			n8n: { nodes: string[]; credentials: string[] };
		};
		expect(packageJson.n8n.nodes).toContain('dist/nodes/EmDash/EmdashTrigger.node.js');
		expect(packageJson.n8n.nodes).toContain('dist/nodes/EmDash/EmdashWebhookTrigger.node.js');
		expect(packageJson.n8n.credentials).toContain('dist/credentials/EmDashWebhook.credentials.js');
	});

	it('matches EmdashWebhookTrigger.node.json manifest requirements', async () => {
		const manifest = (await readJson('nodes/EmDash/EmdashWebhookTrigger.node.json')) as {
			node: string;
			nodeVersion: string;
			codexVersion: string;
			categories: string[];
		};
		expect(manifest.node).toBe('@blackswampai/n8n-nodes-emdash.emdashWebhookTrigger');
		expect(manifest.nodeVersion).toBe('1.0');
		expect(manifest.codexVersion).toBe('1.0');
		expect(manifest.categories).toEqual(['Marketing & Content']);
	});

	it('matches EmdashTrigger.node.json manifest requirements', async () => {
		const manifest = (await readJson('nodes/EmDash/EmdashTrigger.node.json')) as {
			node: string;
			nodeVersion: string;
			codexVersion: string;
			categories: string[];
			resources: {
				credentialDocumentation: { url: string }[];
				primaryDocumentation: { url: string }[];
			};
		};
		expect(manifest.node).toBe('@blackswampai/n8n-nodes-emdash.emdashTrigger');
		expect(manifest.nodeVersion).toBe('1.0');
		expect(manifest.codexVersion).toBe('1.0');
		expect(manifest.categories).toEqual(['Marketing & Content']);
		expect(manifest.resources.credentialDocumentation[0].url).toBe(
			'https://github.com/emdash-cms/emdash#readme',
		);
		expect(manifest.resources.primaryDocumentation[0].url).toBe(
			'https://blackswampai.com/n8n-nodes/emdash/',
		);
	});

	it('includes setup notice, events, and collectionFilter properties', () => {
		const node = new EmdashTrigger();
		const properties = node.description.properties;

		const notice = properties.find((p) => p.name === 'setupNotice');
		expect(notice).toBeDefined();
		expect(notice?.type).toBe('notice');
		expect(notice?.displayName).toContain('@emdash-cms/plugin-webhook-notifier');
		expect(notice?.displayName).toContain('Secret Token');

		const events = properties.find((p) => p.name === 'events');
		expect(events).toBeDefined();
		expect(events?.type).toBe('multiOptions');
		expect(events?.required).toBe(true);
		expect(events?.default).toEqual(['*']);
		const options = events?.options as Array<{ name: string; value: string }>;
		expect(options.map((o) => o.value)).toEqual([
			'*',
			'content:create',
			'content:delete',
			'content:update',
			'media:upload',
		]);

		const collectionFilter = properties.find((p) => p.name === 'collectionFilter');
		expect(collectionFilter).toBeDefined();
		expect(collectionFilter?.type).toBe('string');
		expect(collectionFilter?.default).toBe('');
	});
});

describe('EmDash Trigger authentication verification', () => {
	const trigger = new EmdashTrigger();

	it('succeeds with valid Bearer secret token', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: { secretToken: 'super-secret-token' },
			headers: { authorization: 'Bearer super-secret-token' },
			body: validContentPayload,
		});

		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBeUndefined();
		expect(result.workflowData).toBeDefined();
		expect(getResponse().statusCode).toBe(200);
	});

	it('rejects missing Authorization header with 401', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: { secretToken: 'super-secret-token' },
			headers: {},
			body: validContentPayload,
		});

		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBe(true);
		expect(getResponse().statusCode).toBe(401);
		expect(getResponse().responseJson).toEqual({ error: 'Missing Authorization header' });
	});

	it('rejects wrong auth scheme with 401', async () => {
		for (const invalidAuth of [
			'Basic dXNlcjpwYXNz',
			'Token super-secret-token',
			'super-secret-token',
			'bearer super-secret-token',
		]) {
			const { context, getResponse } = createMockWebhookContext({
				credentials: { secretToken: 'super-secret-token' },
				headers: { authorization: invalidAuth },
				body: validContentPayload,
			});

			const result = await trigger.webhook.call(context);
			expect(result.noWebhookResponse).toBe(true);
			expect(getResponse().statusCode).toBe(401);
			expect(getResponse().responseJson).toEqual({ error: 'Invalid authorization scheme' });
		}
	});

	it('rejects empty token with 401', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: { secretToken: 'super-secret-token' },
			headers: { authorization: 'Bearer   ' },
			body: validContentPayload,
		});

		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBe(true);
		expect(getResponse().statusCode).toBe(401);
		expect(getResponse().responseJson).toEqual({ error: 'Empty authorization token' });
	});

	it('rejects wrong secret token with 401 timing-safely', async () => {
		// Test wrong token of differing length
		const { context: contextDiff, getResponse: getRespDiff } = createMockWebhookContext({
			credentials: { secretToken: 'super-secret-token' },
			headers: { authorization: 'Bearer wrong' },
			body: validContentPayload,
		});

		const resultDiff = await trigger.webhook.call(contextDiff);
		expect(resultDiff.noWebhookResponse).toBe(true);
		expect(getRespDiff().statusCode).toBe(401);
		expect(getRespDiff().responseJson).toEqual({ error: 'Invalid secret token' });

		// Test wrong token of identical length
		const { context: contextSame, getResponse: getRespSame } = createMockWebhookContext({
			credentials: { secretToken: 'super-secret-token' },
			headers: { authorization: 'Bearer super-secret-tokex' },
			body: validContentPayload,
		});

		const resultSame = await trigger.webhook.call(contextSame);
		expect(resultSame.noWebhookResponse).toBe(true);
		expect(getRespSame().statusCode).toBe(401);
		expect(getRespSame().responseJson).toEqual({ error: 'Invalid secret token' });
	});

	it('rejects unconfigured secret token in credential with 401', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: { secretToken: '' },
			headers: { authorization: 'Bearer super-secret-token' },
			body: validContentPayload,
		});

		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBe(true);
		expect(getResponse().statusCode).toBe(401);
		expect(getResponse().responseJson).toEqual({ error: 'Webhook secret token not configured' });
	});

	it('never leaks secret token in response or output data', async () => {
		const secret = 'my-ultra-private-secret-token-xyz';
		const { context, getResponse } = createMockWebhookContext({
			credentials: { secretToken: secret },
			headers: { authorization: 'Bearer wrong-secret' },
			body: validContentPayload,
		});

		await trigger.webhook.call(context);
		const serialized = JSON.stringify(getResponse().responseJson);
		expect(serialized).not.toContain(secret);
		expect(serialized).not.toContain('wrong-secret');
	});
});

describe('EmDash Trigger payload validation', () => {
	const trigger = new EmdashTrigger();
	const baseHeaders = { authorization: 'Bearer test-secret' };
	const baseCreds = { secretToken: 'test-secret' };

	it('accepts valid content:create, content:update, content:delete, media:upload', async () => {
		for (const event of ['content:create', 'content:update', 'content:delete']) {
			const { context, getResponse } = createMockWebhookContext({
				credentials: baseCreds,
				headers: baseHeaders,
				body: { ...validContentPayload, event },
			});
			const result = await trigger.webhook.call(context);
			expect(result.workflowData).toBeDefined();
			expect(getResponse().statusCode).toBe(200);
		}

		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: validMediaPayload,
		});
		const result = await trigger.webhook.call(context);
		expect(result.workflowData).toBeDefined();
		expect(getResponse().statusCode).toBe(200);
	});

	it('accepts payloads with optional data present or absent', async () => {
		// with data
		const { context: ctxWithData } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: { ...validContentPayload, data: { foo: 'bar' } },
		});
		const resWithData = await trigger.webhook.call(ctxWithData);
		expect(resWithData.workflowData).toBeDefined();

		// without data
		const withoutData = { ...validContentPayload };
		delete (withoutData as { data?: unknown }).data;
		const { context: ctxWithoutData } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: withoutData,
		});
		const resWithoutData = await trigger.webhook.call(ctxWithoutData);
		expect(resWithoutData.workflowData).toBeDefined();
	});

	it('rejects missing or non-object body with 400', async () => {
		for (const invalidBody of [null, undefined, 'not-an-object', [1, 2, 3]]) {
			const { context, getResponse } = createMockWebhookContext({
				credentials: baseCreds,
				headers: baseHeaders,
				body: invalidBody,
			});
			const result = await trigger.webhook.call(context);
			expect(result.noWebhookResponse).toBe(true);
			expect(getResponse().statusCode).toBe(400);
		}
	});

	it('rejects missing required envelope fields with 400', async () => {
		for (const field of ['event', 'timestamp', 'resourceId', 'resourceType']) {
			const invalid = { ...validContentPayload };
			delete (invalid as Record<string, unknown>)[field];
			const { context, getResponse } = createMockWebhookContext({
				credentials: baseCreds,
				headers: baseHeaders,
				body: invalid,
			});
			const result = await trigger.webhook.call(context);
			expect(result.noWebhookResponse).toBe(true);
			expect(getResponse().statusCode).toBe(400);
			expect(getResponse().responseJson).toEqual({ error: 'Missing required payload fields' });
		}
	});

	it('rejects unsupported event with 400', async () => {
		for (const badEvent of ['content:publish', 'media:delete', 'post:created', 'custom']) {
			const { context, getResponse } = createMockWebhookContext({
				credentials: baseCreds,
				headers: baseHeaders,
				body: { ...validContentPayload, event: badEvent },
			});
			const result = await trigger.webhook.call(context);
			expect(result.noWebhookResponse).toBe(true);
			expect(getResponse().statusCode).toBe(400);
			expect(getResponse().responseJson).toEqual({ error: `Unsupported event: ${badEvent}` });
		}
	});

	it('rejects invalid resourceType for content events with 400', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: { ...validContentPayload, resourceType: 'media' },
		});
		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBe(true);
		expect(getResponse().statusCode).toBe(400);
		expect(getResponse().responseJson).toEqual({
			error: 'Resource type must be "content" for event "content:create"',
		});
	});

	it('rejects content events missing collection with 400', async () => {
		for (const badCollection of [undefined, '', '   ', 123]) {
			const invalid = { ...validContentPayload, collection: badCollection };
			const { context, getResponse } = createMockWebhookContext({
				credentials: baseCreds,
				headers: baseHeaders,
				body: invalid,
			});
			const result = await trigger.webhook.call(context);
			expect(result.noWebhookResponse).toBe(true);
			expect(getResponse().statusCode).toBe(400);
			expect(getResponse().responseJson).toEqual({
				error: 'Collection is required for content events',
			});
		}
	});

	it('rejects media:upload with invalid resourceType with 400', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: { ...validMediaPayload, resourceType: 'content' },
		});
		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBe(true);
		expect(getResponse().statusCode).toBe(400);
		expect(getResponse().responseJson).toEqual({
			error: 'Resource type must be "media" for media:upload event',
		});
	});

	it('verifies X-EmDash-Event header matches payload event when present', async () => {
		// Matching header succeeds
		const { context: ctxMatch, getResponse: respMatch } = createMockWebhookContext({
			credentials: baseCreds,
			headers: { ...baseHeaders, 'x-emdash-event': 'content:create' },
			body: validContentPayload,
		});
		const resMatch = await trigger.webhook.call(ctxMatch);
		expect(resMatch.workflowData).toBeDefined();
		expect(respMatch().statusCode).toBe(200);

		// Mismatched header returns 400
		const { context: ctxMismatch, getResponse: respMismatch } = createMockWebhookContext({
			credentials: baseCreds,
			headers: { ...baseHeaders, 'x-emdash-event': 'content:update' },
			body: validContentPayload,
		});
		const resMismatch = await trigger.webhook.call(ctxMismatch);
		expect(resMismatch.noWebhookResponse).toBe(true);
		expect(respMismatch().statusCode).toBe(400);
		expect(respMismatch().responseJson).toEqual({
			error: 'X-EmDash-Event header does not match payload event',
		});
	});
});

describe('EmDash Trigger event filtering', () => {
	const trigger = new EmdashTrigger();
	const baseHeaders = { authorization: 'Bearer test-secret' };
	const baseCreds = { secretToken: 'test-secret' };

	it('triggers on all 4 events when events includes wildcard *', async () => {
		for (const event of ['content:create', 'content:update', 'content:delete']) {
			const { context } = createMockWebhookContext({
				credentials: baseCreds,
				headers: baseHeaders,
				body: { ...validContentPayload, event },
				parameters: { events: ['*'] },
			});
			const result = await trigger.webhook.call(context);
			expect(result.workflowData).toBeDefined();
		}

		const { context: mediaCtx } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: validMediaPayload,
			parameters: { events: ['*'] },
		});
		const mediaResult = await trigger.webhook.call(mediaCtx);
		expect(mediaResult.workflowData).toBeDefined();
	});

	it('executes workflow when incoming event is in selected events list', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: validContentPayload,
			parameters: { events: ['content:create', 'content:update'] },
		});
		const result = await trigger.webhook.call(context);
		expect(result.workflowData).toBeDefined();
		expect(getResponse().statusCode).toBe(200);
	});

	it('returns 200 without executing workflow when event is not in selected list', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: validContentPayload,
			parameters: { events: ['media:upload'] },
		});
		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBe(true);
		expect(result.workflowData).toBeUndefined();
		expect(getResponse().statusCode).toBe(200);
		expect(getResponse().responseJson).toEqual({ message: 'Event ignored by filter' });
	});
});

describe('EmDash Trigger collection filtering', () => {
	const trigger = new EmdashTrigger();
	const baseHeaders = { authorization: 'Bearer test-secret' };
	const baseCreds = { secretToken: 'test-secret' };

	it('executes when collection matches filter', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: { ...validContentPayload, collection: 'posts' },
			parameters: { collectionFilter: 'posts, pages' },
		});
		const result = await trigger.webhook.call(context);
		expect(result.workflowData).toBeDefined();
		expect(getResponse().statusCode).toBe(200);
	});

	it('returns 200 without executing workflow when collection does not match filter', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: { ...validContentPayload, collection: 'articles' },
			parameters: { collectionFilter: 'posts, pages' },
		});
		const result = await trigger.webhook.call(context);
		expect(result.noWebhookResponse).toBe(true);
		expect(result.workflowData).toBeUndefined();
		expect(getResponse().statusCode).toBe(200);
		expect(getResponse().responseJson).toEqual({ message: 'Collection ignored by filter' });
	});

	it('handles whitespace in collection filter', async () => {
		const { context } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: { ...validContentPayload, collection: 'pages' },
			parameters: { collectionFilter: '  posts  ,   pages   ' },
		});
		const result = await trigger.webhook.call(context);
		expect(result.workflowData).toBeDefined();
	});

	it('matches all collections when collection filter is blank', async () => {
		for (const col of ['posts', 'pages', 'custom_col', 'news']) {
			const { context } = createMockWebhookContext({
				credentials: baseCreds,
				headers: baseHeaders,
				body: { ...validContentPayload, collection: col },
				parameters: { collectionFilter: '' },
			});
			const result = await trigger.webhook.call(context);
			expect(result.workflowData).toBeDefined();
		}
	});

	it('does not filter media:upload events by collection filter', async () => {
		const { context, getResponse } = createMockWebhookContext({
			credentials: baseCreds,
			headers: baseHeaders,
			body: validMediaPayload,
			parameters: { collectionFilter: 'posts, pages' },
		});
		const result = await trigger.webhook.call(context);
		expect(result.workflowData).toBeDefined();
		expect(getResponse().statusCode).toBe(200);
	});
});

describe('EmDash Trigger output shape', () => {
	const trigger = new EmdashTrigger();

	it('returns unnested payload matching upstream contract', async () => {
		const payload = {
			event: 'content:create',
			timestamp: '2026-09-28T21:00:00.000Z',
			collection: 'blogs',
			resourceId: 'blog_999',
			resourceType: 'content',
			data: { title: 'First Post', content: 'Lorem ipsum' },
			metadata: { author: 'Admin' },
		};

		const { context } = createMockWebhookContext({
			credentials: { secretToken: 'valid-secret-token' },
			headers: { authorization: 'Bearer valid-secret-token' },
			body: payload,
		});

		const result = await trigger.webhook.call(context);
		expect(result.workflowData).toBeDefined();
		const items = result.workflowData![0];
		expect(items).toHaveLength(1);
		expect(items[0].json).toEqual(payload);
		expect(items[0].json.event).toBe('content:create');
		expect(items[0].json.collection).toBe('blogs');
		expect(items[0].json.resourceId).toBe('blog_999');
		expect(items[0].json.resourceType).toBe('content');
		expect(items[0].json.data).toEqual({ title: 'First Post', content: 'Lorem ipsum' });
		expect(items[0].json.metadata).toEqual({ author: 'Admin' });

		// Verify zero credential leakage
		const serializedOutput = JSON.stringify(items[0].json);
		expect(serializedOutput).not.toContain('valid-secret-token');
		expect(serializedOutput).not.toContain('authorization');
	});
});
