import { TPropertiesMap, TRootMapping, TArrayMapping, TObjectInContextMapping, TObjectMapping } from './TMapping';

function* propertiesMapToJs(map: TPropertiesMap, level: number = 0) {

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

function* mappingToJs(mapping: TRootMapping, level: number = 0) {

	const prefix = '  '.repeat(level);

	if (!Array.isArray(mapping) && 'forEach' in mapping) {
		const { forEach, map } = mapping as TArrayMapping;
		if (!forEach)
			throw new TypeError(`Property "forEach" is empty in mapping "${JSON.stringify(mapping)}"`);
		if (!map)
			throw new TypeError(`Property "map" is empty in mapping "${JSON.stringify(mapping)}"`);

		yield `${prefix}  ${forEach}.map(($record, $index, $collection) => {`
		yield `${prefix}    with ($record) {`
		yield* propertiesMapToJs(map, level + 2);
		yield `${prefix}    }`;
		yield `${prefix}  })`;
	}
	else if ('from' in mapping) {
		const { from, map } = mapping as TObjectInContextMapping;
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
	else if (!Array.isArray(mapping) && 'map' in mapping && Object.keys(mapping).length === 1) {
		const { map } = mapping as TObjectMapping;
		if (!map)
			throw new TypeError(`Property "map" is empty in mapping "${JSON.stringify(mapping)}"`);

		yield `${prefix}  (() => {`;
		yield* propertiesMapToJs(map, level + 1);
		yield `${prefix}  })()`;
	}
	else {
		const map = mapping as TPropertiesMap;

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
export default function createScript(map: TRootMapping) {
	return `
with ($createGlobalContext($input)) {
  $result =
${Array.from(mappingToJs(map, 1)).join('\n')}
}`;
}
