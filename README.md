# CruzHacks 2022-2023 Backend

This repository contains all the endpoints used to support CruzHacks 2022. Developed with firebase, javascript, jest.

## How to Run
=======

1. Clone this repository 
2. Set githooks with `git config core.hooksPath ./.githooks`
3. Navigate to the `/functions` of the repository and run `yarn` which will install all the dependencies
4. Running `yarn serve` will begin the firebase emulators

## Available Scripts
========
* `yarn serve` starts a development server with firebase emulator
* `yarn lint` runs the linter for all files
* `yarn test` runs the jest testing suite 

### Environment Variables

Can be obtained by running `firebase functions:config:get > .runtimeconfig.json` within your `/functions` directory

Function variables can be set with `firebase functions:config:set example.key="value" -P <default/production>` to set the variable of the desired branch