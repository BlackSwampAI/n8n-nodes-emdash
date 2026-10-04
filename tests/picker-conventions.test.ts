import { describe, expect, it } from 'vitest';
import { Emdash } from '../nodes/EmDash/Emdash.node';

describe('EmDash action-only node contract', () => {
	const action = new Emdash();

	it('exposes exactly one action node and the 103 REST action choices', () => {
		expect(action.description).toMatchObject({
			name: 'emdash',
			displayName: 'EmDash',
			group: ['transform'],
			defaults: { name: 'EmDash' },
		});
		expect(action.description.group).not.toContain('trigger');
		expect(action.description.webhooks).toBeUndefined();
		expect(action.description.properties.some((property) => property.name === 'events')).toBe(
			false,
		);
		const operations = action.description.properties.filter(
			(property) => property.name === 'operation',
		);
		const totalChoices = operations.reduce(
			(total, property) => total + (property.options?.length ?? 0),
			0,
		);
		expect(operations).toHaveLength(11);
		expect(totalChoices).toBe(103);
	});

	it('uses action-only wording and the sole API credential', () => {
		expect(action.description.description).toBe('Manage EmDash content, media, and site settings');
		expect(action.description.credentials).toEqual([{ name: 'emdashApi', required: true }]);
	});
});
