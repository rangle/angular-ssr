import {Schema, Validator, ValidatorResult} from 'jsonschema';

export {ValidatorResult};

export class JsonSchema {
  constructor(private schema: Schema) {}

  private readonly validator = new Validator();

  validate<T>(document: T): ValidatorResult {
    return this.validator.validate(document, this.schema, {allowUnknownAttributes: false});
  }
}