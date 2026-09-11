import type { ILogger } from '../ILogger.ts';
import SecurityViolationError from './SecurityViolationError.ts';

const BLOCKED_PROPERTY_NAMES = new Set([
	'constructor',
	'prototype',
	'__proto__',
	'caller',
	'arguments'
]);

export function isBlockedRuntimeProperty(key: string | symbol): key is string {
	return typeof key === 'string' && BLOCKED_PROPERTY_NAMES.has(key);
}

export type RuntimeValueSerializer<T = any> = {
	check: (value: unknown) => value is T,
	serialize: (value: T) => unknown
}

type WrappedRuntimeValue = {

	/** Original host- or VM-realm value hidden behind the proxy */
	value: object,

	/** Stable proxy exposed to mapping code */
	proxy: any,

	/** Whether assignments, definitions, deletions, and prototype changes must throw SecurityViolationError */
	protect: boolean
}

export default class RuntimeValueWrapper {

	/** Cache of proxies for mutable values returned by extension calls */
	#mutableWrappedValues = new WeakMap<object, WrappedRuntimeValue>();

	/** Cache of read-only proxies for direct extension access, separate from mutable return-value proxies */
	#protectedWrappedValues = new WeakMap<object, WrappedRuntimeValue>();

	/** Lookup from each wrapper-created proxy to its original value and fixed protection mode */
	#unwrappedValues = new WeakMap<object, WrappedRuntimeValue>();

	/** Serializers for converting supported host values into equivalents owned by the VM realm */
	#serializers: RuntimeValueSerializer[];

	#logger?: ILogger;

	constructor(logger?: ILogger, serializers: RuntimeValueSerializer[] = []) {
		this.#logger = logger;
		this.#serializers = serializers;
	}

	/**
	 * Get the original value behind a wrapper-created proxy for use by host APIs
	 */
	unwrap<T>(value: T): T {
		if (value === null || (typeof value !== 'object' && typeof value !== 'function'))
			return value;

		return (this.#unwrappedValues.get(value)?.value ?? value) as T;
	}

	/**
	 * Prepare arguments for a host call by wrapping callbacks and unwrapping mutable values
	 *
	 * @param protect Whether property mutations on callback values must throw SecurityViolationError
	 */
	#wrapCallbacks(argumentsList: any[], protect: boolean) {
		return argumentsList.map(argument => {
			const wrappedValue = this.#unwrappedValues.get(argument);
			if (wrappedValue && !wrappedValue.protect)
				return wrappedValue.value;

			if (typeof argument !== 'function' || wrappedValue)
				return argument;

			return this.#wrapCallback(argument, protect);
		});
	}

	/**
	 * Wrap a VM callback for safe invocation by a host extension.
	 * Host callback arguments are wrapped before entering the VM callback,
	 * and host values returned from the callback stay wrapped for the host extension.
	 *
	 * @param protect Whether property mutations on values entering the callback must throw SecurityViolationError
	 */
	#wrapCallback(callback: Function, protect: boolean): Function {
		const runtimeValueWrapper = this;

