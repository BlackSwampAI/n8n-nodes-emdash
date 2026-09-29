export function validateStructuredContent(
	value: unknown,
	label = 'Content',
): Array<Record<string, unknown>> {
	if (value === null || value === undefined) {
		throw new Error(`${label} is required and must be an array of objects`);
	}

	let rawList: unknown[];
	if (Array.isArray(value)) {
		rawList = value;
	} else if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error(`${label} is required and must be an array of objects`);
		}

		let parsed: unknown;
		let jsonError: string | undefined;
		try {
			parsed = JSON.parse(trimmed);
		} catch (err) {
			jsonError = (err as Error).message;
		}

		if (jsonError) {
			throw new Error(`Invalid JSON for ${label}: ${jsonError}`);
		}

		if (!Array.isArray(parsed)) {
			throw new Error(`${label} JSON expression must evaluate to an array`);
		}
		rawList = parsed;
	} else {
		throw new Error(`${label} must be an array or JSON array string (received ${typeof value})`);
	}

	const validated: Array<Record<string, unknown>> = [];
	for (let i = 0; i < rawList.length; i++) {
		const item = rawList[i];
		if (typeof item !== 'object' || item === null || Array.isArray(item)) {
			const actual = item === null ? 'null' : Array.isArray(item) ? 'array' : typeof item;
			throw new Error(`${label} at index ${i} must be an object (received ${actual})`);
		}
		validated.push(item as Record<string, unknown>);
	}

	return validated;
}

export function validateJsonObject(value: unknown, label = 'Properties'): Record<string, unknown> {
	if (value === null) {
		throw new Error(`${label} must be an object (received null)`);
	}
	if (value === undefined) {
		throw new Error(`${label} must be an object or JSON string (received undefined)`);
	}

	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			throw new Error(`${label} must be an object (received array)`);
		}
		return value as Record<string, unknown>;
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error(`${label} JSON string cannot be empty`);
		}

		let parsed: unknown;
		let jsonError: string | undefined;
		try {
			parsed = JSON.parse(trimmed);
		} catch (err) {
			jsonError = (err as Error).message;
		}

		if (jsonError) {
			throw new Error(`Invalid JSON for ${label}: ${jsonError}`);
		}

		if (parsed === null) {
			throw new Error(`${label} JSON expression must evaluate to an object (received null)`);
		}
		if (Array.isArray(parsed)) {
			throw new Error(`${label} JSON expression must evaluate to an object (received array)`);
		}
		if (typeof parsed !== 'object') {
			throw new Error(
				`${label} JSON expression must evaluate to an object (received ${typeof parsed})`,
			);
		}

		return parsed as Record<string, unknown>;
	}

	throw new Error(`${label} must be an object or JSON string (received ${typeof value})`);
}

export function validateStringArray(value: unknown, label = 'Keywords'): string[] {
	if (value === null || value === undefined) {
		return [];
	}

	let rawList: unknown[];
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			return [];
		}

		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			let parsed: unknown;
			try {
				parsed = JSON.parse(trimmed);
			} catch {
				// fall through to comma-separated
			}
			if (Array.isArray(parsed)) {
				rawList = parsed;
			} else {
				rawList = trimmed.split(',');
			}
		} else {
			rawList = trimmed.split(',');
		}
	} else if (Array.isArray(value)) {
		rawList = value;
	} else {
		throw new Error(
			`${label} must be an array of strings or comma-separated string (received ${typeof value})`,
		);
	}

	const result: string[] = [];
	for (let i = 0; i < rawList.length; i++) {
		const item = rawList[i];
		if (typeof item !== 'string') {
			throw new Error(`${label} at index ${i} must be a string (received ${typeof item})`);
		}
		const trimmed = item.trim();
		if (trimmed) {
			result.push(trimmed);
		}
	}

	return result;
}

export function validateReorderWidgetIds(value: unknown): string[] {
	if (value === null || value === undefined) {
		throw new Error('widgetIds must be an array or JSON array string');
	}

	let rawList: unknown[];
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error('widgetIds cannot be empty');
		}

		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			let parsed: unknown;
			let jsonError: string | undefined;
			try {
				parsed = JSON.parse(trimmed);
			} catch (err) {
				jsonError = (err as Error).message;
			}
			if (jsonError) {
				throw new Error(`Invalid JSON for widgetIds: ${jsonError}`);
			}
			if (!Array.isArray(parsed)) {
				throw new Error('widgetIds JSON expression must evaluate to an array');
			}
			rawList = parsed;
		} else {
			rawList = trimmed.split(',');
		}
	} else if (Array.isArray(value)) {
		rawList = value;
	} else {
		throw new Error(
			`widgetIds must be an array or comma-separated string (received ${typeof value})`,
		);
	}

	if (rawList.length === 0) {
		throw new Error('At least 1 widget ID is required to reorder');
	}

	const seen = new Set<string>();
	const result: string[] = [];

	for (let i = 0; i < rawList.length; i++) {
		const item = rawList[i];
		if (typeof item !== 'string') {
			throw new Error(
				`Widget ID at index ${i} must be a non-empty string (received ${typeof item})`,
			);
		}
		const trimmed = item.trim();
		if (!trimmed) {
			throw new Error(`Widget ID at index ${i} cannot be empty or whitespace`);
		}
		if (seen.has(trimmed)) {
			throw new Error(`Duplicate widget ID found in reorder list: "${trimmed}"`);
		}
		seen.add(trimmed);
		result.push(trimmed);
	}

	return result;
}
