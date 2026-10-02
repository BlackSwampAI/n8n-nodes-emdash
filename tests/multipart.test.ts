import { describe, expect, it } from 'vitest';
import { encodeMultipart } from '../nodes/EmDash/shared/multipart';

async function parseMultipart(body: Buffer, contentType: string): Promise<FormData> {
	return await new Request('https://example.com', {
		method: 'POST',
		headers: { 'Content-Type': contentType },
		body: new Uint8Array(body),
	}).formData();
}

describe('multipart encoder', () => {
	it('preserves arbitrary binary bytes and text fields', async () => {
		const bytes = Buffer.from([0, 255, 13, 10, 128, 34, 92, 1]);
		const encoded = encodeMultipart([
			{
				fieldName: 'file',
				data: bytes,
				fileName: 'image.bin',
				mimeType: 'application/octet-stream',
			},
			{ fieldName: 'width', value: '640' },
		]);
		const parsed = await parseMultipart(encoded.body, encoded.contentType);
		const file = parsed.get('file') as File;

		expect(Buffer.from(await file.arrayBuffer())).toEqual(bytes);
		expect(file.name).toBe('image.bin');
		expect(file.type).toBe('application/octet-stream');
		expect(parsed.get('width')).toBe('640');
	});

	it('encodes non-ASCII filenames and prevents header injection', async () => {
		const encoded = encodeMultipart([
			{
				fieldName: 'file',
				data: Buffer.from('safe'),
				fileName: 'résumé "final"\r\nX-Injected: yes.pdf',
				mimeType: 'text/plain\r\nX-Injected: yes',
			},
		]);
		const raw = encoded.body.toString('utf8');
		const parsed = await parseMultipart(encoded.body, encoded.contentType);
		const file = parsed.get('file') as File;

		expect(raw).toContain('filename="résumé %22final%22__X-Injected: yes.pdf"');
		expect(raw).not.toContain('filename*=');
		expect(raw).not.toContain('\r\nX-Injected: yes');
		expect(raw).toContain('Content-Type: application/octet-stream');
		expect(file.name).toBe('résumé "final"__X-Injected: yes.pdf');
	});

	it('selects a different boundary when a payload contains the initial marker', () => {
		const encoded = encodeMultipart(
			[
				{
					fieldName: 'file',
					data: Buffer.from('prefix------n8nEmDashBoundarytest0-suffix'),
					fileName: 'collision.bin',
				},
			],
			'test',
		);

		expect(encoded.boundary).toBe('----n8nEmDashBoundarytest1');
		expect(encoded.contentType).toBe('multipart/form-data; boundary=----n8nEmDashBoundarytest1');
	});

	it('checks generated header metadata for boundary collisions', () => {
		const encoded = encodeMultipart(
			[
				{
					fieldName: 'file',
					data: Buffer.alloc(0),
					fileName: '------n8nEmDashBoundaryheader0.bin',
				},
			],
			'header',
		);

		expect(encoded.boundary).toBe('----n8nEmDashBoundaryheader1');
	});

	it('handles empty files and malformed Unicode metadata without throwing', async () => {
		const encoded = encodeMultipart([
			{ fieldName: 'file', data: Buffer.alloc(0), fileName: 'bad-\ud800-name.bin' },
		]);
		const parsed = await parseMultipart(encoded.body, encoded.contentType);
		const file = parsed.get('file') as File;

		expect(file.size).toBe(0);
		expect(file.name).toContain('bad-');
	});
});
