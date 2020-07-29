## [1.3.5](https://github.com/snatalenko/declarative-mapper/compare/v1.3.4...v1.3.5) (2020-07-29)


### Changes

* Support `readOnly` property in mappingForSchema ([4cbce91](https://github.com/snatalenko/declarative-mapper/commit/4cbce91d88fbdb99f4f500a2bdcd73ea5dd4b41a))


## [1.3.4](https://github.com/snatalenko/declarative-mapper/compare/v1.3.3...v1.3.4) (2020-07-28)


### Fixes

* Empty object mapping is detected as Array mapping ([5c178fc](https://github.com/snatalenko/declarative-mapper/commit/5c178fc98c8277d843c5ec856c6fb16bed45e404))

### Changes

* Handle `additionalProperties` in mapping/sampleForSchema ([3b5c7c5](https://github.com/snatalenko/declarative-mapper/commit/3b5c7c59e13bdee31b257792c71140c7f188a866))
* Handle empty `properties` and`items` in sampleForSchema ([16f38bc](https://github.com/snatalenko/declarative-mapper/commit/16f38bceb5d4e0411c5d03bb5ca8e9f0a8f203b2))


## [1.3.3](https://github.com/snatalenko/declarative-mapper/compare/v1.3.2...v1.3.3) (2020-07-28)


### Changes

* Support `allOf`, `oneOf`, `anyOf` in mappingForSchema ([2f5ee35](https://github.com/snatalenko/declarative-mapper/commit/2f5ee350be7c5094e458c0ce48cf81e095bbe9e0))


## [1.3.2](https://github.com/snatalenko/declarative-mapper/compare/v1.3.1...v1.3.2) (2020-07-28)


### Changes

* Handle empty `properties` and `items` in mappingForSchema ([937996a](https://github.com/snatalenko/declarative-mapper/commit/937996a8a68a00c405ff88081a9f4f7605cad439))


## [1.3.1](https://github.com/snatalenko/declarative-mapper/compare/v1.3.0...v1.3.1) (2020-07-27)


### Fixes

* Low severity vulnerabilities in dependencies ([cd3ce19](https://github.com/snatalenko/declarative-mapper/commit/cd3ce1982b98e8fbfc77e4f189dea67d1d1b5e96))

### Changes

* Use default values and examples for sample data generation ([ebb4d12](https://github.com/snatalenko/declarative-mapper/commit/ebb4d12c884a85ee5faca9350991e26367bd4ee9))


# [1.3.0](https://github.com/snatalenko/declarative-mapper/compare/v1.2.6...v1.3.0) (2020-07-11)


### Features

* Add mapping template generator ([17564de](https://github.com/snatalenko/declarative-mapper/commit/17564def40baf727a73c171625a6b6dbd646929c))


## [1.2.6](https://github.com/snatalenko/declarative-mapper/compare/v1.2.5...v1.2.6) (2020-07-05)


### Documentation

* Add version and downloads ([71f9068](https://github.com/snatalenko/declarative-mapper/commit/71f9068410f7887d956cb5940bbd3157149a8b06))

### Build System

* Use github actions for publishing ([d6dfc6c](https://github.com/snatalenko/declarative-mapper/commit/d6dfc6c8c903667b58b1609e85678a9b6ff89467))
* Exclude coverage metadata from npm package ([b3635f9](https://github.com/snatalenko/declarative-mapper/commit/b3635f919810e4a6e2c2664898bd8eaaf76e5c78))


## [1.2.5](https://github.com/snatalenko/declarative-mapper/compare/v1.2.4...v1.2.5) (2020-07-05)


### Documentation

* Add comments to the readme example ([30f0718](https://github.com/snatalenko/declarative-mapper/commit/30f0718ba162d7e1fc416adc92f106a7eed19b16))
* Add test coverage badge to readme ([039a98b](https://github.com/snatalenko/declarative-mapper/commit/039a98b3849c0326870a08df0b2faa4cf544e1c8))

### Build System

* Test coverage as separate github action ([d5040f1](https://github.com/snatalenko/declarative-mapper/commit/d5040f1664eeec5e15d61cfc65f025daa099addf))


## [1.2.4](https://github.com/snatalenko/declarative-mapper/compare/v1.2.3...v1.2.4) (2020-07-05)


### Build System

* Add lcov reporter ([64a69e7](https://github.com/snatalenko/declarative-mapper/commit/64a69e7889585117dc7fe4e6fa93e961b93b1599))


## [1.2.3](https://github.com/snatalenko/declarative-mapper/compare/v1.2.2...v1.2.3) (2020-07-05)


### Build System

* Add test coverage integration ([1d04114](https://github.com/snatalenko/declarative-mapper/commit/1d041145c9fbc83ec3f8bbefe48d6950116a9241))


## [1.2.2](https://github.com/snatalenko/declarative-mapper/compare/v1.2.1...v1.2.2) (2020-07-05)


### Changes

* Throw error when extension conflicts with input ([7e10861](https://github.com/snatalenko/declarative-mapper/commit/7e10861370d6c52338fb9c22bd0e4dd16bff474a))
* Remove $extensionNames var from execution context ([6554907](https://github.com/snatalenko/declarative-mapper/commit/6554907cbf33d9d970c628e991463dc56d56b11b))


## [1.2.1](https://github.com/snatalenko/declarative-mapper/compare/v1.2.0...v1.2.1) (2020-07-01)


### Build System

* Run tests and compilation before packing ([2c30d95](https://github.com/snatalenko/declarative-mapper/commit/2c30d95cf6988ec7c627d5aea161193900c9c60e))


# [1.2.0](https://github.com/snatalenko/declarative-mapper/compare/v1.1.1...v1.2.0) (2020-07-01)


### Features

* Make `map` parameter optional in plain objects mapping ([f8ef7b0](https://github.com/snatalenko/declarative-mapper/commit/f8ef7b0a74f88273fc0b0175c7a3e75ae46a35ca))


## [1.1.1](https://github.com/snatalenko/declarative-mapper/compare/v1.1.0...v1.1.1) (2020-06-25)


### Fixes

* Indentation in generated scripts ([9798e90](https://github.com/snatalenko/declarative-mapper/commit/9798e9083a1717e44047722516232c81e304b2b7))


# [1.1.0](https://github.com/snatalenko/declarative-mapper/compare/v1.0.1...v1.1.0) (2020-06-25)


### Features

* Root elements mapping from simple types ([8687141](https://github.com/snatalenko/declarative-mapper/commit/86871414def5da4f99db1e25b46cae4456d8268a))


## [1.0.1](https://github.com/snatalenko/declarative-mapper/compare/v1.0.0...v1.0.1) (2020-06-23)


### Build System

* Add tests badge ([fe40f8c](https://github.com/snatalenko/declarative-mapper/commit/fe40f8ccbaf7e86a4e292b1e6a7c95cd0eb34701))


