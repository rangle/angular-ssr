import {Schema, Validator, ValidatorResult} from 'jsonschema';

export {ValidatorResult};

export class JsonSchema {
  constructor(private schema: Schema) {}

  add(schema: Schema) {}

  validate<T>(document: T): ValidatorResult {
    const validator = new Validator();

    return validator.validate(document, this.schema, {allowUnknownAttributes: false});
  }
}
