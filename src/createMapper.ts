import { TRootMapping } from './TMapping';
import * as vm from 'vm';
import createScript from './createScript';
import * as runtime from './runtime';

interface ILogger {
	trace(message: string, ...args: any[]): void;
}

/**
 * Create map function for given instructions
 *
 * @param map Instructions for object mapping
 * @param options
 * @param options.extensions
 *  Extensions to pass to mapping environment.
 *  The object can contain additional functions, dictionaries, etc.
 * @param options.logger
 *  Logger instance for trace output
 */
export default function createMapper<TSource, TResult>(map: TRootMapping, options?: {
	extensions?: object,
	logger?: ILogger
}) {
	const scriptBody = createScript(map);
	options?.logger?.trace(scriptBody);

	const script = new vm.Script(scriptBody);

	const sandbox: {
		$input?: TSource,
		$result?: TResult,
		$extensionNames?: string[],
		$globalContext
	} = {
		$input: undefined,
		$result: undefined,
		$extensionNames: options?.extensions ? Object.keys(options.extensions) : [],
		...runtime,
		...options?.extensions
	};

	const context = vm.createContext(sandbox);

	return (document: TSource): TResult | undefined => {

		sandbox.$input = document;
		sandbox.$result = undefined;

		script.runInContext(context);

		return sandbox.$result;
	};
};
