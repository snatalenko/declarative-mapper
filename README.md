Declarative Mapper for NodeJS
=============================

[![NPM Version](https://img.shields.io/npm/v/declarative-mapper.svg)](https://www.npmjs.com/package/declarative-mapper)
[![Build](https://github.com/snatalenko/declarative-mapper/workflows/build/badge.svg)](https://github.com/snatalenko/declarative-mapper/actions)
[![Coverage Status](https://coveralls.io/repos/github/snatalenko/declarative-mapper/badge.svg?branch=master)](https://coveralls.io/github/snatalenko/declarative-mapper?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/declarative-mapper.svg)](https://www.npmjs.com/package/declarative-mapper)

## Reasoning

On a couple of projects I needed a library that would allow users to convert one JSON format to another (say, Invoice from one system to another). It should have operated with a **declarative mapping** instructions to allow configuration by users from UI. Also, it should have been **flexible** enough to accommodate various tricky requirements, but **secure**, to prevent JS injections. And **fast**, to process incoming streams with millions of records.

That's where the "declarative-mapping" came in:

- **Declarative** - declarative mapping instructions allows mapping configuration from UI. in simple scenarios no technical knowledge needed, but I still have plans to build a nicer mapping editor
- **Flexible** - run JS underneath to allow any kind of instructions
- **Secure** - restricts access to outside environment by executing mapping in a separate [V8 Virtual Machine](https://nodejs.org/api/vm.html) context
- **Fast** - mapping instructions are compiled once on beginning, which allows to process ~200k obj/sec on Apple M1 Pro
- **Typed** - written in TypeScript
- **Lightweight** - no dependencies


A simple example:

```ts
import { createMapper } from 'declarative-mapper';
import { expect } from 'chai';


const sourceObject = {
  foo: 'bar'
};

const mappingInstructions = {
  myObj: {
    myField: 'foo',
    myFieldLength: 'foo.length'
  }
};


// Convert declarative instructions to a pre-compiled
// function that can be executed any number of times
const mapper = createMapper(mappingInstructions);

const result = mapper(sourceObject);

expect(result).to.eql({
  myObj: {
    myField: 'bar',
    myFieldLength: 3
  }
});
```

## Mapping Instructions

In mapping JSON, left side is a key in the resulting object, right side is either a string with a valid JS expression, or an object with mapping instructions.

| Expression  | Description  |
| --- | --- |
| `"key": "100"`  | numeric value, produces `"key": 100`  |
| `"key": "true"`  | boolean value, produces `"key": true`  |
| `"key": "\"test\""` or<br /> `"key": "'text'"`  |  text value. as you can see, it has its own quotation marks. produces `"key": "text"`  |
| `"key": "foo"`  | access to an input variable `foo`  |
| `"key": "Number(foo)"`  | access to an input variable `foo` converted to a number, produces `"key": 100`  |
| `"key": "arr.filter(el => ...)"`  | more complex JS expression that produces an array  |
| `"key": { … }`  | object mapping, where “…” contains inner properties  |
| `"key": { "map": { … } }`  | same as above, but more verbose  |
| `"key": { "forEach": "…", "map": { … } }`  | array mapped from input  |
| `"key": { "0": { … }, "1": { … } }`  | array with a predefined set of elements  |
| `"key": { "from": "…", "map": { … } }`  | object mapping from a different context   |


### Objects

Mapping of an object with inner properties:

```json
  "key": {
    "foo": "-1"
  }
```
or

```json
  "key": {
    "map": {
      "foo": "-1"
    }
  } 
```

Both above examples produce same result (despite that the second example is more verbose and made to have a consistent format with array mappings):

```json
  "key": {
    "foo": -1
  } 
```

### Arrays

Let's assume we have an input with an array of objects in it, and we need to produce an array of objects, one for each element in the input. In a such case the `"forEach": "", "map": {}` construction can be used:

```json
{
  "inputArray": [{
    "arrayInnerProp": "value1"
  }, {
    "arrayInnerProp": "value2"
  }]
}
```

```json
  "key": {
    "forEach": "inputArray",
    "map": {
      "foo": "arrayInnerProperty"
    }
  }
```

Result: 

```json
  "key": [{
    "foo": "value1"
  }, {
    "foo": "value2"
  }]
```

Note that the execution context in a such mapping shifts into the input objects and inner properties can be referenced directly as `arrayInnerProperty` instead of `inputArray[index].arrayInnerProperty`. More on that in the [Context Switching](#context-switching)


#### String[] from Object[]

In case array should contain plain values instead of objects, left side of the expression should contain `"*"` instead of the key name:

```json
  "key": {
    "forEach": "inputArray",
    "map": {
      "*": "arrayInnerProperty"
    }
  }
```

Produces:

```json
  "key": [
    "value1",
    "value2"
  ]
```

#### String[] from String[]

Arrays with simple values can be mapped in a same way, while current iterating element can accessed as `$record`:

```json
{
  "inputValues": [1, 2, 3]
}
```

```json
{
  "forEach": "inputValues",
  "map": {
    "*": "$record * 2"
  }
}
```

Result:

```json
[2, 4, 6]
```

### Array with predefined set of elements

In case array should have a predefined set of elements, each of the elements can be mapped by its index:

```json
  "key": {
    "0": {
      "foo": "\"text1\""
    },
    "2": "1000"
  }
```

Result:

```json
  "key": [
    {
      "foo": "text1"
    },
    null,
    1000
  ]
```



### Context Switching

When arrays are mapped with the `"forEach": "", "map": {}` statement, the execution context switches automatically to the objects selected by `forEach` ([see above](#arrays)). Similar technique can be useful when a large number of properties need to be mapped from an object located outside of the current execution context. In a such case the `"from": "", "map": {}` statement can be used.



Down in the source tree:

```json
  "key": {
    "from": "field.innerArray[0].innerObject",
    "map": {
      "foo": "nestedProperty"
    }
  }
```

Or up in the source document:

```json
  "key": {
    "from": "$input.rootLevelProperty",
    "map": {
      "foo": "nestedProperty"
    }
  }
```

Here are the special variables that can be handy for the context switching:

- `$record` - current element of the array being iterated with `forEach`
- `$index` - index of the current array element
- `$collection` - entire collection of the elements being iterated
- `$input` - entire document passed as mapping input


## Complex Mapping Example

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

