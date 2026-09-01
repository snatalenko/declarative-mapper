import type { JsonSchema } from '../JsonSchema.ts';
import type { CompositionKeyword, SchemaProperty } from './types.ts';

export const compositionKeywords: CompositionKeyword[] = ['oneOf', 'anyOf', 'allOf'];

export function getCompositionKeyword(schema: JsonSchema): CompositionKeyword | undefined {
	return compositionKeywords.find(keyword => !!schema[keyword]?.length);
}

export function selectComposition(schema: JsonSchema, keyword: CompositionKeyword): JsonSchema {
	const currentKeyword = getCompositionKeyword(schema);
	if (!currentKeyword)
		return { [keyword]: [schema] };
	if (currentKeyword === keyword || schema[keyword]?.length)
		return schema;

	const next = { ...schema, [keyword]: schema[currentKeyword] };
	delete next[currentKeyword];
	return next;
}

export function unwrapComposition(schema: JsonSchema, keyword: CompositionKeyword): JsonSchema {
	const branches = schema[keyword] ?? [];
	const firstBranch = branches[0];
	const next = { ...schema };
	delete next[keyword];

	return typeof firstBranch === 'object' && firstBranch !== null
		? { ...next, ...firstBranch }
		: next;
}

export function addCompositionBranch(schema: JsonSchema, keyword: CompositionKeyword): JsonSchema {
	const branches = schema[keyword] ?? [];
	const lastBranch = branches.at(-1);
	const type = typeof lastBranch === 'object' && lastBranch !== null ? lastBranch.type : undefined;
	const branch = type === undefined ? {} : { type: Array.isArray(type) ? [...type] : type };
	return {
		...schema,
		[keyword]: [...branches, branch]
	};
}

export function updateCompositionBranch(
	schema: JsonSchema,
	keyword: CompositionKeyword,
	index: number,
	branch: SchemaProperty
): JsonSchema {
	const branches = [...(schema[keyword] ?? [])];
	branches[index] = branch;
	return { ...schema, [keyword]: branches };
}

export function removeCompositionBranch(schema: JsonSchema, keyword: CompositionKeyword, index: number): JsonSchema {
	const branches = (schema[keyword] ?? []).filter((_, branchIndex) => branchIndex !== index);
	const next = { ...schema };
	if (branches.length)
		next[keyword] = branches;
	else
		delete next[keyword];

	return next;
}
