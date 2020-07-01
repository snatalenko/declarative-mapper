import { createMapper } from '../../src';
import { expect } from 'chai';

describe('createMapper', () => {

	it('returns mapper function', () => {

		const mapper = createMapper({ map: {} });

		expect(mapper).to.be.a('function');
	});

	it('maps constant values', () => {

		const mapper = createMapper({
			map: {
				'foo': '"bar"'
			}
		});

		const result = mapper({ a: 'b' });

		expect(result).to.eql({
			foo: 'bar'
		});
	});

	it('maps values from source document', () => {

		const mapper = createMapper({
			map: {
				'foo': 'a'
			}
		});

		const result = mapper({ a: 'b' });

		expect(result).to.eql({
			foo: 'b'
		});
	});

	it('maps values from source document (without `map` directive)', () => {

		const mapper = createMapper({
			'foo': 'a'
		});

		const result = mapper({ a: 'b' });

		expect(result).to.eql({
			foo: 'b'
		});
	});


	it('logs script body as a trace output to logger', () => {

		const log: string[] = [];

		createMapper({
			map: { foo: 'true' },
		}, {
			logger: {
				trace(msg) {
					log.push(msg);
				}
			}
		});

		expect(log).to.have.length(1);
		expect(log[0]).to.eql(
			`
with ($globalContext($input, $extensionNames)) {
  $result =
    (() => {
      return {
        foo: true,
      };
    })()
}`);
	});

	it('accepts mapping runtime extensions', () => {

		const mapper = createMapper({
			map: {
				foo: 'catalog[key]',
				baz: 'prefix(key)'
			}
		}, {
			extensions: {
				catalog: {
					a: 'bar'
				},
				prefix(str) {
					return `prefixed:${str}`;
				}
			}
		});

		const result = mapper({
			key: 'a'
		});

		expect(result).to.eql({
			foo: 'bar',
			baz: 'prefixed:a'
		});
	});

	it('maps result from simple type', () => {

		const mapper = createMapper({
			map: {
				'*': 'foo'
			}
		});

		const result = mapper({ foo: 'bar' });

		expect(result).to.eq('bar');
	});

	it('maps array elements from simple types', () => {

		const mapper = createMapper({
			forEach: 'arr',
			map: {
				'*': '$record * 2'
			}
		});

		const result = mapper({ arr: [1, 2, 3] });

		expect(result).to.eql([2, 4, 6]);
	});

	it('works fast', () => {

		const mapper = createMapper({
			map: {
				foo: 'bar'
			}
		});

		for (let i = 0; i < 10000; i++)
			mapper({ bar: 'baz' });
	});
});
