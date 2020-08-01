'use strict';

import { JSONSchema4 } from 'json-schema';

const isObject = v => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

function getUniqueValues<TElement>(arr: TElement[]): TElement[] {
	const kvPairs: [string, TElement][] = arr.map(el => [
		JSON.stringify(el),
		el
	]);
	return Array.from(new Map(kvPairs).values());
};

export default function mergeSchema(dest: JSONSchema4, src: JSONSchema4): JSONSchema4 {
	for (const key of Object.keys(src)) {
		if (isObject(src[key]) && isObject(dest[key]))
			dest[key] = mergeSchema(dest[key], src[key]);
		else if (Array.isArray(src[key]) && Array.isArray(dest[key]))
			dest[key] = getUniqueValues([...dest[key], ...src[key]]);
		else
			dest[key] = src[key];
	}
	return dest;
};
