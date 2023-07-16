
export { default as createMapper } from './createMapper';
export { default as mappingForSchema } from './mappingForSchema';
export { default as sampleForSchema } from './sampleForSchema';
export * from './TMapping';

// @ts-ignore
import * as schema from '../schemas/mapping.json';
export { schema as mappingSchema };
