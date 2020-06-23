import { TPropertiesMap, TRootMapping } from './TMapping';

function* propertiesMapToJs(map: TPropertiesMap, level: number = 0) {

	const isArray = Object.keys(map).every(k => k && !isNaN(Number(k)));
	const prefix = '  '.repeat(level);

	if (isArray)
		yield `${prefix}    return Object.assign([], {`;
	else
		yield `${prefix}    return {`;

	for (const [fieldName, mappingInstruction] of Object.entries(map)) {
		if (typeof mappingInstruction === 'string') {
			yield `${prefix}      ${fieldName}: ${mappingInstruction || 'null'},`
		}
		else {
			yield `${prefix}      ${fieldName}: `;
			yield* mappingToJs(mappingInstruction, level + 3);
			yield ','
		}
	}

	if(isArray)
		yield `${prefix}    });`;
	else 
		yield `${prefix}    };`;
}

function* mappingToJs(mapping: TRootMapping, level: number = 0) {

	const prefix = '  '.repeat(level);

	if ('forEach' in mapping) {
		yield `${prefix}  ${mapping.forEach}.map(($record, $index, $collection) => {`
		yield `${prefix}    with ($record) {`
		yield* propertiesMapToJs(mapping.map, level + 1);
		yield `${prefix}    }`;
		yield `${prefix}  })`;
	}
	else if ('from' in mapping) {
		yield `${prefix}  (() => {`;
		yield `${prefix}    with (${mapping.from}) {`
		yield* propertiesMapToJs(mapping.map, level + 1);
		yield `${prefix}    }`;
		yield `${prefix}  })()`;
	}
	else {
		yield `${prefix}  (() => {`;
		yield* propertiesMapToJs(mapping.map, level + 1);
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
with ($globalContext($input, $extensionNames)) {
  $result =
  ${Array.from(mappingToJs(map)).join('\n')}
}`;
}
