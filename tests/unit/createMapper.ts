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

	it('maps loops using `forEach` directive', () => {

		const input = {
			arr: [{
				id: 1,
				qty: 100
			}, {
				id: 2,
				qty: 200
			}]
		};
		const mapper = createMapper({
			forEach: 'arr',
			map: {
				description: "'#' + id + ' - ' + qty + ' items'"
			}
		});

		const result = mapper(input);

		expect(result).to.eql([
			{ description: '#1 - 100 items' },
			{ description: '#2 - 200 items' }
		]);
	});

	it('allows to switch mapping context using `from` directive', () => {

		const input = {
			container: {
				nested: {
					bar: 'baz'
				}
			}
		};

		const mapper = createMapper({
			from: 'container.nested',
			map: {
				foo: 'bar'
			}
		});

		const result = mapper(input);

		expect(result).to.eql({
			foo: 'baz'
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
with ($createGlobalContext($input)) {
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

	it('throws error if input field names conflict with extension names', () => {
		const mapper = createMapper({
			foo: 'bar'
		}, {
			extensions: {
				bar: 'test'
			}
		});

		expect(() => mapper({ bar: 'baz' })).to.throw('Extension "bar" conflicts with a field name passed in input');
	});

	it('throws errors on incorrectly formatted instructions', () => {

		expect(() => createMapper({ from: 'test' })).to.throw('Property "map" is empty in mapping "{"from":"test"}"');

		expect(() => createMapper({ from: '' })).to.throw('Property "from" is empty in mapping "{"from":""}"');

		expect(() => createMapper({ forEach: 'test' })).to.throw('Property "map" is empty in mapping "{"forEach":"test"}"');

		expect(() => createMapper({ forEach: '' })).to.throw('Property "forEach" is empty in mapping "{"forEach":""}"');

		expect(() => createMapper({ map: '' })).to.throw('Property "map" is empty in mapping "{"map":""}"');
	});

	it('works fast', () => {

		const mapper = createMapper({
			map: {
				foo: 'dict[bar]'
			}
		}, {
			extensions: {
				dict: {
					a: 'b',
					x: 'y'
				}
			}
		});

		for (let i = 0; i < 10000; i++)
			mapper({ bar: 'a' });
	});
});
