import { mappingSchema as schema } from '../../src';
import { Validator } from 'jsonschema';
import { expect } from 'chai';

describe('mappingSchema', () => {

	let v: Validator;
	before(() => {
		v = new Validator();
	})

	it('successfully validates correct mapping', () => {

		let map: object = {
			foo: 'bar'
		};

		v.validate(map, schema, { throwError: true });

		map = {
			map: {
				foo: 'bar'
			}
		};

		v.validate(map, schema, { throwError: true });

		map = {
			forEach: 'test',
			map: {
				foo: 'bar'
			}
		};

		v.validate(map, schema, { throwError: true });

		map = {
			from: 'test',
			map: {
				foo: 'bar'
			}
		};

		v.validate(map, schema, { throwError: true });

		map = {
			from: 'test',
			map: {
				foo: {
					map: {
						bar: 'baz'
					}
				}
			}
		};

		v.validate(map, schema, { throwError: true });

	});

	it('shows errors in incorrect mapping', () => {

		let map = {};

		expect(v.validate(map, schema)).to.have.nested.property('errors.0').that.includes({
			property: 'instance',
			message: 'does not meet minimum property length of 1'
		});

		map = {
			foo: 1
		};

		expect(v.validate(map, schema)).to.have.nested.property('errors.0').that.includes({
			property: 'instance.foo',
			message: 'is not any of "Simple type mapping","Object mapping","Array mapping","Object mapping in context","Complex type mapping"'
		});

		expect(v.validate(map, schema)).to.have.nested.property('errors.0').that.includes({
			property: 'instance.foo',
			message: 'is not any of "Simple type mapping","Object mapping","Array mapping","Object mapping in context","Complex type mapping"'
		});
	});
});
