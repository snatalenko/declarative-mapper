import type {
	PropertiesMap,
	RootMapping,
	ArrayMapping,
	ObjectInContextMapping,
	ObjectMapping
} from './mappingTypes.ts';

function* propertiesMapToJs(map: PropertiesMap, level: number = 0) {

	const prefix = '  '.repeat(level);
	const keys = Object.keys(map);
	const isRootElementMapping = keys.length === 1 && keys[0] === '*';
	if (isRootElementMapping) {
		yield `${prefix}  return ${map[keys[0]] || null};`;
		return;
	}

	const isArray = keys.length && keys.every(k => k && !isNaN(Number(k)));

	if (isArray)
		yield `${prefix}  return Object.assign([], {`;
	else
		yield `${prefix}  return {`;

	for (const [fieldName, mappingInstruction] of Object.entries(map)) {
		const quotedFieldName = `'${fieldName.replace(/'/g, '\\\'')}'`;

		if (typeof mappingInstruction === 'string') {
			yield `${prefix}    ${quotedFieldName}: ${mappingInstruction || 'null'},`
		}
		else {
			yield `${prefix}    ${quotedFieldName}: `;
			yield* mappingToJs(mappingInstruction, level + 2);
			yield ','
		}
	}

	if (isArray)
		yield `${prefix}  });`;
	else
		yield `${prefix}  };`;
}

function* mappingToJs(mapping: RootMapping, level: number = 0) {

	const prefix = '  '.repeat(level);

	const mappingKeys = Object.keys(mapping);

	if (mappingKeys.length === 2 && mappingKeys.includes('forEach') && mappingKeys.includes('map')) {
		const { forEach, map } = mapping as ArrayMapping;
		if (!forEach)
			throw new TypeError(`Property "forEach" is empty in mapping "${JSON.stringify(mapping)}"`);
		if (!map)
			throw new TypeError(`Property "map" is empty in mapping "${JSON.stringify(mapping)}"`);

		yield `${prefix}  ${forEach}?.map(($record, $index, $collection) => {`
		yield `${prefix}    with ($record) {`
		yield* propertiesMapToJs(map, level + 2);
		yield `${prefix}    }`;
		yield `${prefix}  })`;
	}
	else if (mappingKeys.length === 2 && mappingKeys.includes('from') && mappingKeys.includes('map')) {
		const { from, map } = mapping as ObjectInContextMapping;
		if (!from)
			throw new TypeError(`Property "from" is empty in mapping "${JSON.stringify(mapping)}"`);
		if (!map)
			throw new TypeError(`Property "map" is empty in mapping "${JSON.stringify(mapping)}"`);

		yield `${prefix}  (() => {`;
		yield `${prefix}    var $context = ${from} ?? {};`;
		yield `${prefix}    with ($context) {`
		yield* propertiesMapToJs(map, level + 2);
		yield `${prefix}    }`;
		yield `${prefix}  })()`;
	}
	else if (mappingKeys.length === 1 && mappingKeys.includes('map')) {
		const { map } = mapping as ObjectMapping;
		if (!map)
			throw new TypeError(`Property "map" is empty in mapping "${JSON.stringify(mapping)}"`);

		yield `${prefix}  (() => {`;
		yield* propertiesMapToJs(map, level + 1);
		yield `${prefix}  })()`;
	}
	else {
		const map = mapping as PropertiesMap;

		yield `${prefix}  (() => {`;
		yield* propertiesMapToJs(map, level + 1);
		yield `${prefix}  })()`;
	}
}

/**
 * Transform declarative map to JS code
 * 
 * @param map Instructions for object mapping
 */
export default function createScript(map: RootMapping) {
	return `
with ($createGlobalContext($input)) {
  $result =
${Array.from(mappingToJs(map, 1)).join('\n')}
}`;
}
