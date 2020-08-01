import { TPropertiesMap, TValueMap } from "./TMapping";
import { JSONSchema4 } from 'json-schema';
import { default as sampleForSchema } from './sampleForSchema';
import { default as mergeSchema } from './utils/mergeSchema';

function getObjectFields(obj: { [k: string]: JSONSchema4 }): TPropertiesMap {
	const map: TPropertiesMap = {};
	for (const [fieldName, fieldSchema] of Object.entries(obj)) {
		if (fieldSchema.readOnly)
			continue;

		map[fieldName] = mappingForSchema(fieldSchema);
	}
	return map;
}

/**
 * Create mapping template for a given JSON schema
 */
export default function mappingForSchema(schema: JSONSchema4): TValueMap {

	const { title, type, properties, items, allOf, anyOf, oneOf } = schema;

	if (allOf) {
		const combinedSchema = allOf.reduce(mergeSchema);
		return mappingForSchema(combinedSchema);
	}
	else if (anyOf) {
		return mappingForSchema(anyOf[0]);
	}
	else if (oneOf) {
		return mappingForSchema(oneOf[0]);
	}
	else if (type === 'object') {
		return {
			map: getObjectFields(properties || {})
		};
	}
	else if (type === 'array') {
		if (Array.isArray(items)) {
			const map: TPropertiesMap = {};
			items.forEach((item, index) => {
				map[index] = mappingForSchema(item);
			});
			return { map };
		}
		else {
			const itemsMapping = items ? mappingForSchema(items) : '';
			return {
				forEach: '',
				map: typeof itemsMapping === 'object' && 'map' in itemsMapping ?
					itemsMapping.map :
					{ '*': itemsMapping }
			};
		}
	}
	else if (type === 'boolean' || type === 'integer' || type === 'null' || type === 'number' || type === 'string') {
		return JSON.stringify(sampleForSchema(schema));
	}
	else {
		throw new TypeError(`Unexpected type "${type}" in "${title || JSON.stringify(schema)}"`);
	}
}
