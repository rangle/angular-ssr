module.exports = function (config) {
  config.set({
    frameworks: [
      'jasmine',
      'karma-typescript',
    ],

    files: [
      {pattern: './source/**/*.ts'},
    ],

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
      bundlerOptions: {
        validateSyntax: false,
      },
      tsconfig: './tsconfig.json',
    },
  });
};
