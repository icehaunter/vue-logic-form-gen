[![CircleCI](https://circleci.com/gh/icehaunter/vue-logic-form-gen.svg?style=svg)](https://circleci.com/gh/icehaunter/vue-logic-form-gen)
[![codecov](https://codecov.io/gh/icehaunter/vue-logic-form-gen/branch/master/graph/badge.svg)](https://codecov.io/gh/icehaunter/vue-logic-form-gen)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/icehaunter/vue-logic-form-gen/master)](https://stryker-mutator.github.io)

# Vue Logic Form Generator
## A schema-based form generator for Vue, but with resolution logic

This project was created from multiple requirements:
- Schema-based from generation with JSON-serializable schema (i.e. to be stored on the server)
- No eval or html insertion to prevent stored XSS
- Dynamic forms with hiding/showing of some parts based on the actual data (i.e. ask the user's birthday in one field and show part of the form only if he is over 18)
- Batteries-included validation (because validation is part of the form and it needs to be dependent on different model parts)

### Installation:
Documentation pending, as project is not on NPM just yet

### Usage:
Documentation pending, as API is not stabilized at this point in time

### Development:
```sh
git clone git@github.com:icehaunter/vue-logic-form-gen.git
npm install
npm run test:unit
```

To actually serve the demo page:
```sh
npm run serve
```
