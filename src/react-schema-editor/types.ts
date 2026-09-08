import type { ComponentType, ReactNode } from 'react';
import type { JsonSchema } from '../JsonSchema.ts';

export type { JsonSchema } from '../JsonSchema.ts';

export type SchemaType = 'unspecified' | 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';
export type CompositionKeyword = 'allOf' | 'anyOf' | 'oneOf';

export interface ContainerProps {
	children: ReactNode;
}

export interface RowProps {
	name: ReactNode;
	title?: ReactNode;
	description?: ReactNode;
	typeSelector: ReactNode;
	requiredToggle: ReactNode;
	settings: ReactNode;
	remove: ReactNode;
	section?: ReactNode;
}

export interface SectionProps {
	children: ReactNode;
}

export interface TextInputProps {
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
	focusOnMount?: boolean;
	readOnly?: boolean;
}

export interface FieldLabelProps {
	label: string;
}

export interface TypeSelectorOption {
	value: string;
	label: string;
	type: SchemaType;
	format?: string;
	enum?: boolean;
	multiple?: boolean;
	composition?: CompositionKeyword;
}

export interface TypeSelectorProps {
	value: string;
	options: TypeSelectorOption[];
	onChange: (next: TypeSelectorOption) => void;
	readOnly?: boolean;
}

export interface MultipleTypeSelectorOption {
	value: string;
	label: string;
	checked: boolean;
}

export interface MultipleTypeSelectorProps {
	label: string;
	options: MultipleTypeSelectorOption[];
	onChange: (value: string, checked: boolean) => void;
	readOnly?: boolean;
}

export interface CheckboxProps {
	checked: boolean;
	onChange: (next: boolean) => void;
	label: string;
	readOnly?: boolean;
}

export interface RemoveButtonProps {
	onClick: () => void;
	label?: string;
}

export interface SettingsButtonProps {
	expanded: boolean;
	onClick: () => void;
}

export interface AddPropertyInputProps {
	value: string;
	onChange: (next: string) => void;
	placeholder: string;
	exposeTitle?: boolean;
	exposeDescription?: boolean;
}

export interface AddOptionButtonProps {
	onClick: () => void;
}

export interface SchemaTextSettingField {
	key: string;
	label: string;
	type?: 'text';
	value: string;
	placeholder?: string;
	readOnly?: boolean;
	onChange: (next: string) => void;
}

export interface SchemaCheckboxSettingField {
	key: string;
	label: string;
	type: 'checkbox';
	checked: boolean;
	readOnly?: boolean;
	onChange: (next: boolean) => void;
}

export interface SchemaTextareaSettingField {
	key: string;
	label: string;
	type: 'textarea';
	value: string;
	placeholder?: string;
	readOnly?: boolean;
	onChange: (next: string) => void;
}

export type SchemaSettingField = SchemaTextSettingField | SchemaCheckboxSettingField | SchemaTextareaSettingField;

export interface SettingsGroupProps {
	children: ReactNode;
}

export interface TextFieldSettingProps {
	field: SchemaTextSettingField;
}

export interface CheckboxFieldSettingProps {
	field: SchemaCheckboxSettingField;
}

export interface TextareaFieldSettingProps {
	field: SchemaTextareaSettingField;
}

export interface SchemaEditorLabels {
	title: string;
	propertyName: string;
	description: string;
	format: string;
	examples: string;
	required: string;
	settings: string;
	nullable: string;
	removeProperty: string;
	addProperty: string;
	allOf: string;
	anyOf: string;
	oneOf: string;
	option: string;
	addOption: string;
	removeOption: string;
	rootElement: string;
	arrayItem: string;
	unspecifiedType: string;
	multipleTypes: string;
	types: string;
	minimum: string;
	maximum: string;
	exclusiveMinimum: string;
	exclusiveMaximum: string;
	multipleOf: string;
	minLength: string;
	maxLength: string;
	pattern: string;
	enum: string;
	minItems: string;
	maxItems: string;
	minProperties: string;
	maxProperties: string;
}

export interface SchemaEditorComponents {
	Container: ComponentType<ContainerProps>;
	Row: ComponentType<RowProps>;
	Section: ComponentType<SectionProps>;
	TextInput: ComponentType<TextInputProps>;
	FieldLabel: ComponentType<FieldLabelProps>;
	TypeSelector: ComponentType<TypeSelectorProps>;
	MultipleTypeSelector: ComponentType<MultipleTypeSelectorProps>;
	RequirementControl: ComponentType<CheckboxProps>;
	SettingsButton: ComponentType<SettingsButtonProps>;
	SettingsGroup: ComponentType<SettingsGroupProps>;
	TextFieldSetting: ComponentType<TextFieldSettingProps>;
	CheckboxFieldSetting: ComponentType<CheckboxFieldSettingProps>;
	TextareaFieldSetting: ComponentType<TextareaFieldSettingProps>;
	RemoveButton: ComponentType<RemoveButtonProps>;
	AddPropertyInput: ComponentType<AddPropertyInputProps>;
	AddOptionButton: ComponentType<AddOptionButtonProps>;
}

export type SchemaProperty = JsonSchema | boolean;
