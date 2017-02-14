const {readFileSync} = require('fs');

const {resolve, join} = require('path');

module.exports = function (config) {
  config.set({
    baseUrl: '.',

    frameworks: [
      'jasmine',
      'karma-typescript',
    ],

    files: [
      require.resolve('jasmine-promises'),
      {pattern: './source/**/*.ts'},
      {pattern: '**/*.map', included: false},
    ],

    exclude: ['**/*.d.ts'],

    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },

    reporters: [
      'spec',
      'progress',
      'karma-typescript',
    ],

    browsers: ['Chrome'],

    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json',
      bundlerOptions: {
        exclude: ['_http_client'],
      },
      coverageOptions: {
        instrumentation: config.singleRun === true,
        exclude: /(\.(d|spec|test)\.ts$|tests(\\|\/))/i,
      },
      exclude: [
        'build',
        'node_modules',
      ]
    },
  });
};
