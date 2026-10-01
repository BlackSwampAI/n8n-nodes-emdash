import type { INodeProperties, INodeTypeDescription } from 'n8n-workflow';
import { describe, expect, it } from 'vitest';
import { Emdash } from '../nodes/EmDash/Emdash.node';
import { EmdashTrigger } from '../nodes/EmDash/EmdashTrigger.node';
import { EmdashWebhookTrigger } from '../nodes/EmDash/EmdashWebhookTrigger.node';
import {
	eventActionValues,
	generatePickerEntries,
	normalizedTriggerName,
	pickerNodeLabel,
	visibleNodeTypes,
} from './fixtures/n8n-picker-2.30.6';

const operationCount = (properties: INodeProperties[]) =>
	properties
		.filter((property) => property.name === 'operation')
		.reduce((count, property) => count + (property.options?.length ?? 0), 0);

describe('n8n 2.30.6 picker separation', () => {
	const action = new Emdash();
	const legacyTrigger = new EmdashTrigger();
	const webhookTrigger = new EmdashWebhookTrigger();

	it('keeps the legacy workflow identifier loadable but out of new-node discovery', () => {
		expect(legacyTrigger.description.name).toBe('emdashTrigger');
		expect(legacyTrigger.description.hidden).toBe(true);
		expect(
			visibleNodeTypes([action.description, legacyTrigger.description, webhookTrigger.description]),
		).toEqual([action.description, webhookTrigger.description]);
	});

	it('prevents trigger normalization from merging the visible webhook trigger into the action app', () => {
		expect(action.description.name).toBe('emdash');
		expect(normalizedTriggerName(legacyTrigger.description)).toBe('emdash');
		expect(normalizedTriggerName(webhookTrigger.description)).toBe('emdashWebhook');
		expect(normalizedTriggerName(webhookTrigger.description)).not.toBe(action.description.name);
	});

	it('reproduces the historical collapse and description overwrite', () => {
		const historicalTrigger: INodeTypeDescription = {
			...legacyTrigger.description,
		};
		delete historicalTrigger.hidden;
		const entries = generatePickerEntries([action.description, historicalTrigger]);

		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({
			name: 'emdash',
			description: historicalTrigger.description,
		});
		expect(entries[0]?.selections).toHaveLength(108);
		expect(entries[0]?.selections.slice(0, 103)).toSatisfy((selections: unknown[]) =>
			selections.every(
				(selection) =>
					(selection as { targetNodeName: string }).targetNodeName === action.description.name,
			),
		);
		expect(entries[0]?.selections.slice(103)).toEqual(
			eventActionValues(historicalTrigger).map((event) => ({
				targetNodeName: 'emdashTrigger',
				values: { events: [event] },
			})),
		);
	});

	it('generates two fixed entries with distinct descriptions and selection targets', () => {
		const entries = generatePickerEntries([
			action.description,
			legacyTrigger.description,
			webhookTrigger.description,
		]);

		expect(entries.map((entry) => entry.name)).toEqual(['emdash', 'emdashWebhookTrigger']);
		expect(entries[0]).toMatchObject({
			description: action.description.description,
		});
		expect(entries[0]?.selections).toHaveLength(103);
		expect(entries[0]?.selections).toSatisfy((selections: unknown[]) =>
			selections.every(
				(selection) =>
					(selection as { targetNodeName: string }).targetNodeName === action.description.name,
			),
		);
		expect(entries[1]).toMatchObject({
			description: webhookTrigger.description.description,
			selections: eventActionValues(webhookTrigger.description).map((event) => ({
				targetNodeName: 'emdashWebhookTrigger',
				values: { events: [event] },
			})),
		});
	});

	it('presents separate EmDash and EmDash Webhook picker labels with separate actions and events', () => {
		const actionOperations = operationCount(action.description.properties);
		const triggerEvents = eventActionValues(webhookTrigger.description);

		expect(actionOperations).toBe(103);
		expect(triggerEvents).toEqual([
			'*',
			'content:create',
			'content:delete',
			'content:update',
			'media:upload',
		]);
		expect(pickerNodeLabel(action.description, actionOperations)).toBe('EmDash');
		expect(pickerNodeLabel(webhookTrigger.description, triggerEvents.length)).toBe(
			'EmDash Webhook',
		);
	});

	it('uses the new identifier while preserving the approved trigger canvas name', () => {
		expect(webhookTrigger.description.name).toBe('emdashWebhookTrigger');
		expect(webhookTrigger.description.displayName).toBe('EmDash Webhook Trigger');
		expect(webhookTrigger.description.defaults.name).toBe('EmDash Trigger');
		expect(webhookTrigger.description.hidden).toBeUndefined();
		expect(Object.prototype.hasOwnProperty.call(webhookTrigger.description, 'hidden')).toBe(false);
	});
});
