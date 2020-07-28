import { JSONSchema4 } from 'json-schema';

/**
 * Create sample data for a given JSON schema
 */
export default function sampleForSchema(schema: JSONSchema4) {

	const {
		title,
		type,
		properties,
		additionalProperties,
		items,
		minimum,
		exclusiveMinimum,
		maximum,
		exclusiveMaximum,
		minLength,
		maxLength,
		example,
		default: defaultValue,
		allOf,
		anyOf,
		oneOf
	} = schema;

	if (example)
		return example;

	if (defaultValue)
		return defaultValue;

	if (allOf) {
		const combinedSchema = allOf.reduce((c, el) => ({ ...c, ...el }));
		return sampleForSchema(combinedSchema);
	}
	else if (anyOf) {
		return sampleForSchema(anyOf[0]);
	}
	else if (oneOf) {
		return sampleForSchema(oneOf[0]);
	}
	else if (type === 'string') {
		if (schema.enum && typeof schema.enum[0] === 'string')
			return schema.enum[0];

		return minLength ?
			'text'.padEnd(minLength, 'text') :
			'text'.substr(0, maxLength !== undefined ? maxLength : 4);
	}
	else if (type === 'boolean') {
		return true;
	}
	else if (type === 'integer' || type === 'number') {
		const diff = type === 'integer' ? 1 : 0.01;
		if (minimum !== undefined) {
			return exclusiveMinimum ?
				minimum + diff :
				minimum;
		}
		else if (maximum !== undefined) {
			return exclusiveMaximum ?
				maximum - diff :
				maximum;
		}
		return 1;
	}
	else if (type === 'null') {
		return null;
	}
	else if (type === 'object') {
		const r = {};
		for (const [fieldName, fieldSchema] of Object.entries(properties || {}))
			r[fieldName] = sampleForSchema(fieldSchema);

		if (typeof additionalProperties === 'object' && additionalProperties)
			r['additionalProp1'] = sampleForSchema(additionalProperties);

		return r;
	}
	else if (type === 'array') {
		if (Array.isArray(items)) {
			return items.map(sampleForSchema)
		}
		else if(items) {
			if (schema.minItems !== undefined)
				return Array.from({ length: schema.minItems }, () => sampleForSchema(items));

			return [sampleForSchema(items)];
		}
		else {
			return [];
		}
	}
	else {
		throw new TypeError(`Unexpected type "${type}" in "${title || JSON.stringify(schema)}"`);
	}
}
