export interface MultipartFilePart {
	fieldName: string;
	data: Buffer;
	fileName: string;
	mimeType?: string;
}

export interface MultipartFieldPart {
	fieldName: string;
	value: string;
}

export type MultipartPart = MultipartFilePart | MultipartFieldPart;

const BOUNDARY_PREFIX = '----n8nEmDashBoundary';
const MAX_BOUNDARY_ATTEMPTS = 32;

function escapeQuotedHeaderValue(value: string): string {
	return value
		.replace(/[\r\n]/g, '_')
		.replace(
			/["\\]/g,
			(character) => `%${character.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
		);
}

function safeMimeType(value: string | undefined): string {
	if (value && /^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/.test(value)) {
		return value;
	}
	return 'application/octet-stream';
}

function encodePart(part: MultipartPart): Buffer {
	const name = escapeQuotedHeaderValue(part.fieldName);
	if ('data' in part) {
		const fileName = escapeQuotedHeaderValue(part.fileName);
		return Buffer.concat([
			Buffer.from(
				`Content-Disposition: form-data; name="${name}"; filename="${fileName}"\r\n` +
					`Content-Type: ${safeMimeType(part.mimeType)}\r\n\r\n`,
			),
			part.data,
		]);
	}
	return Buffer.from(`Content-Disposition: form-data; name="${name}"\r\n\r\n${part.value}`);
}

function selectBoundary(encodedParts: Buffer[], boundarySeed?: string): string {
	const seed =
		boundarySeed ??
		`${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
	for (let suffix = 0; suffix < MAX_BOUNDARY_ATTEMPTS; suffix += 1) {
		const boundary = `${BOUNDARY_PREFIX}${seed}${suffix.toString(36)}`;
		const marker = Buffer.from(`--${boundary}`);
		if (encodedParts.every((part) => !part.includes(marker))) {
			return boundary;
		}
	}
	throw new Error('Unable to select a collision-free multipart boundary');
}

export function encodeMultipart(
	parts: MultipartPart[],
	boundarySeed?: string,
): {
	body: Buffer;
	contentType: string;
	boundary: string;
} {
	const encodedParts = parts.map(encodePart);
	const boundary = selectBoundary(encodedParts, boundarySeed);
	const chunks: Buffer[] = [];

	for (const part of encodedParts) {
		chunks.push(Buffer.from(`--${boundary}\r\n`));
		chunks.push(part);
		chunks.push(Buffer.from('\r\n'));
	}

	chunks.push(Buffer.from(`--${boundary}--\r\n`));
	return {
		body: Buffer.concat(chunks),
		contentType: `multipart/form-data; boundary=${boundary}`,
		boundary,
	};
}
