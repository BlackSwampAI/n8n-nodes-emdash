import { describe, expect, it } from 'vitest';
import { Emdash } from '../nodes/EmDash/Emdash.node';
import { EmdashTrigger } from '../nodes/EmDash/EmdashTrigger.node';
import { generateServiceGroups, visibleNodeTypes } from './fixtures/n8n-picker-2.30.6';

describe('n8n 2.30.6 paired action and trigger picker conventions', () => {
	const action = new Emdash();
	const trigger = new EmdashTrigger();

	it('keeps both original node types visible with node-specific canvas names', () => {
		expect(visibleNodeTypes([action.description, trigger.description])).toEqual([
			action.description,
			trigger.description,
		]);
		expect(action.description).toMatchObject({
			name: 'emdash',
			displayName: 'EmDash',
			defaults: { name: 'EmDash' },
		});
		expect(trigger.description).toMatchObject({
			name: 'emdashTrigger',
			displayName: 'EmDash Trigger',
			defaults: { name: 'EmDash Trigger' },
		});
	});

	it('groups 103 actions and 5 trigger choices under one EmDash service', () => {
		const groups = generateServiceGroups([action.description, trigger.description]);
		expect(groups).toHaveLength(1);
		expect(groups[0]).toMatchObject({
			name: 'emdash',
			description: 'Work with EmDash content, media, and events',
		});
		expect(groups[0]?.selections).toHaveLength(108);
		expect(
			groups[0]?.selections.filter((selection) => selection.category === 'Actions'),
		).toHaveLength(103);
		expect(
			groups[0]?.selections.filter((selection) => selection.category === 'Triggers'),
		).toHaveLength(5);
	});

	it('preserves action resource/operation values and original action target', () => {
		const [group] = generateServiceGroups([action.description, trigger.description]);
		const selections = group?.selections.filter((selection) => selection.category === 'Actions');
		expect(selections).toContainEqual({
			category: 'Actions',
			targetNodeName: 'emdash',
			nodeValues: { resource: 'content', operation: 'getAll' },
		});
		expect(selections?.every((selection) => selection.targetNodeName === 'emdash')).toBe(true);
	});

	it('preserves event arrays and the original trigger target', () => {
		const [group] = generateServiceGroups([action.description, trigger.description]);
		const selections = group?.selections.filter((selection) => selection.category === 'Triggers');
		expect(selections).toEqual(
			['*', 'content:create', 'content:delete', 'content:update', 'media:upload'].map((event) => ({
				category: 'Triggers',
				targetNodeName: 'emdashTrigger',
				nodeValues: { events: [event] },
			})),
		);
	});

	it('uses one broad description for both node metadata and the grouped fallback', () => {
		expect(action.description.description).toBe('Work with EmDash content, media, and events');
		expect(trigger.description.description).toBe('Work with EmDash content, media, and events');
	});
});
