import type { JsonSchema } from '../JsonSchema.ts';

export const jsonSchemaTypes = [
	'string',
	'number',
	'integer',
	'boolean',
	'object',
	'array',
	'null'
] as const;

export type JsonSchemaType = typeof jsonSchemaTypes[number];

export function isJsonSchemaType(type: string): type is JsonSchemaType {
	return jsonSchemaTypes.some(current => current === type);
}

export function schemaTypes(schema: JsonSchema): JsonSchemaType[] {
	let types: string[] = [];
	if (Array.isArray(schema.type))
		types = schema.type;
	else if (schema.type !== undefined)
		types = [schema.type];

	return types.filter(isJsonSchemaType);
}

export function hasMultipleSchemaTypes(schema: JsonSchema): boolean {
	return schemaTypes(schema).filter(type => type !== 'null').length > 1;
}

export function withSchemaTypes(schema: JsonSchema, types: JsonSchemaType[]): JsonSchema {
	const uniqueTypes = jsonSchemaTypes.filter(type => types.includes(type));
	const next: JsonSchema = { ...schema };

	if (uniqueTypes.length === 0)
		delete next.type;
	else if (uniqueTypes.length === 1)
		next.type = uniqueTypes[0];
	else
		next.type = uniqueTypes;

	if (uniqueTypes.includes('object')) {
		next.properties = next.properties ?? {};
	}
	else {
		delete next.properties;
		delete next.required;
	}

	if (uniqueTypes.includes('array'))
		next.items = next.items ?? {};
	else
		delete next.items;

	if (!uniqueTypes.includes('string'))
		delete next.format;

	return next;
}
