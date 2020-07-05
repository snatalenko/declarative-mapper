Declarative Mapper for NodeJS
=============================

[![](https://github.com/snatalenko/declarative-mapper/workflows/Tests/badge.svg)](https://github.com/snatalenko/declarative-mapper/actions)
[![Coverage Status](https://coveralls.io/repos/github/snatalenko/declarative-mapper/badge.svg?branch=master)](https://coveralls.io/github/snatalenko/declarative-mapper?branch=master)

## Reasoning

- **Declarative** - to allow mapping configuration from user interface
- **Flexible** - run JS underneath to allow any kind of instructions
- **Secure** - run in own context and restrict access to outside environment
- **Fast** - to map hundreds of thousands documents within a second
- **Typed** - for less errors and easier mapping with intellisense


## Getting Started

A simple example:

```ts
import { createMapper } from 'declarative-mapper';
import { expect } from 'chai';

// Convert declarative instructions to a pre-compiled
// function that can be executed any number of times
const mapper = createMapper({
  foo: 'bar'
});

// Run the mapping on some input
const result = mapper({
  bar: 'baz'
});

expect(result).to.eql({
  foo: 'baz'
});
```

More advanced one:

```ts
// Some kind of a document we expect on input
const input = {
  LINE_ITEMS: [
    { UPC: '123', QTY: 1, PRICE: 3.4 },
    { UPC: '456', QTY: 2, PRICE: 5.7 }
  ],
  ALLOWANCES: [
    { ITEM_UPC: '123', AMOUNT: 1.5 }
  ]
};

// Additional information we want to pass to the mapping environment
const itemCatalog = [
  { upc: '123', vendorCode: 'X-123' },
  { upc: '456', vendorCode: 'X-456' }
];

// Some format we need
const desiredOutput = {
  title: 'Invoice 1',
  items: [
    {
      code: 'X-123',
      qty: 1,
      price: 3.4,
      amount: 3.4,
      allowances: [1.5]
    },
    {
      code: 'X-456',
      qty: 2,
      price: 5.7,
      amount: 11.4,
      allowances: []
    }
  ],
  total: 14.8
};


// Declarative instructions on how to convert the input format
// to the desired format
const mapping = {
  // mapping to a constant
  title: '"Invoice 1"',

  // array mapping from another array
  items: {
    forEach: 'LINE_ITEMS',
    map: {
      // data lookup from an additional source passed to `extensions`
      code: 'itemCatalog.find(e => e.upc === UPC).vendorCode',
      
      // fields mapping in a context of `LINE_ITEMS` elements
      qty: 'QTY',
      price: 'PRICE',
      amount: 'QTY * PRICE',

      // data mapping from a source different from the current mapping context
      // (ALLOWANCES are placed next to LINE_ITEMS in the input)
      allowances: {
        forEach: 'ALLOWANCES.filter(a => a.ITEM_UPC === UPC)',
        map: {
          '*': 'AMOUNT'
        }
      }
    }
  },

  // property mapping from an array
  total: 'LINE_ITEMS.reduce((sum, { QTY, PRICE }) => sum + (QTY * PRICE), 0)'
};

// Pre-compiled function that can be executed any number of times
const mapper = createMapper(mapping, {
  extensions: {
    itemCatalog
  }
});

const result = mapper(input);

expect(result).to.eql(desiredOutput);
```

