const {__core_private__: exportedPrivates} = require('@angular/core');

if (exportedPrivates == null) {
  throw new Error('Cannot locate private core exports in @angular/core');
}

export const privateCoreImplementation = () => exportedPrivates;
