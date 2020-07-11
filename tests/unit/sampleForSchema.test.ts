
import { sampleForSchema } from '../../src';
import { JSONSchema4 } from 'json-schema';
import * as sampleSchema from './data/sampleSchema.json'
import { expect } from 'chai';

function clone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj))
};

describe('sampleForSchema', () => {

	it('generates sample data for JSON schema', () => {

		const sample = sampleForSchema(sampleSchema as JSONSchema4);

		expect(sample).to.eql({
			longText: 'texttextte',
			shortText: 'te',
			bool: true,
			null: null,
			numWithMax: 199.99,
			numWithMin: 100.01,
			number: 1,
			int: 101,
			array: [
				{
					type: 'work'
				}
			],
			stringArray: [
				'text',
				'text'
			],
			tupleArray: [
				'text',
				1,
				{
					foo: 'bar'
				}
			]
		});
	});

	it('throws TypeError when object properties are not described', () => {

		const brokenSchema0 = clone(sampleSchema);
		delete brokenSchema0.properties.longText.type;

		expect(() => {
			sampleForSchema(brokenSchema0 as JSONSchema4);
		}).to.throw(TypeError);

		const brokenSchema1 = clone(sampleSchema);
		delete brokenSchema1.properties.array.items;

		expect(() => {
			sampleForSchema(brokenSchema1 as JSONSchema4);
		}).to.throw(TypeError);

		const brokenSchema2 = clone(sampleSchema);
		delete brokenSchema2.properties.array.items.properties;

		expect(() => {
			sampleForSchema(brokenSchema2 as JSONSchema4);
		}).to.throw(TypeError);
	});
});
