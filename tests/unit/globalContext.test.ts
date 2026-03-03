import { expect } from 'chai';
import { createGlobalContext } from '../../src/runtime/index.ts';

describe('createGlobalContext', () => {

	it('wraps object and returns `undefined` for all undeclared properties', () => {

		const x = createGlobalContext({ foo: 'bar' });

		expect(x.foo).to.eq('bar');
		expect(x.test).to.eq(undefined);
	});
});
