import { useContext, useEffect, useRef, type ComponentType } from 'react';
import { LabelsContext } from './LabelsContext.ts';
import type {
	AddPropertyInputProps,
	AddOptionButtonProps,
	CheckboxFieldSettingProps,
	CheckboxProps,
	ContainerProps,
	FieldLabelProps,
	MultipleTypeSelectorProps,
	RemoveButtonProps,
	RowProps,
	SchemaEditorComponents,
	SectionProps,
	SettingsButtonProps,
	SettingsGroupProps,
	TextareaFieldSettingProps,
	TextFieldSettingProps,
	TextInputProps,
	TypeSelectorProps
} from './types.ts';

export const DefaultContainer: ComponentType<ContainerProps> = ({ children }) => (
	<div className="dm-schema-editor-entries">{children}</div>
);

export const DefaultRow: ComponentType<RowProps> = ({
	name,
	title,
	description,
	typeSelector,
	requiredToggle,
	settings,
	remove,
	section
}) => (
	<>
		<div className="dm-schema-editor-row">
			{name}
			{title}
			{description}
			{typeSelector}
			<span className="dm-schema-editor-actions">
				{requiredToggle}
				{settings}
				{remove}
			</span>
		</div>
		{section}
	</>
);

export const DefaultSection: ComponentType<SectionProps> = ({ children }) => (
	<div className="dm-mapping-section">
		<div
			className="dm-mapping-section-body"
			style={{
				marginTop: '0.35rem',
				marginLeft: '0',
				padding: '0.5rem 0 0.5rem 0.75rem',
				borderLeft: '2px solid #e3e7ec'
			}}
		>
			{children}
		</div>
	</div>
);

export const DefaultTextInput: ComponentType<TextInputProps> = ({ value, onChange, placeholder, focusOnMount, readOnly }) => {
	const ref = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (focusOnMount)
			ref.current?.focus();
	}, [focusOnMount]);

	return (
		<input
			ref={ref}
			className="dm-schema-editor-input"
			value={value}
			onChange={e => onChange(e.target.value)}
			placeholder={placeholder}
			readOnly={readOnly}
		/>
	);
};

export const DefaultFieldLabel: ComponentType<FieldLabelProps> = ({ label }) => (
	<label className="dm-schema-editor-label">{label}</label>
);

export const DefaultTypeSelector: ComponentType<TypeSelectorProps> = ({ value, options, onChange, readOnly }) => (
	<select
		className="dm-schema-editor-type"
		value={value}
		onChange={e => {
			const option = options.find(current => current.value === e.target.value);
			if (option)
				onChange(option);
		}}
		disabled={readOnly}
	>
		{options.map(option => (
			<option key={option.value} value={option.value}>{option.label}</option>
		))}
	</select>
);

export const DefaultMultipleTypeSelector: ComponentType<MultipleTypeSelectorProps> = ({
	label,
	options,
	onChange,
	readOnly
}) => (
	<div className="dm-schema-editor-row dm-schema-editor-types">
		<span className="dm-schema-editor-label">{label}</span>
		<div className="dm-schema-editor-types-options" role="group" aria-label={label}>
			{options.map(option => (
				<label key={option.value}>
					<input
						type="checkbox"
						checked={option.checked}
						onChange={event => onChange(option.value, event.target.checked)}
						disabled={readOnly}
					/>
					<span>{option.label}</span>
				</label>
			))}
		</div>
	</div>
);

export const DefaultCheckbox: ComponentType<CheckboxProps> = ({ checked, onChange, label, readOnly }) => (
	<select
		className={`dm-schema-editor-required ${checked ? 'dm-schema-editor-required-on' : 'dm-schema-editor-required-off'}`}
		value={checked ? 'required' : 'optional'}
		onChange={e => onChange(e.target.value === 'required')}
		aria-label={label}
		title={label}
		disabled={readOnly}
	>
		<option value="optional">Optional</option>
		<option value="required">Required</option>
	</select>
);

export const DefaultSettingsButton: ComponentType<SettingsButtonProps> = ({ expanded, onClick }) => {
	const labels = useContext(LabelsContext);
	return (
		<button
			type="button"
			className="dm-schema-editor-settings-toggle"
			onClick={onClick}
			aria-expanded={expanded}
			aria-label={labels.settings}
			title={labels.settings}
		>
			{labels.settings}
		</button>
	);
};

export const DefaultSettingsGroup: ComponentType<SettingsGroupProps> = ({ children }) => (
	<div className="dm-schema-editor-settings">{children}</div>
);

export const DefaultTextFieldSetting: ComponentType<TextFieldSettingProps> = ({ field }) => (
	<label className="dm-schema-editor-setting">
		<span>{field.label}</span>
		<input
			className="dm-schema-editor-input"
			value={field.value}
			onChange={e => field.onChange(e.target.value)}
			placeholder={field.placeholder}
			readOnly={field.readOnly}
		/>
	</label>
);

export const DefaultCheckboxFieldSetting: ComponentType<CheckboxFieldSettingProps> = ({ field }) => (
	<label className="dm-schema-editor-setting">
		<input
			type="checkbox"
			checked={field.checked}
			onChange={e => field.onChange(e.target.checked)}
			disabled={field.readOnly}
		/>
		<span>{field.label}</span>
	</label>
);

export const DefaultTextareaFieldSetting: ComponentType<TextareaFieldSettingProps> = ({ field }) => (
	<label className="dm-schema-editor-setting">
		<span>{field.label}</span>
		<textarea
			className="dm-schema-editor-input"
			value={field.value}
			onChange={e => field.onChange(e.target.value)}
			placeholder={field.placeholder}
			readOnly={field.readOnly}
			rows={3}
		/>
	</label>
);

export const DefaultRemoveButton: ComponentType<RemoveButtonProps> = ({ onClick, label }) => {
	const labels = useContext(LabelsContext);
	return (
		<button
			type="button"
			className="dm-schema-editor-remove"
			onClick={onClick}
			aria-label={label ?? labels.removeProperty}
		>
			×
		</button>
	);
};

export const DefaultAddPropertyInput: ComponentType<AddPropertyInputProps> = ({ value, onChange, placeholder }) => (
	<div className="dm-schema-editor-row dm-schema-editor-template-row">
		<input
			className="dm-schema-editor-input"
			value={value}
			onChange={e => onChange(e.target.value)}
			placeholder={placeholder}
		/>
	</div>
);

export const DefaultAddOptionButton: ComponentType<AddOptionButtonProps> = ({ onClick }) => {
	const labels = useContext(LabelsContext);
	return (
		<button type="button" className="dm-schema-editor-add-option" onClick={onClick}>
			{labels.addOption}
		</button>
	);
};

export const defaultComponents: SchemaEditorComponents = {
	Container: DefaultContainer,
	Row: DefaultRow,
	Section: DefaultSection,
	TextInput: DefaultTextInput,
	FieldLabel: DefaultFieldLabel,
	TypeSelector: DefaultTypeSelector,
	MultipleTypeSelector: DefaultMultipleTypeSelector,
	RequirementControl: DefaultCheckbox,
	SettingsButton: DefaultSettingsButton,
	SettingsGroup: DefaultSettingsGroup,
	TextFieldSetting: DefaultTextFieldSetting,
	CheckboxFieldSetting: DefaultCheckboxFieldSetting,
	TextareaFieldSetting: DefaultTextareaFieldSetting,
	RemoveButton: DefaultRemoveButton,
	AddPropertyInput: DefaultAddPropertyInput,
	AddOptionButton: DefaultAddOptionButton
};
