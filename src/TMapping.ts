export type TPropertiesMap = {
	[fieldName: string]: string | TObjectMapping | TArrayMapping | TObjectInContextMapping
}

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

export type TRootMapping = TObjectMapping | TArrayMapping | TObjectInContextMapping;