		return function runtimeCallback(this: any, ...args: any[]) {
			const receiver = runtimeValueWrapper.wrap(this, protect);
			const wrappedArgs = args.map(arg => runtimeValueWrapper.wrap(arg, protect));
			const result = Reflect.apply(callback, receiver, wrappedArgs);

			return result;
		};
	}

	#safeWarn(message: string): void {
		try {
			this.#logger?.warn(message);
		}
		catch { /* Ignore logger errors */ }
	}

	#notifyBlockedRead(key: string, operation: string): void {
		this.#safeWarn(`Blocked ${operation} of "${key}" on a sandboxed value`);
	}

	#raiseBlockedMutation(operation: string, key?: string | symbol): never {
		const target = key === undefined ? 'sandboxed value' : `"${String(key)}" on a sandboxed value`;
		const message = `Blocked ${operation} of ${target}`;
		this.#safeWarn(message);
		throw this.wrap(new SecurityViolationError(message));
	}

	/** Serialize a supported host value for use in the VM realm */
	#serializeValue<T>(value: T): T | undefined {
		for (const serializer of this.#serializers) {
			if (serializer.check(value))
				return serializer.serialize(value) as T;
		}

		return undefined;
	}

	/**
	 * Expose a host value to VM code while blocking constructor-based escapes
	 *
	 * @param protect Whether property mutations through the resulting proxy must throw SecurityViolationError
	 */
	wrap<T>(value: T, protect = false): T {
		if (value === null || (typeof value !== 'object' && typeof value !== 'function'))
			return value;

		const serialized = this.#serializeValue(value);
		if (serialized !== undefined)
			return serialized;

		if (this.#unwrappedValues.has(value as object))
			return value;

		const wrappedValues = protect ? this.#protectedWrappedValues : this.#mutableWrappedValues;
		const wrappedValue = wrappedValues.get(value);
		if (wrappedValue)
			return wrappedValue.proxy;

		const proxy = new Proxy(value, {
			apply: (target: Function, thisArg: any, argumentsList: any[]) => {
				// Recover metadata when the VM invokes a function through one of our receiver proxies
				// i.e. wrappedArray.map(...) supplies wrappedArray as thisArg
				const wrappedReceiver = this.#unwrappedValues.get(thisArg);
				const receiverProtect = wrappedReceiver?.protect ?? protect;

				// Preserve receiver-path protection for callbacks and host identity for mutable arguments,
				// so mutable callbacks stay writable and host extensions receive their original values
				const args = this.#wrapCallbacks(argumentsList, receiverProtect);

				// Unwrap mutable receivers for native internal slots while protected receivers stay guarded
				const receiver = wrappedReceiver && !wrappedReceiver.protect ? wrappedReceiver.value : thisArg;
				try {
					// Wrap results before they return to the VM
					const result = Reflect.apply(target, receiver, args);
					return this.wrap(result);
				}
				catch (error) {
					// Wrap host errors before throwing them into the VM
					throw this.wrap(error);
				}
			},

			construct: (target: Function, argumentsList: any[], newTarget: Function) => {
				const args = this.#wrapCallbacks(argumentsList, protect);
				try {
					const instance = Reflect.construct(target, args, newTarget);
					return this.wrap(instance);
				}
				catch (error) {
					throw this.wrap(error);
				}
			},

			defineProperty: (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
				if (protect)
					this.#raiseBlockedMutation('property definition', key);

				return Reflect.defineProperty(target, key, descriptor);
			},

			deleteProperty: (target: object, key: string | symbol) => {
				if (protect)
					this.#raiseBlockedMutation('property deletion', key);

				return Reflect.deleteProperty(target, key);
			},

			get: (target: object, key: string | symbol, receiver: any) => {
				if (isBlockedRuntimeProperty(key)) {
					this.#notifyBlockedRead(key, 'read');
					return undefined;
				}

				try {
					const propertyValue = Reflect.get(target, key, receiver);
					return this.wrap(propertyValue, protect);
				}
				catch (error) {
					throw this.wrap(error);
				}
			},

			getOwnPropertyDescriptor: (target: object, key: string | symbol) => {
				if (isBlockedRuntimeProperty(key)) {
					this.#notifyBlockedRead(key, 'descriptor read');
					return undefined;
				}

				try {
					const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
					if (!descriptor)
						return descriptor;

					if ('value' in descriptor)
						descriptor.value = this.wrap(descriptor.value, protect);
					if (descriptor.get)
						descriptor.get = this.wrap(descriptor.get, protect);
					if (descriptor.set)
						descriptor.set = this.wrap(descriptor.set, protect);

					return descriptor;
				}
				catch (error) {
					throw this.wrap(error);
				}
			},

			getPrototypeOf() {
				return null;
			},

			has: (target: object, key: string | symbol) => {
				if (isBlockedRuntimeProperty(key))
					return true;

				return Reflect.has(target, key);
			},

			preventExtensions: (target: object) => {
				if (protect)
					return false;

				if (Reflect.isExtensible(target))
					Reflect.setPrototypeOf(target, null);

				return Reflect.preventExtensions(target);
			},

			set: (target: object, key: string | symbol, newValue: any, receiver: any) => {
				if (protect)
					this.#raiseBlockedMutation('property assignment', key);

				return Reflect.set(target, key, newValue, receiver);
			},

			setPrototypeOf: (target: object, prototype: object | null) => {
				if (protect)
					this.#raiseBlockedMutation('prototype assignment');

				return Reflect.setPrototypeOf(target, prototype);
			}
		});

		const runtimeValue: WrappedRuntimeValue = { value, proxy, protect };
		wrappedValues.set(value, runtimeValue);
		this.#unwrappedValues.set(proxy, runtimeValue);

		return proxy as T;
	}
}
