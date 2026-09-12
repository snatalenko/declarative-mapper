import { createMapper } from '../../src';
import { SecurityViolationError } from '../../src/runtime';
import { expect } from 'chai';

function createLogger() {
	const calls: Array<{ method: string, args: any[] }> = [];
	return {
		calls,
		trace(...args: any[]) {
			calls.push({ method: 'trace', args });
		},
		warn(...args: any[]) {
			calls.push({ method: 'warn', args });
		}
	};
}

describe('createMapper security', () => {

	it('does not expose process/global objects to mapping expressions', () => {

		const mapper = createMapper({
			directProcess: 'process',
			globalThisProcess: 'globalThis?.process'
		});

		const result = mapper({});

		expect(result).to.eql({
			directProcess: undefined,
			globalThisProcess: undefined
		});
	});

	it('blocks constructor-based access to process', () => {

		const mapper = createMapper({
			value: '(() => { try { return [].filter.constructor("return process")().pid; } catch (e) { return "blocked"; } })()'
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'blocked'
		});
	});

	it('disables string and WebAssembly code generation inside the mapping context', () => {

		const mapper = createMapper({
			stringCode: `(() => {
				try {
					Function('return 1')();
					return 'allowed';
				}
				catch (e) {
					return e.name;
				}
			})()`,
			wasmCode: `(() => {
				try {
					const RuntimeWebAssembly = (function() { return this; })().WebAssembly;
					new RuntimeWebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
					return 'allowed';
				}
				catch (e) {
					return e.name;
				}
			})()`
		});

		expect(mapper({})).to.eql({
			stringCode: 'EvalError',
			wasmCode: 'CompileError'
		});
	});

	it('blocks Function-based require access', () => {

		const mapper = createMapper({
			value: '(() => { try { return Function("return require(\\"fs\\")")(); } catch (e) { return "blocked"; } })()'
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'blocked'
		});
	});

	it('blocks inherited input constructor access to host process', () => {

		const mapper = createMapper({
			value: '(() => { try { return constructor.constructor("return process")().pid; } catch (e) { return "blocked"; } })()'
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'blocked'
		});
	});

	it('keeps inherited input functions bound to the VM realm', () => {

		const mapper = createMapper({
			value: '$input.nested.toString === Object.prototype.toString'
		});

		const result = mapper({ nested: {} });

		expect(result).to.eql({
			value: true
		});
	});

	it('blocks direct $input constructor access to host process', () => {

		const mapper = createMapper({
			value: '(() => { try { return $input.constructor.constructor("return process")().pid; } catch (e) { return "blocked"; } })()'
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'blocked'
		});
	});

	it('blocks extension constructor access to host process', () => {

		const mapper = createMapper({
			value: '(() => { try { return helper.constructor("return process")().pid; } catch (e) { return "blocked"; } })()'
		}, {
			extensions: {
				helper: (value: unknown) => value
			}
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'blocked'
		});
	});

	it('blocks nested extension function constructor access to host process', () => {

		const mapper = createMapper({
			value: '(() => { try { return tools.formatters.label.constructor("return process")().pid; } catch (e) { return tools.formatters.label("ok"); } })()'
		}, {
			extensions: {
				tools: {
					formatters: {
						label: (value: string) => `formatted:${value}`
					}
				}
			}
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'formatted:ok'
		});
	});

	it('blocks nested extension object constructor access to host process', () => {

		const mapper = createMapper({
			value: '(() => { try { return tools.config.constructor.constructor("return process")().pid; } catch (e) { return tools.config.prefix; } })()'
		}, {
			extensions: {
				tools: {
					config: {
						prefix: 'safe'
					}
				}
			}
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'safe'
		});
	});

	it('blocks nested extension array constructor access to host process', () => {

		const mapper = createMapper({
			value: '(() => { try { return tools.items.constructor.constructor("return process")().pid; } catch (e) { return tools.items[0].name; } })()'
		}, {
			extensions: {
				tools: {
					items: [{
						name: 'safe'
					}]
				}
			}
		});

		const result = mapper({});

		expect(result).to.eql({
			value: 'safe'
		});
	});

	it('wraps callback arguments and keeps returned host values wrapped', () => {

		const hostRecord = {
			name: 'safe'
		};
		const hostCollection = [hostRecord];

		const mapper = createMapper({
			value: `tools.visit((record, collection) => {
				try {
					record.constructor.constructor("return process")();
					return { name: "escaped" };
				}
				catch (e) {
					return collection[0];
				}
			})`
		}, {
			extensions: {
				tools: {
					visit: (callback: (record: object, collection: object[]) => object) => {
						const result = callback(hostRecord, hostCollection);

						return {
							name: (result as any).name,
							isHostRecord: result === hostRecord
						};
					}
				}
			}
		});

		const result = mapper({});

		expect(result).to.eql({
			value: {
				name: 'safe',
				isHostRecord: false
			}
		});
	});

	it('does not allow mapping expressions to break out of the generated with block', () => {

		const mapper = createMapper({
			map: {
				'*': `null;
  })()
}
$result = {
  process: typeof process,
  globalThisProcess: typeof globalThis.process,
  input: typeof $input,
  extension: typeof helper,
  createGlobalContext: typeof this.$createGlobalContext,
  createGlobalContextConstructor: (() => {
    try {
      return this.$createGlobalContext.constructor("return typeof process")();
    }
    catch (e) {
      return "blocked";
    }
  })(),
  extensionConstructor: (() => {
    try {
      return helper.constructor("return typeof process")();
    }
    catch (e) {
      return "blocked";
    }
  })()
};
if (false) {
  (() => {
    return null`
			}
		}, {
			extensions: {
				helper: () => 'safe'
			}
		});

		const result = mapper({});

		expect(result).to.eql({
			process: 'undefined',
			globalThisProcess: 'undefined',
			input: 'object',
			extension: 'function',
			createGlobalContext: 'undefined',
			createGlobalContextConstructor: 'blocked',
			extensionConstructor: 'blocked'
		});
	});

	it('blocks array record constructor access to host process', () => {

		const mapper = createMapper({
			forEach: 'arr',
			map: {
				value: '(() => { try { return $record.constructor.constructor("return process")().pid; } catch (e) { return "blocked"; } })()'
			}
		});

		const result = mapper({ arr: [{}] });

		expect(result).to.eql([{
			value: 'blocked'
		}]);
	});

	it('blocks host array callback record constructor access to host process', () => {

		const mapper = createMapper({
			value: 'arr.map(record => { try { return record.constructor.constructor("return process")().pid; } catch (e) { return "blocked"; } })'
		});

		const result = mapper({ arr: [{}] });

		expect(result).to.eql({
			value: ['blocked']
		});
	});

	it('interrupts long-running mapping expressions', () => {

		const mapper = createMapper({
			value: '(() => { while (true) {} })()'
		}, {
			timeout: 10
		});

		expect(() => mapper({})).to.throw(/Script execution timed out/);
	});

	it('interrupts long-running microtasks scheduled by the mapping', () => {

		const mapper = createMapper({
			'*': `(() => {
				const RuntimePromise = (function() { return this; })().Promise;
				RuntimePromise.resolve().then(() => {
					const startedAt = Date.now();
					while (Date.now() - startedAt < 100) { /* Keep the VM busy past the timeout */ }
				});

				return null;
			})()`
		}, {
			timeout: 10
		});

		expect(() => mapper({})).to.throw(/Script execution timed out/);
	});

	it('blocks host realm escape via errors thrown from extension functions', () => {

		const mapper = createMapper({
			value: `(() => {
				try {
					helper();
				}
				catch (e) {
					try {
						return e.constructor.constructor("return process")().pid;
					}
					catch (innerError) {
						return 'blocked';
					}
				}
			})()`
		}, {
			extensions: {
				helper: () => {
					throw new Error('boom');
				}
			}
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
	});

	it('blocks host realm escape via errors thrown from extension constructors', () => {

		function FailingClass() {
			throw new Error('boom');
		}

		const mapper = createMapper({
			value: `(() => {
				try {
					new Failing();
				}
				catch (e) {
					try {
						return e.constructor.constructor("return process")().pid;
					}
					catch (innerError) {
						return 'blocked';
					}
				}
			})()`
		}, {
			extensions: { Failing: FailingClass }
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
	});

	it('blocks getOwnPropertyDescriptor escape via extension function prototype', () => {

		function helperFn() { /* host function */ }

		const mapper = createMapper({
			value: `(() => {
				try {
					var desc = Object.getOwnPropertyDescriptor(helper, 'prototype');
					return desc && desc.value && desc.value.constructor
						&& desc.value.constructor.constructor("return process")().pid;
				}
				catch (e) {
					return 'blocked';
				}
			})()`
		}, {
			extensions: { helper: helperFn }
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
	});

	it('blocks getOwnPropertyDescriptors escape via extension function prototype', () => {

		function helperFn() { /* host function */ }

		const mapper = createMapper({
			value: `(() => {
				try {
					var descriptors = Object.getOwnPropertyDescriptors(helper);
					return descriptors.prototype.value.constructor.constructor("return process")().pid;
				}
				catch (e) {
					return 'blocked';
				}
			})()`
		}, {
			extensions: { helper: helperFn }
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
	});

	it('does not mutate host extension via assignment', () => {

		const hostExt: { value: string, injected?: string } = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try { helper.injected = 'malicious'; }
				catch (e) {}
				return typeof helper.injected;
			})()`
		}, {
			extensions: { helper: hostExt }
		});

		expect(mapper({})).to.eql({ value: 'undefined' });
		expect(hostExt.injected).to.eql(undefined);
	});

	it('does not mutate host extension via Object.defineProperty', () => {

		const hostExt: { value: string, injected?: string } = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try {
					Object.defineProperty(helper, 'injected', { value: 'malicious', enumerable: true });
				}
				catch (e) {}
				return typeof helper.injected;
			})()`
		}, {
			extensions: { helper: hostExt }
		});

		expect(mapper({})).to.eql({ value: 'undefined' });
		expect(Object.prototype.hasOwnProperty.call(hostExt, 'injected')).to.eql(false);
	});

	it('does not mutate host extension via delete', () => {

		const hostExt = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try { delete helper.value; } catch (e) {}
				return helper.value;
			})()`
		}, {
			extensions: { helper: hostExt }
		});

		expect(mapper({})).to.eql({ value: 'original' });
		expect(hostExt.value).to.eql('original');
	});

	it('does not change host extension prototype via Object.setPrototypeOf', () => {

		const hostExt = { value: 'original' };
		const originalProto = Object.getPrototypeOf(hostExt);

		const mapper = createMapper({
			value: `(() => {
				try { Object.setPrototypeOf(helper, { malicious: true }); }
				catch (e) {}
				return 'done';
			})()`
		}, {
			extensions: { helper: hostExt }
		});

		expect(mapper({})).to.eql({ value: 'done' });
		expect(Object.getPrototypeOf(hostExt)).to.eql(originalProto);
	});

	it('blocks access to extension function caller and arguments', () => {

		function helperFn() { /* sloppy host function */ }

		const mapper = createMapper({
			value: `(() => {
				return {
					caller: typeof helper.caller,
					arguments: typeof helper.arguments
				};
			})()`
		}, {
			extensions: { helper: helperFn }
		});

		expect(mapper({})).to.eql({
			value: { caller: 'undefined', arguments: 'undefined' }
		});
	});

	it('blocks host realm escape via strict function caller poison pill', () => {

		'use strict';

		function strictHelper() { /* strict host function */ }

		const mapper = createMapper({
			value: `(() => {
				try {
					return strict.caller;
				}
				catch (e) {
					try {
						return e.constructor.constructor("return process")().pid;
					}
					catch (innerError) {
						return 'blocked';
					}
				}
			})()`
		}, {
			extensions: { strict: strictHelper }
		});

		const result = mapper({}) as { value: unknown };
		expect(result.value === undefined || result.value === 'blocked').to.eql(true);
	});

	it('blocks host realm escape via throwing extension getter', () => {

		const mapper = createMapper({
			value: `(() => {
				try {
					return helper.boom;
				}
				catch (e) {
					try {
						return e.constructor.constructor("return process")().pid;
					}
					catch (innerError) {
						return 'blocked';
					}
				}
			})()`
		}, {
			extensions: {
				helper: Object.defineProperty({}, 'boom', {
					get() {
						throw new Error('boom');
					}
				})
			}
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
	});

	it('does not freeze host extension via Object.preventExtensions', () => {

		const hostExt: { value: string, added?: string } = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try { Object.preventExtensions(helper); }
				catch (e) {}
				return 'done';
			})()`
		}, {
			extensions: { helper: hostExt }
		});

		expect(mapper({})).to.eql({ value: 'done' });
		expect(Object.isExtensible(hostExt)).to.eql(true);

		hostExt.added = 'still works';
		expect(hostExt.added).to.eql('still works');
	});

	it('throws SecurityViolationError when mutating a sandboxed extension', () => {

		const hostExt = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try { helper.injected = 1; return 'not thrown'; }
				catch (e) { return { name: e.name, message: e.message }; }
			})()`
		}, {
			extensions: { helper: hostExt }
		});

		const result = mapper({}) as { value: { name: string, message: string } };
		expect(result.value.name).to.eql('SecurityViolationError');
		expect(result.value.message).to.match(/Blocked property assignment of "injected"/);

		let caught: unknown;

		try {
			const escapingMapper = createMapper({
				value: 'helper.injected = 1'
			}, { extensions: { helper: { value: 'x' } } });
			escapingMapper({});
		}
		catch (e) {
			caught = e;
		}

		expect(caught).to.be.instanceof(SecurityViolationError);
	});

	it('logs blocked property reads via options.logger.warn', () => {

		const logger = createLogger();

		const mapper = createMapper({
			value: '(() => { helper.constructor; return "done"; })()'
		}, {
			extensions: { helper: () => 'safe' },
			logger
		});

		expect(mapper({})).to.eql({ value: 'done' });

		const warnings = logger.calls.filter(c => c.method === 'warn');
		expect(warnings).to.have.length(1);
		expect(warnings[0].args[0]).to.match(/Blocked read of "constructor"/);
	});

	it('logs blocked host mutations via options.logger.warn', () => {

		const logger = createLogger();
		const hostExt = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try { helper.injected = 'nope'; } catch (e) {}
				try { delete helper.value; } catch (e) {}
				try { Object.setPrototypeOf(helper, { evil: true }); } catch (e) {}
				return 'done';
			})()`
		}, {
			extensions: { helper: hostExt },
			logger
		});

		mapper({});

		const warnings = logger.calls.filter(c => c.method === 'warn').map(c => c.args[0] as string);
		expect(warnings).to.have.length(3);
		expect(warnings[0]).to.match(/Blocked property assignment of "injected"/);
		expect(warnings[1]).to.match(/Blocked property deletion of "value"/);
		expect(warnings[2]).to.match(/Blocked prototype assignment/);
	});

	it('throws SecurityViolationError on bare blocked-name reads in the mapping global scope', () => {

		const mapper = createMapper({
			value: `(() => {
				try { __proto__; return 'not thrown'; } catch (e) { return e.name; }
			})()`
		});

		expect(mapper({})).to.eql({ value: 'SecurityViolationError' });
	});

	it('does not expose SecurityViolationError host constructor when thrown from the global scope', () => {

		const mapper = createMapper({
			value: `(() => {
				try {
					__proto__;
				}
				catch (e) {
					try {
						return e.constructor.constructor("return process")().pid;
					}
					catch (innerError) {
						return 'blocked';
					}
				}
			})()`
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
	});

	it('does not expose SecurityViolationError host constructor when thrown from a mutation', () => {

		const mapper = createMapper({
			value: `(() => {
				try {
					helper.injected = 1;
				}
				catch (e) {
					try {
						return e.constructor.constructor("return process")().pid;
					}
					catch (innerError) {
						return 'blocked';
					}
				}
			})()`
		}, {
			extensions: { helper: { value: 'x' } }
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
	});

	it('blocks Array.prototype.push from mutating a host extension array', () => {

		const hostArr = [1, 2, 3];

		const mapper = createMapper({
			value: `(() => {
				try { items.push(99); return 'mutated'; }
				catch (e) { return 'blocked'; }
			})()`
		}, {
			extensions: { items: hostArr }
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
		expect(hostArr).to.eql([1, 2, 3]);
	});

	it('blocks Array.prototype.sort from mutating a host extension array', () => {

		const hostArr = [3, 1, 2];

		const mapper = createMapper({
			value: `(() => {
				try { items.sort(); return 'mutated'; }
				catch (e) { return 'blocked'; }
			})()`
		}, {
			extensions: { items: hostArr }
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
		expect(hostArr).to.eql([3, 1, 2]);
	});

	it('blocks Object.prototype.__defineGetter__ from mutating a host extension', () => {

		const hostExt: { value: string, leaked?: unknown } = { value: 'safe' };

		const mapper = createMapper({
			value: `(() => {
				try {
					helper.__defineGetter__('leaked', function () { return 'pwned'; });
					return 'mutated';
				}
				catch (e) { return 'blocked'; }
			})()`
		}, {
			extensions: { helper: hostExt }
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
		expect(Object.prototype.hasOwnProperty.call(hostExt, 'leaked')).to.eql(false);
	});

	it('blocks mutation of one extension passed as argument to another extension method', () => {

		const otherExt = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try { helper.mutate(other); return 'mutated'; }
				catch (e) { return 'blocked'; }
			})()`
		}, {
			extensions: {
				helper: {
					mutate(target: any) {
						target.injected = true;
					}
				},
				other: otherExt
			}
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
		expect(otherExt).to.eql({ value: 'original' });
	});

	it('blocks mutation of callback-returned host extension values', () => {

		const otherExt = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				try { helper.process(() => other); return 'mutated'; }
				catch (e) { return 'blocked'; }
			})()`
		}, {
			extensions: {
				helper: {
					process(callback: () => any) {
						const value = callback();
						value.injected = true;
					}
				},
				other: otherExt
			}
		});

		expect(mapper({})).to.eql({ value: 'blocked' });
		expect(otherExt).to.eql({ value: 'original' });
	});

	it('allows mutation of extension function return values while blocking sensitive properties', () => {

		const returnedValue: { value: string, injected?: string } = { value: 'returned' };

		const mapper = createMapper({
			value: `(() => {
				const value = helper.create();
				value.injected = 'allowed';
				const preventExtensionsResult = Object.preventExtensions(value) === value;

				let constructorAccess;
				try {
					constructorAccess = value.constructor.constructor("return process")().pid;
				}
				catch (e) {
					constructorAccess = 'blocked';
				}

				return {
					injected: value.injected,
					isExtensible: Object.isExtensible(value),
					preventExtensionsResult,
					constructorAccess
				};
			})()`
		}, {
			extensions: {
				helper: {
					create() {
						return returnedValue;
					}
				}
			}
		});

		expect(mapper({})).to.eql({
			value: {
				injected: 'allowed',
				isExtensible: false,
				preventExtensionsResult: true,
				constructorAccess: 'blocked'
			}
		});
		expect(returnedValue.injected).to.eql('allowed');
	});

	it('keeps extension return values mutable inside array callbacks', () => {

		const returnedValues = {
			forEach: [{ n: 1 }, { n: 2 }],
			map: [{ n: 1 }, { n: 2 }],
			sort: [{ n: 2 }, { n: 1 }]
		};

		const mapper = createMapper({
			value: `(() => {
				const forEachValues = ext.get('forEach');
				forEachValues.forEach(item => { item.n = 9; });

				const mapValues = ext.get('map');
				mapValues.map(item => { item.n = 9; return item; });

				const sortValues = ext.get('sort');
				sortValues.sort((a, b) => { a.n = 9; b.n = 9; return 0; });

				return true;
			})()`
		}, {
			extensions: {
				ext: {
					get: (method: keyof typeof returnedValues) => returnedValues[method]
				}
			}
		});

		expect(mapper({})).to.eql({ value: true });
		expect(returnedValues.forEach.map(item => item.n)).to.eql([9, 9]);
		expect(returnedValues.map.map(item => item.n)).to.eql([9, 9]);
		expect(returnedValues.sort.map(item => item.n)).to.eql([9, 9]);
	});

	it('allows mutable callback paths to mutate host callback arguments', () => {

		const secret = { token: 'safe' };
		const mapper = createMapper({
			value: `(() => {
				ext.factory().run(value => { value.token = 'callback'; });

				let directMutation;
				try {
					ext.secret.token = 'direct';
					directMutation = 'mutated';
				}
				catch (e) {
					directMutation = e.name;
				}

				return directMutation;
			})()`
		}, {
			extensions: {
				ext: {
					secret,
					factory: () => ({
						run: (callback: (value: typeof secret) => void) => callback(secret)
					})
				}
			}
		});

		expect(mapper({})).to.eql({ value: 'SecurityViolationError' });
		expect(secret.token).to.eql('callback');
		expect(mapper({})).to.eql({ value: 'SecurityViolationError' });
		expect(secret.token).to.eql('callback');
	});

	it('passes raw host values to extensions for mutable-path arguments', () => {

		const values = [1, 2, 3];
		const mapper = createMapper({
			value: 'ext.isOriginal(ext.getValues())'
		}, {
			extensions: {
				ext: {
					getValues: () => values,
					isOriginal: (value: number[]) => value === values
				}
			}
		});

		expect(mapper({})).to.eql({ value: true });
	});

	it('isolates protected and mutable paths to the same extension value', () => {

		const sharedValue = { value: 'original' };

		const mapper = createMapper({
			value: `(() => {
				const protectedAlias = ext.shared;
				const mutableAlias = ext.get();
				const values = ext.getValues();
				mutableAlias.value = 'changed';
				let protectedWrite;
				try {
					protectedAlias.value = 'blocked';
					protectedWrite = 'mutated';
				}
				catch (e) {
					protectedWrite = e.name;
				}

				return {
					same: protectedAlias === mutableAlias,
					includes: values.includes(mutableAlias),
					index: values.indexOf(protectedAlias),
					setSize: new Set([protectedAlias, mutableAlias]).size,
					protectedWrite,
					protectedAliasValue: protectedAlias.value
				};
			})()`
		}, {
			extensions: {
				ext: {
					shared: sharedValue,
					get: () => sharedValue,
					getValues: () => [sharedValue]
				}
			}
		});

		expect(mapper({})).to.eql({
			value: {
				same: false,
				includes: true,
				index: -1,
				setSize: 2,
				protectedWrite: 'SecurityViolationError',
				protectedAliasValue: 'changed'
			}
		});
		expect(sharedValue.value).to.eql('changed');
	});

	it('keeps protected proxies protected when extension functions pass them through', () => {

		const protectedValue = {
			n: 1,
			self() {
				return this;
			}
		};

		const mapper = createMapper({
			value: `(() => {
				const attemptMutation = value => {
					try {
						value.n = 9;
						return 'mutated';
					}
					catch (e) {
						return e.name;
					}
				};

				return {
					direct: attemptMutation(ext.value),
					identity: attemptMutation(ext.identity(ext.value)),
					array: attemptMutation(ext.ensureArray(ext.value)[0]),
					receiver: attemptMutation(ext.value.self())
				};
			})()`
		}, {
			extensions: {
				ext: {
					value: protectedValue,
					identity: <T>(value: T) => value,
					ensureArray: <T>(value: T) => [value]
				}
			}
		});

		expect(mapper({})).to.eql({
			value: {
				direct: 'SecurityViolationError',
				identity: 'SecurityViolationError',
				array: 'SecurityViolationError',
				receiver: 'SecurityViolationError'
			}
		});
		expect(protectedValue.n).to.eql(1);
	});

	it('does not let mutable return values disable protection in later mapping runs', () => {

		const sharedValue = { n: 1 };
		const mapper = createMapper({
			value: `(() => {
				const value = $input.mutable ? ext.get() : ext.value;
				try {
					value.n += 1;
					return 'mutated';
				}
				catch (e) {
					return e.name;
				}
			})()`
		}, {
			extensions: {
				ext: {
					value: sharedValue,
					get: () => sharedValue
				}
			}
		});

		expect(mapper({ mutable: true })).to.eql({ value: 'mutated' });
		expect(mapper({ mutable: false })).to.eql({ value: 'SecurityViolationError' });
		expect(sharedValue.n).to.eql(2);
	});

	it('clones extension returned dates into the VM realm', () => {

		const mapper = createMapper({
			value: `(() => {
				const start = dates.startOfYear(1723677703511);
				const shifted = dates.addMonths(start, 5);

				return {
					time: shifted.getTime(),
					inRuntimeRealm: Object.getPrototypeOf(shifted) === Date.prototype
				};
			})()`
		}, {
			extensions: {
				dates: {
					startOfYear(value: number | Date) {
						const date = new Date(value);

						return new Date(date.getFullYear(), 0, 1);
					},
					addMonths(value: Date, months: number) {
						const date = new Date(value.getTime());
						date.setMonth(date.getMonth() + months);

						return date;
					}
				}
			}
		});

		expect(mapper({})).to.eql({
			value: {
				time: new Date(2024, 5, 1).getTime(),
				inRuntimeRealm: true
			}
		});
	});

	it('allows extension functions to prevent extensions on extension return values', () => {

		const returnedValue = { value: 'returned' };

		const mapper = createMapper({
			value: 'helper.freeze(helper.create())'
		}, {
			extensions: {
				helper: {
					create() {
						return returnedValue;
					},
					freeze(value: object) {
						Object.preventExtensions(value);

						return Object.isExtensible(value);
					}
				}
			}
		});

		expect(mapper({})).to.eql({ value: false });
		expect(Object.isExtensible(returnedValue)).to.eql(false);
	});

	it('allows prototype checks after preventing extensions on extension return values', () => {

		const returnedValue = { value: 'returned' };

		const mapper = createMapper({
			value: `(() => {
				const value = helper.create();
				Object.preventExtensions(value);

				return {
					isExtensible: Object.isExtensible(value),
					prototype: Object.getPrototypeOf(value),
					constructorAccess: (() => {
						try {
							return Object.getPrototypeOf(value)?.constructor.constructor("return process")().pid;
						}
						catch (e) {
							return 'blocked';
						}
					})()
				};
			})()`
		}, {
			extensions: {
				helper: {
					create() {
						return returnedValue;
					}
				}
			}
		});

		expect(mapper({})).to.eql({
			value: {
				isExtensible: false,
				prototype: null,
				constructorAccess: undefined
			}
		});
	});

	it('allows non-mutating Array.prototype.slice on a wrapped extension array', () => {

		const hostArr = [1, 2, 3, 4];

		const mapper = createMapper({
			value: 'items.slice(1, 3)'
		}, {
			extensions: { items: hostArr }
		});

		expect(mapper({})).to.eql({ value: [2, 3] });
	});

	it('allows non-mutating Array.prototype.map on a wrapped extension array', () => {

		const mapper = createMapper({
			value: 'items.map(n => n * 2)'
		}, {
			extensions: { items: [1, 2, 3] }
		});

		expect(mapper({})).to.eql({ value: [2, 4, 6] });
	});

	it('allows Object.fromEntries to consume a mapped array returned by an extension', () => {

		const ensureArray = <T>(arrayOrObject: T[] | T): T[] =>
			(Array.isArray(arrayOrObject) ? arrayOrObject : [arrayOrObject]);
		const profile = {
			active: true,
			displayName: 'bosco Baravuga',
			id: 'a3103ab0fa084b8fa107587cce34e53f'
		};

		const mapper = createMapper({
			'*': 'Object.fromEntries($array.ensureArray($sources.profilesApiResponse).map(p => [p.id, p]))'
		}, {
			extensions: {
				$array: { ensureArray },
				$sources: {
					profilesApiResponse: [profile]
				}
			}
		});

		const result = mapper({}) as Record<string, typeof profile>;

		expect(result).to.eql({
			[profile.id]: profile
		});

		// Deep equality is the output contract; reference identity is not representable in JSON
		expect(Object.getPrototypeOf(result[profile.id])).to.equal(Object.prototype);
	});

	it('unwraps extension values nested inside arrays built by host array methods', () => {

		const rows = [{ a: 1 }, { a: 2 }];
		const mapper = createMapper({
			'*': '({ list: $ext.rows.map(row => ({ row })) })'
		}, {
			extensions: {
				$ext: { rows }
			}
		});

		const result = mapper({}) as { list: { row: typeof rows[0] }[] };

		expect(result.list.map(item => item.row)).to.eql(rows);

		// No proxy survives: a wrapped value would report a null prototype
		for (const item of result.list)
			expect(Object.getPrototypeOf(item.row)).to.equal(Object.prototype);
	});

	it('does not execute result getters once the mapping run has finished', () => {

		const tracked = { value: 1 };
		const calls: string[] = [];
		const mapper = createMapper({
			'*': `(() => {
				const output = { eager: $ext.track() };
				Object.defineProperty(output, 'lazy', {
					get: () => $ext.track(),
					enumerable: true,
					configurable: true
				});

				return output;
			})()`
		}, {
			extensions: {
				$ext: {
					track() {
						calls.push('read');

						return tracked;
					}
				}
			}
		});

		const result = mapper({}) as { eager: typeof tracked, lazy: typeof tracked };

		// Reading the accessor would run mapping code past the timeout, so cleanup leaves it alone
		expect(calls).to.eql(['read']);
		expect(result.eager).to.equal(tracked);
		expect(calls).to.eql(['read']);
		expect(JSON.stringify(result)).to.eql('{"eager":{"value":1},"lazy":{"value":1}}');
		expect(calls).to.eql(['read', 'read']);
	});

	it('does not rewrite extension owned containers while unwrapping the result', () => {

		const secret = { token: 'safe' };
		const stored: unknown[] = [];
		const mapper = createMapper({
			held: '$ext.keep($ext.secret)',
			write: `(() => {
				try {
					$ext.stored()[0].token = 'hacked';
					return 'mutated';
				}
				catch (e) {
					return e.name;
				}
			})()`
		}, {
			extensions: {
				$ext: {
					secret,
					stored: () => stored,
					keep(value: unknown) {
						if (!stored.length)
							stored.push(value);

						return stored;
					}
				}
			}
		});

		// Replacing the stored proxy with the raw object would expose it to a later mutable read
		expect(mapper({})).to.eql({ held: [{ token: 'safe' }], write: 'SecurityViolationError' });
		expect(stored[0]).to.not.equal(secret);
		expect(mapper({})).to.eql({ held: [{ token: 'safe' }], write: 'SecurityViolationError' });
		expect(secret.token).to.eql('safe');
	});

	it('rebuilds result containers instead of aliasing the ones an extension still holds', () => {

		const rows = [{ a: 1 }, { a: 2 }];
		const leaf = { a: 1 };
		const mapper = createMapper({
			container: '$ext.rows',
			leaf: '$ext.leaf'
		}, {
			extensions: {
				$ext: { rows, leaf }
			}
		});

		const result = mapper({}) as { container: typeof rows, leaf: typeof leaf };

		expect(result).to.eql({ container: rows, leaf });

		// Implementation detail, asserted so the rebuild is not silently dropped
		expect(result.container).to.not.equal(rows);
		expect(result.container[0]).to.equal(rows[0]);
		expect(result.leaf).to.equal(leaf);
	});

	it('does not run the traps of a proxy the mapping built for itself', () => {

		const calls: string[] = [];
		const mapper = createMapper({
			'*': `(() => {
				const RuntimeProxy = (function() { return this; })().Proxy;

				return new RuntimeProxy({ v: $ext.held }, {
					ownKeys(target) {
						$ext.mark('ownKeys');

						return Reflect.ownKeys(target);
					},
					getOwnPropertyDescriptor(target, key) {
						$ext.mark('getOwnPropertyDescriptor');

						return Reflect.getOwnPropertyDescriptor(target, key);
					}
				});
			})()`
		}, {
			extensions: {
				$ext: {
					held: { a: 1 },
					mark(name: string) {
						calls.push(name);
					}
				}
			}
		});

		// Traps are sandboxed code, running them here would escape the configured timeout
		expect(() => mapper({})).to.not.throw();
		expect(calls).to.eql([]);
	});

	it('does not reach an inherited setter while rebuilding a result container', () => {

		const calls: string[] = [];
		const held = { a: 1 };
		const mapper = createMapper({
			'*': `(() => {
				const prototype = {};
				Object.defineProperty(prototype, 'v', {
					get: () => 'from prototype',
					set: () => $ext.mark(),
					configurable: true
				});

				const output = Object.create(prototype);
				Object.defineProperty(output, 'v', {
					value: $ext.held,
					writable: true,
					enumerable: true,
					configurable: true
				});

				return output;
			})()`
		}, {
			extensions: {
				$ext: {
					held,
					mark() {
						calls.push('set');
					}
				}
			}
		});

		const result = mapper({}) as { v: typeof held };

		// Assigning onto the rebuilt container would run the prototype setter past the timeout,
		// and would leave no own property behind
		expect(calls).to.eql([]);
		expect(Object.prototype.hasOwnProperty.call(result, 'v')).to.eql(true);
		expect(result.v).to.eql(held);
	});

	it('does not rewrite an extension owned container nested below the returned one', () => {

		const secret = { token: 'safe' };
		const container: { inner: unknown[] } = { inner: [] };
		const mapper = createMapper({
			held: '$ext.keep($ext.secret)',
			write: `(() => {
				try {
					$ext.container().inner[0].token = 'hacked';
					return 'mutated';
				}
				catch (e) {
					return e.name;
				}
			})()`
		}, {
			extensions: {
				$ext: {
					secret,
					container: () => container,
					keep(value: unknown) {
						if (!container.inner.length)
							container.inner.push(value);

						return container;
					}
				}
			}
		});

		const expected = { held: { inner: [{ token: 'safe' }] }, write: 'SecurityViolationError' };

		expect(mapper({})).to.eql(expected);
		expect(container.inner[0]).to.not.equal(secret);
		expect(mapper({})).to.eql(expected);
		expect(secret.token).to.eql('safe');
	});

	it('does not rewrite a mapping built object that an extension kept a reference to', () => {

		const secret = { token: 'safe' };
		let held: unknown;
		const mapper = createMapper({
			direct: `(() => {
				const value = { secret: $ext.secret };
				$ext.hold(value);

				return value;
			})()`,
			write: `(() => {
				try {
					$ext.held().secret.token = 'hacked';
					return 'mutated';
				}
				catch (e) {
					return e.name;
				}
			})()`
		}, {
			extensions: {
				$ext: {
					secret,
					hold(value: unknown) {
						held ??= value;
					},
					held: () => held
				}
			}
		});

		const expected = { direct: { secret: { token: 'safe' } }, write: 'SecurityViolationError' };

		expect(mapper({})).to.eql(expected);
		expect(mapper({})).to.eql(expected);
		expect(secret.token).to.eql('safe');
	});

	it('keeps cyclic back-references pointing at the returned container', () => {

		const secret = { token: 'safe' };
		const cyclic: unknown[] & { self?: unknown[] } = [];
		const mapper = createMapper({
			'*': '$ext.build($ext.secret)'
		}, {
			extensions: {
				$ext: {
					secret,
					build(value: unknown) {
						if (!cyclic.length) {
							cyclic.push(value);
							cyclic.self = cyclic;
						}

						return cyclic;
					}
				}
			}
		});

		const result = mapper({}) as unknown[] & { self: unknown[] };

		expect(result).to.not.equal(cyclic);
		expect(result.self).to.equal(result);
		expect(result[0]).to.eql(secret);
		expect((result.self as unknown[])[0]).to.eql(secret);

		// The extension keeps its protected proxy, so a later run cannot reach the raw object
		expect(cyclic[0]).to.not.equal(secret);
		expect(secret.token).to.eql('safe');
	});

	it('preserves property flags when unwrapping a read-only result property', () => {

		const value = { a: 1 };
		const mapper = createMapper({
			'*': `(() => {
				const output = {};
				Object.defineProperty(output, 'locked', {
					value: $ext.value,
					writable: false,
					enumerable: true,
					configurable: true
				});

				return output;
			})()`
		}, {
			extensions: {
				$ext: { value }
			}
		});

		const result = mapper({}) as { locked: typeof value };
		const descriptor = Object.getOwnPropertyDescriptor(result, 'locked');

		expect(result.locked).to.equal(value);
		expect(descriptor).to.include({ writable: false, enumerable: true, configurable: true });
	});

	it('leaves extension values held in a Map or Set wrapped, as neither survives JSON output', () => {

		const value = { a: 1 };
		const mapper = createMapper({
			'*': '({ collected: new Map([["key", $ext.value]]), plain: { value: $ext.value } })'
		}, {
			extensions: {
				$ext: { value }
			}
		});

		const result = mapper({}) as { collected: Map<string, typeof value>, plain: { value: typeof value } };

		expect(Map.prototype.get.call(result.collected, 'key')).to.not.equal(value);
		expect(JSON.stringify(result.collected)).to.eql('{}');

		// Entries outside the collection are still unwrapped
		expect(result.plain.value).to.equal(value);
	});

	it('does not leak errors thrown from the logger into the sandbox', () => {

		const throwingLogger = {
			trace() { /* unused */ },
			warn() {
				throw new Error('logger boom');
			}
		};

		const mapper = createMapper({
			value: `(() => {
				try { helper.constructor; return 'ok'; }
				catch (e) { return e.message; }
			})()`
		}, {
			extensions: { helper: () => 'safe' },
			logger: throwingLogger
		});

		expect(mapper({})).to.eql({ value: 'ok' });
	});

	it('does not leak errors thrown from the logger when blocking a mutation', () => {

		const throwingLogger = {
			trace() { /* unused */ },
			warn() {
				throw new Error('logger boom');
			}
		};

		const mapper = createMapper({
			value: `(() => {
				try { helper.x = 1; return 'mutated'; }
				catch (e) {
					try {
						return e.constructor.constructor("return process")().pid;
					}
					catch (innerError) {
						return e.name;
					}
				}
			})()`
		}, {
			extensions: { helper: { value: 'x' } },
			logger: throwingLogger
		});

		expect(mapper({})).to.eql({ value: 'SecurityViolationError' });
	});
});
