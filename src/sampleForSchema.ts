import { JSONSchema4 } from 'json-schema';

/**
 * Create sample data for a given JSON schema
 */
export default function sampleForSchema(schema: JSONSchema4) {

	const {
		title,
		type,
		properties,
		items,
		minimum,
		exclusiveMinimum,
		maximum,
		exclusiveMaximum,
		minLength,
		maxLength
	} = schema;

	if (type === 'string') {
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
		if (!properties)
			throw new TypeError(`"properties" definition is empty in "${title || JSON.stringify(schema)}"`);

		const r = {};
		for (const [fieldName, fieldSchema] of Object.entries(properties))
			r[fieldName] = sampleForSchema(fieldSchema);

		return r;
	}
	else if (type === 'array') {
		if (!items)
			throw new TypeError(`"items" definition is empty in "${title || JSON.stringify(schema)}"`);

		if (Array.isArray(items)) {
			return items.map(sampleForSchema)
		}
		else {
			if (schema.minItems !== undefined)
				return Array.from({ length: schema.minItems }, () => sampleForSchema(items));

			return [sampleForSchema(items)];
		}
	}
	else {
		throw new TypeError(`Unexpected type "${type}" in "${title || JSON.stringify(schema)}"`);
	}
}
