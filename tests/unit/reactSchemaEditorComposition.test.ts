import { expect } from 'chai';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEditor } from '../../src/react-schema-editor/index.ts';
import bootstrap34 from '../../src/react-schema-editor/bootstrap34/index.tsx';
import bootstrap53 from '../../src/react-schema-editor/bootstrap53/index.tsx';
import {
	addCompositionBranch,
	getCompositionKeyword,
	removeCompositionBranch,
	selectComposition,
	unwrapComposition,
	updateCompositionBranch
} from '../../src/react-schema-editor/composition.ts';

describe('React schema editor composition', () => {
	it('renders composition in the type selector', () => {
		const markup = renderToStaticMarkup(createElement(SchemaEditor, {
			value: {
				oneOf: [
					{ title: 'Person', type: 'object', properties: { name: { type: 'string' } } },
					{ title: 'Company', type: 'object', properties: { registration: { type: 'string' } } }
				]
			},
			readOnly: true
		}));

		expect(markup).to.contain('<option value="oneOf" selected="">One of</option>');
		expect(markup).to.contain('One of');
		expect(markup).to.contain('Person');
		expect(markup).to.contain('Company');
		expect(markup).to.contain('name');
		expect(markup).to.contain('registration');
	});

	it('orders composition types as One of, Any of, All of', () => {
		const markup = renderToStaticMarkup(createElement(SchemaEditor, { value: {} }));

		expect(markup.indexOf('>One of</option>')).to.be.lessThan(markup.indexOf('>Any of</option>'));
		expect(markup.indexOf('>Any of</option>')).to.be.lessThan(markup.indexOf('>All of</option>'));
	});

	it('renders all composition keywords recursively', () => {
		const markup = renderToStaticMarkup(createElement(SchemaEditor, {
			value: {
				allOf: [{
					anyOf: [{ type: 'string' }, { oneOf: [{ type: 'number' }, { type: 'integer' }] }]
				}]
			},
			readOnly: true
		}));

		expect(markup).to.contain('All of');
		expect(markup).to.contain('Any of');
		expect(markup).to.contain('One of');
	});

	it('renders Add option after the composition branches', () => {
		const markup = renderToStaticMarkup(createElement(SchemaEditor, {
			value: { anyOf: [{ type: 'string' }] }
		}));

		expect(markup).to.contain('dm-schema-editor-add-option');
		expect(markup.indexOf('Option 1')).to.be.lessThan(markup.indexOf('Add option'));
	});

	for (const [theme, components] of [['Bootstrap 3.4', bootstrap34], ['Bootstrap 5.3', bootstrap53]] as const) {
		it(`renders Add option with ${theme} components`, () => {
			const markup = renderToStaticMarkup(createElement(SchemaEditor, {
				value: { oneOf: [{ type: 'string' }] },
				components
			}));

			expect(markup).to.contain('Add option');
		});
	}

	it('adds an option with the last option type without copying its constraints', () => {
		const schema = addCompositionBranch({ title: 'Value', oneOf: [{ type: 'string' }] }, 'oneOf');

		expect(schema).to.eql({ title: 'Value', oneOf: [{ type: 'string' }, { type: 'string' }] });
	});

	it('preserves a nullable type when adding an option', () => {
		const schema = addCompositionBranch({ anyOf: [{ type: ['object', 'null'], minProperties: 1 }] }, 'anyOf');

		expect(schema).to.eql({
			anyOf: [
				{ type: ['object', 'null'], minProperties: 1 },
				{ type: ['object', 'null'] }
			]
		});
	});

	it('adds an unspecified option when the last option has no type', () => {
		const schema = addCompositionBranch({ allOf: [{ description: 'Untyped option' }] }, 'allOf');

		expect(schema).to.eql({ allOf: [{ description: 'Untyped option' }, {}] });
	});

	it('moves the existing schema into the first branch when selecting composition', () => {
		const schema = selectComposition({
			type: 'object',
			properties: { id: { type: 'string' } },
			required: ['id']
		}, 'oneOf');

		expect(schema).to.eql({
			oneOf: [{
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}]
		});
	});

	it('changes composition mode without changing its branches', () => {
		const schema = selectComposition({ oneOf: [{ type: 'string' }, { type: 'number' }] }, 'anyOf');

		expect(schema).to.eql({ anyOf: [{ type: 'string' }, { type: 'number' }] });
		expect(getCompositionKeyword(schema)).to.equal('anyOf');
	});

	it('unwraps the first branch when returning to a regular type', () => {
		const schema = unwrapComposition({
			title: 'Value',
			allOf: [{ type: 'object', properties: { id: { type: 'string' } } }, { required: ['id'] }]
		}, 'allOf');

		expect(schema).to.eql({
			title: 'Value',
			type: 'object',
			properties: { id: { type: 'string' } }
		});
	});

	it('updates only the selected branch', () => {
		const schema = updateCompositionBranch({
			anyOf: [{ type: 'string' }, { type: 'number' }]
		}, 'anyOf', 1, { type: 'integer' });

		expect(schema.anyOf).to.eql([{ type: 'string' }, { type: 'integer' }]);
	});

	it('preserves boolean schemas when updating another branch', () => {
		const schema = updateCompositionBranch({ allOf: [true, false] }, 'allOf', 1, { type: 'boolean' });

		expect(schema.allOf).to.eql([true, { type: 'boolean' }]);
	});

	it('removes the composition keyword with its last branch', () => {
		const schema = removeCompositionBranch({ type: 'string', oneOf: [{ maxLength: 5 }] }, 'oneOf', 0);

		expect(schema).to.eql({ type: 'string' });
	});
});
