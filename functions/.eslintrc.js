module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
  },
  plugins: ["promise", "prettier", "jest"],
  extends: ["eslint:recommended", "plugin:prettier/recommended", "plugin:jest/recommended"],
  rules: {
    "prettier/prettier": "error",

    "no-unused-vars": [
      "error",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // Removed rule "disallow the use of undeclared variables unless mentioned in /*global */ comments" from recommended eslint rules
    "no-undef": "off",

    // Warn if return statements do not either always or never specify values
    "consistent-return": 1,

    // Warn if no return statements in callbacks of array methods
    "array-callback-return": 1,

    // Require the use of === and !==
    eqeqeq: 2,

    // Require using Error objects as Promise rejection reasons
    "prefer-promise-reject-errors": 2,

    // Enforce return statements in callbacks of array methods
    "callback-return": 2,

    // Require error handling in callbacks
    "handle-callback-err": 2,

    // Prefer using arrow functions for callbacks
    "prefer-arrow-callback": 1,

    // Return inside each then() to create readable and reusable Promise chains.
    // Forces developers to return console logs and http calls in promises.
    "promise/always-return": 2,

    //Enforces the use of catch() on un-returned promises
    "promise/catch-or-return": 2,

    // Warn against nested then() or catch() statements
    "promise/no-nesting": 1,
  },
};
