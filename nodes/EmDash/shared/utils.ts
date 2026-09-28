export function normalizeBaseUrl(siteUrl: string): string {
	const trimmed = siteUrl.trim().replace(/\/+$/, '');
	if (trimmed.endsWith('/_emdash/api')) {
		return trimmed;
	}
	return `${trimmed}/_emdash/api`;
}

export function parseJsonParameter<T = Record<string, unknown>>(
	value: unknown,
	fallback: T = {} as T,
): T {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return fallback;
		try {
			return JSON.parse(trimmed) as T;
		} catch {
			return fallback;
		}
	}
	if (typeof value === 'object' && value !== null) {
		return value as T;
	}
	return fallback;
}

export function parseStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}
	if (typeof value === 'string') {
		return value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return [];
}
