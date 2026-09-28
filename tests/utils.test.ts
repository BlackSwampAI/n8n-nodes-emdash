import { describe, expect, it } from 'vitest';
import {
	normalizeBaseUrl,
	parseJsonParameter,
	parseStringList,
} from '../nodes/EmDash/shared/utils';

describe('EmDash shared utils', () => {
	describe('normalizeBaseUrl', () => {
		it('normalizes base URLs by removing trailing slashes and appending /_emdash/api', () => {
			expect(normalizeBaseUrl('https://cms.example.com')).toBe(
				'https://cms.example.com/_emdash/api',
			);
			expect(normalizeBaseUrl('https://cms.example.com/')).toBe(
				'https://cms.example.com/_emdash/api',
			);
			expect(normalizeBaseUrl('  https://cms.example.com///  ')).toBe(
				'https://cms.example.com/_emdash/api',
			);
		});

		it('does not duplicate /_emdash/api if already provided', () => {
			expect(normalizeBaseUrl('https://cms.example.com/_emdash/api')).toBe(
				'https://cms.example.com/_emdash/api',
			);
			expect(normalizeBaseUrl('https://cms.example.com/_emdash/api/')).toBe(
				'https://cms.example.com/_emdash/api',
			);
		});
	});

	describe('parseJsonParameter', () => {
		it('parses valid JSON strings and passes through objects', () => {
			expect(parseJsonParameter('{"key": "value"}')).toEqual({ key: 'value' });
			expect(parseJsonParameter({ existing: true })).toEqual({ existing: true });
			expect(parseJsonParameter('', { default: true })).toEqual({ default: true });
			expect(parseJsonParameter('invalid-json', { fallback: true })).toEqual({
				fallback: true,
			});
		});
	});

	describe('parseStringList', () => {
		it('splits comma-separated strings and trims values', () => {
			expect(parseStringList('tag1, tag2, tag3')).toEqual(['tag1', 'tag2', 'tag3']);
			expect(parseStringList(['a', ' b '])).toEqual(['a', 'b']);
			expect(parseStringList('')).toEqual([]);
		});
	});
});
