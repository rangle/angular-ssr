module.exports = function (config) {
  const coverage = config.singleRun ? ['coverage'] : [];

  config.set({
    frameworks: [
      'jasmine',
      'source-map-support',
      'karma-typescript',
    ],

    files: [
      {pattern: 'source/**/*.ts'},
    ],

    preprocessors: {
      '**/*.ts': ['karma-typescript', ...coverage],
    },

    reporters: ['spec', 'progress', 'karma-typescript'],

    browsers: ['Chrome'],

    karmaTypescriptConfig: {
      bundlerOptions: {
        validateSyntax: false,
      },
      tsconfig: './tsconfig.json',
    },
  });
};
