
import { mappingForSchema, createMapper } from '../../src';
import { JSONSchema4 } from 'json-schema';
import * as sampleSchema from './data/sampleSchema.json'
import { expect } from 'chai';
import { TRootMapping, TValueMap } from '../../src/TMapping';

function clone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj))
};

describe('mappingForSchema', () => {

	it('generates mapping template for JSON schema', () => {

		const mapping = mappingForSchema(sampleSchema as JSONSchema4);

		expect(mapping).to.eql({
			map: {
				longText: '"texttextte"',
				shortText: '"te"',
				textWithExample: '"example 1"',
				textWithDefault: '"example 2"',
				bool: "true",
				null: "null",
				numWithMax: "199.99",
				numWithMin: "100.01",
				number: "1",
				int: '101',
				array: {
					forEach: '',
					map: {
						type: '"work"'
					}
				},
				stringArray: {
					forEach: '',
					map: {
						'*': '"text"'
					}
				},
				tupleArray: {
					map: {
						'0': '"text"',
						'1': '1',
						'2': {
							map: {
								foo: '"bar"'
							}
						}
					}
				},
				complexObject: {
					map: {
						foo: "\"bar\"",
						baz: "true"
					}
				},
				multiChoice: "\"text\"",
				oneChoice: "\"text\"",
				withAdditionalProps: {
					map: {}
				}
			}
		});

		// @ts-ignore
		mapping?.map?.array?.forEach = '[{}]';

		// @ts-ignore
		mapping?.map?.stringArray?.forEach = '[{}]';

		const mapper = createMapper(mapping as TRootMapping);

		const result = mapper({});

		expect(result).to.eql({
			longText: 'texttextte',
			shortText: 'te',
			textWithExample: 'example 1',
			textWithDefault: 'example 2',
			bool: true,
			null: null,
			numWithMax: 199.99,
			numWithMin: 100.01,
			number: 1,
			int: 101,
			array: [{
				type: 'work'
			}],
			stringArray: ['text'],
			tupleArray: [
				'text',
				1,
				{ foo: 'bar' }
			],
			complexObject: {
				foo: 'bar',
				baz: true
			},
			oneChoice: 'text',
			multiChoice: 'text',
			withAdditionalProps: {}
		});
	});

	it('throws TypeError when type is not described', () => {

		const brokenSchema0 = clone(sampleSchema);
		delete brokenSchema0.properties.longText.type;

		expect(() => {
			mappingForSchema(brokenSchema0 as JSONSchema4);
		}).to.throw(TypeError);
	});

	it('does not throw Error when properties are not described', () => {

		const brokenSchema1 = clone(sampleSchema);
		delete brokenSchema1.properties.array.items;

		expect(() => {
			mappingForSchema(brokenSchema1 as JSONSchema4);
		}).to.not.throw(TypeError);

		const brokenSchema2 = clone(sampleSchema);
		delete brokenSchema2.properties.array.items.properties;

		expect(() => {
			mappingForSchema(brokenSchema2 as JSONSchema4);
		}).to.not.throw(TypeError);
	});
});
