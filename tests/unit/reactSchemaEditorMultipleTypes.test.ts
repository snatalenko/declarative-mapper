import { expect } from 'chai';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEditor } from '../../src/react-schema-editor/index.ts';
import bootstrap34 from '../../src/react-schema-editor/bootstrap34/index.tsx';
import bootstrap53 from '../../src/react-schema-editor/bootstrap53/index.tsx';
import { DefaultMultipleTypeSelector } from '../../src/react-schema-editor/defaultComponents.tsx';
import {
	hasMultipleSchemaTypes,
	schemaTypes,
	withSchemaTypes
} from '../../src/react-schema-editor/multipleTypes.ts';

describe('React schema editor multiple types', () => {
	it('renders multiple non-null types as a distinct editor mode with its settings collapsed', () => {
		const markup = renderToStaticMarkup(createElement(SchemaEditor, {
			value: { type: ['string', 'number'] },
			readOnly: true
		}));

		expect(markup).to.contain('<option value="multiple" selected="">Multiple types</option>');
		expect(markup).to.not.contain('dm-schema-editor-types-options');
	});

	it('keeps a nullable single type in the regular editor flow', () => {
		const markup = renderToStaticMarkup(createElement(SchemaEditor, {
			value: { type: ['string', 'null'] },
			readOnly: true
		}));

		expect(markup).to.contain('<option value="string" selected="">String</option>');
		expect(markup).to.not.contain('<option value="multiple" selected="">');
		expect(markup).to.not.contain('dm-schema-editor-types-options');
	});

	it('renders the type checklist as one settings row', () => {
		const markup = renderToStaticMarkup(createElement(DefaultMultipleTypeSelector, {
			label: 'Types',
			options: [
				{ value: 'string', label: 'String', checked: true },
				{ value: 'number', label: 'Number', checked: false }
			],
			onChange: () => {},
			readOnly: true
		}));

		expect(markup).to.contain(
			'<div class="dm-schema-editor-row dm-schema-editor-types"><span class="dm-schema-editor-label">Types</span>'
		);
		expect(markup).to.contain('<label><input type="checkbox" disabled="" checked=""/><span>String</span></label>');
		expect(markup).to.contain('<label><input type="checkbox" disabled=""/><span>Number</span></label>');
	});

	it('renders object properties and array items in the same schema', () => {
		const markup = renderToStaticMarkup(createElement(SchemaEditor, {
			value: {
				type: ['object', 'array'],
				properties: { id: { type: 'string' } },
				items: { type: 'number' }
			},
			readOnly: true
		}));

		expect(markup).to.contain('id');
		expect(markup).to.contain('Array Item');
		expect(markup).to.not.contain('dm-schema-editor-types-options');
	});

	for (const [theme, components] of [['Bootstrap 3.4', bootstrap34], ['Bootstrap 5.3', bootstrap53]] as const) {
		it(`renders the type checklist as one settings row with ${theme} components`, () => {
			const MultipleTypeSelector = components.MultipleTypeSelector;
			if (!MultipleTypeSelector)
				throw new TypeError('Missing MultipleTypeSelector');

			const markup = renderToStaticMarkup(createElement(MultipleTypeSelector, {
				label: 'Types',
				options: [{ value: 'string', label: 'String', checked: true }],
				onChange: () => {}
			}));

			expect(markup).to.contain('aria-label="Types"');
			expect(markup).to.contain('>Types</label>');
			expect(markup).to.contain('type="checkbox"');
		});
	}

	it('recognizes multiple non-null types independently of nullability', () => {
		expect(hasMultipleSchemaTypes({ type: ['string', 'number', 'null'] })).to.equal(true);
		expect(hasMultipleSchemaTypes({ type: ['string', 'null'] })).to.equal(false);
		expect(schemaTypes({ type: ['number', 'string'] })).to.eql(['number', 'string']);
	});

	it('adds structural defaults and writes types in a stable order', () => {
		const schema = withSchemaTypes({ minLength: 1 }, ['array', 'string', 'object']);

		expect(schema).to.eql({
			minLength: 1,
			type: ['string', 'object', 'array'],
			properties: {},
			items: {}
		});
	});

	it('removes structural keywords when their types are removed', () => {
		const schema = withSchemaTypes({
			type: ['string', 'object', 'array'],
			format: 'date',
			properties: { id: { type: 'string' } },
			required: ['id'],
			items: { type: 'number' }
		}, ['number', 'null']);

		expect(schema).to.eql({ type: ['number', 'null'] });
	});

	it('collapses zero and one selected types to canonical schemas', () => {
		expect(withSchemaTypes({ type: ['string', 'number'] }, ['boolean'])).to.eql({ type: 'boolean' });
		expect(withSchemaTypes({ type: 'string' }, [])).to.eql({});
	});
});
