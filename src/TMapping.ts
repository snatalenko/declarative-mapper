export type TValueMap = string | TObjectMapping | TArrayMapping | TObjectInContextMapping | TPropertiesMap;

export type TPropertiesMap = {
	[fieldName: string]: TValueMap
} | Array<TValueMap>;

export type TObjectMapping = {
	map: TPropertiesMap
}

export type TArrayMapping = {
	forEach: string,
	map: TPropertiesMap
}

export type TObjectInContextMapping = {
	from: string,
	map: TPropertiesMap
}

export type TRootMapping = TObjectMapping | TArrayMapping | TObjectInContextMapping | TPropertiesMap;
