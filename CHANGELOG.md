## [1.6.1](https://github.com/snatalenko/declarative-mapper/compare/v1.6.0...v1.6.1) (2023-07-16)


### Fixes

* Vulnerabilities in dev dependencies ([6e77342](https://github.com/snatalenko/declarative-mapper/commit/6e77342ecc8672fbc145769186bbdc4401e70635))
* Files placement in Dist folder ([c1c4b55](https://github.com/snatalenko/declarative-mapper/commit/c1c4b5501a215502875e4d3c933dc5d759ea76f7))

### Build System

* Add missing conventional-changelog-cli dependency ([6fcfdf4](https://github.com/snatalenko/declarative-mapper/commit/6fcfdf4572140999d447e400dc5c5fd269ec04a9))


# [1.6.0](https://github.com/snatalenko/declarative-mapper/compare/v1.5.1...v1.6.0) (2023-06-11)


### Changes

* Stricter mapping json schema ([6ad783b](https://github.com/snatalenko/declarative-mapper/commit/6ad783b93ef78eda885304aa151d6c4c563d7443))


## [1.5.1](https://github.com/snatalenko/declarative-mapper/compare/v1.5.0...v1.5.1) (2023-02-25)


### Build System

* Upgrade note to v16 ([795ef1b](https://github.com/snatalenko/declarative-mapper/commit/795ef1b1f972d57559e77f50a5f101ab01db7c64))


# [1.5.0](https://github.com/snatalenko/declarative-mapper/compare/v1.4.6...v1.5.0) (2023-02-25)


### Changes

* `$context` property when mapping with `from` directive ([180d61c](https://github.com/snatalenko/declarative-mapper/commit/180d61c0f029ada022d1a708be07600ccb8195e8))

### Build System

* Update dev dependencies ([dba9278](https://github.com/snatalenko/declarative-mapper/commit/dba9278c0224e4ee44fc5c56826b61238b77eee4))
* Add npm "build" script ([7de8612](https://github.com/snatalenko/declarative-mapper/commit/7de86122061573e9a61d955ddfb03b5bd5343d7a))


## [1.4.6](https://github.com/snatalenko/declarative-mapper/compare/v1.4.5...v1.4.6) (2022-08-18)


### Documentation

* Add mapping instructions ([a3d32a6](https://github.com/snatalenko/declarative-mapper/commit/a3d32a66e00ea4fcf5f68bd5f7890e031bfb1970))


## [1.4.5](https://github.com/snatalenko/declarative-mapper/compare/v1.4.4...v1.4.5) (2022-07-14)


### Fixes

* Vulnerabilities in dev dependencies ([e2a7963](https://github.com/snatalenko/declarative-mapper/commit/e2a79634d3b2f6d690f5e53fe8f7795bb7f4107b))

### Changes

* Bump y18n from 4.0.0 to 4.0.1 ([df03154](https://github.com/snatalenko/declarative-mapper/commit/df03154945e625f535f985ebaf10a8c1e4f762c9))
* Use original `sandbox` obj as VM context for mapping execution ([a55beb0](https://github.com/snatalenko/declarative-mapper/commit/a55beb04c2bb8cb71a088caf65a58f61be1fb7ad))


## [1.4.4](https://github.com/snatalenko/declarative-mapper/compare/v1.4.3...v1.4.4) (2020-10-07)


### Fixes

* Incorrect mapping of 1-element arrays without 'map' keyword ([0996dca](https://github.com/snatalenko/declarative-mapper/commit/0996dca442f8272f7d4b27ef5c570ba0222e975b))


## [1.4.3](https://github.com/snatalenko/declarative-mapper/compare/v1.4.2...v1.4.3) (2020-09-28)


### Fixes

* Sample generation for non-string enums ([c7f3921](https://github.com/snatalenko/declarative-mapper/commit/c7f39215eb8560df5ed3525a3cb214fc8b539923))


## [1.4.2](https://github.com/snatalenko/declarative-mapper/compare/v1.4.1...v1.4.2) (2020-09-15)


### Fixes

* Export common type declarations ([6a1ecad](https://github.com/snatalenko/declarative-mapper/commit/6a1ecadcb62f684de1aa80689908271d1b60228a))


## [1.4.1](https://github.com/snatalenko/declarative-mapper/compare/v1.4.0...v1.4.1) (2020-09-15)


### Fixes

* Vulnerability in dev dependency ([2525e3b](https://github.com/snatalenko/declarative-mapper/commit/2525e3bf98e2e671f60eaae161215fb1af26aab5))

### Build System

* Run npm audit before new version assign ([79cbbd6](https://github.com/snatalenko/declarative-mapper/commit/79cbbd6ded0d75b5b71df519349370db7a32654b))


# [1.4.0](https://github.com/snatalenko/declarative-mapper/compare/v1.3.7...v1.4.0) (2020-09-15)


### Features

* Array elements mapping using JS array declaration syntax ([76fb5d5](https://github.com/snatalenko/declarative-mapper/commit/76fb5d5a482306ffce894043c903d04484fe4831))
* Mapping JSON schema ([6f168da](https://github.com/snatalenko/declarative-mapper/commit/6f168da7058003618faa29a0203fc9fc4faf690e))

### Fixes

* Comments in type definitions ([3fc9043](https://github.com/snatalenko/declarative-mapper/commit/3fc9043f6472c03bcdd5fb800ec3382b284a9daa))


## [1.3.7](https://github.com/snatalenko/declarative-mapper/compare/v1.3.6...v1.3.7) (2020-08-01)


### Fixes

* Destination shema modificaiton on allOf schemas merge ([9dc782f](https://github.com/snatalenko/declarative-mapper/commit/9dc782fa37cb971e34237ab7ee05034f0048f3eb))


## [1.3.6](https://github.com/snatalenko/declarative-mapper/compare/v1.3.5...v1.3.6) (2020-08-01)


### Fixes

* Objects concatenation in schema allOf ([64dfdb7](https://github.com/snatalenko/declarative-mapper/commit/64dfdb75e2a4b60bc2d5b5dfabcc1d7368301b02))


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


