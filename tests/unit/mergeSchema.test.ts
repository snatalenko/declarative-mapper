import { expect } from 'chai';
import type { JSONSchema4 } from 'json-schema';
import mergeSchema from '../../src/utils/mergeSchema.ts';

describe('mergeSchema', () => {

	it('merges array properties and keeps only unique values', () => {

		const dest: JSONSchema4 = {
			type: 'object',
			required: ['id', 'name']
		};

		const src: JSONSchema4 = {
			required: ['name', 'email']
		};

		const result = mergeSchema(dest, src);

		expect(result.required).to.eql(['id', 'name', 'email']);
	});

	it('deduplicates structurally equal array entries', () => {

		const dest: JSONSchema4 = {
			enum: [{ code: 'A' }, { code: 'A' }] as any[]
		};

		const src: JSONSchema4 = {
			enum: [{ code: 'A' }, { code: 'B' }] as any[]
		};

		const result = mergeSchema(dest, src);

		expect(result.enum).to.eql([{ code: 'A' }, { code: 'B' }]);
	});
});
