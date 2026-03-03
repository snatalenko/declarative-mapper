export type ValueMap = string | ObjectMapping | ArrayMapping | ObjectInContextMapping | PropertiesMap;

export type PropertiesMap = {
	[fieldName: string]: ValueMap
} | Array<ValueMap>;

export type ObjectMapping = {
	map: PropertiesMap
}

export type ArrayMapping = {
	forEach: string,
	map: PropertiesMap
}

export type ObjectInContextMapping = {
	from: string,
	map: PropertiesMap
}

export type RootMapping = ObjectMapping | ArrayMapping | ObjectInContextMapping | PropertiesMap;
