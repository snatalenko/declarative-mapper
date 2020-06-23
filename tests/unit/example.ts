import { createMapper } from '../../src';
import { expect } from 'chai';

describe('example', () => {

	it('works', () => {

		const map = createMapper({
			map: {
				title: '"Invoice 1"',
				items: {
					forEach: 'LINE_ITEMS',
					map: {
						code: 'itemCatalog.find(e => e.upc === UPC).vendorCode',
						qty: 'QTY',
						price: 'PRICE',
						amount: 'QTY * PRICE'
					}
				},
				total: 'LINE_ITEMS.reduce((sum, { QTY, PRICE }) => sum + (QTY * PRICE), 0)'
			}
		}, {
			extensions: {
				itemCatalog: [
					{ upc: '123', vendorCode: 'X-123' },
					{ upc: '456', vendorCode: 'X-456' }
				]
			}
		});

		const result = map({
			LINE_ITEMS: [
				{ UPC: '123', QTY: 1, PRICE: 3.4 },
				{ UPC: '456', QTY: 2, PRICE: 5.7 }
			]
		});

		expect(result).to.eql({
			title: 'Invoice 1',
			items: [
				{ code: 'X-123', qty: 1, price: 3.4, amount: 3.4 },
				{ code: 'X-456', qty: 2, price: 5.7, amount: 11.4 }
			],
			total: 14.8
		});
	});
});
