import { expect } from 'chai';
import { $globalContext } from '../../src/runtime';

describe('$globalContext', () => {

	it('wraps object and returns `undefined` for all undeclared properties', () => {

		const x = $globalContext({ foo: 'bar' });

		expect(x.foo).to.eq('bar');
		expect(x.test).to.eq(undefined);
	});
});
