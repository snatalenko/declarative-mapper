const GLOBAL_PROPERTIES = [
	'Object',
	'Function',
	'Array',
	'Number',
	'Boolean',
	'String',
	'Math',
	'$input',
	'$result'
]

export default function $globalContext(context: object, extensionNames?: string[]): any {
	return new Proxy(context, {
		has(target: object, key: string) {
			return !GLOBAL_PROPERTIES.includes(key)
				&& !extensionNames?.includes(key);
		},
		get(target: object, key: string, receiver: object) {
			if (key in target)
				return target[key];

			return undefined;
		}
	})
}
