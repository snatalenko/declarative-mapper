import { mappingSchema as schema } from '../../src';
import { Validator } from 'jsonschema';
import { expect } from 'chai';

describe('mappingSchema', () => {

	let v: Validator;
	beforeAll(() => {
		v = new Validator();
	})

	it('successfully validates correct mapping', () => {

		let map: any = {
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

		map = [
			'foo',
			{
				bar: 'baz'
			}
		];

		v.validate(map, schema, { throwError: true });

		map = 'foo';

		v.validate(map, schema, { throwError: true });
	});

	it('shows errors in incorrect mapping', () => {

		const NOT_ANY_OF_MSG = 'is not any of "Constant or variable","Object implicit mapping","Object explicit mapping","Object in context mapping","Array mapping","Array elements mapping"';

		let map = {};

		expect(v.validate(map, schema)).to.have.nested.property('errors.0').that.includes({
			property: 'instance',
			message: NOT_ANY_OF_MSG
		});

		map = {
			foo: 1
		};

		expect(v.validate(map, schema)).to.have.nested.property('errors.0').that.includes({
			property: 'instance',
			message: NOT_ANY_OF_MSG
		});
	});
});
