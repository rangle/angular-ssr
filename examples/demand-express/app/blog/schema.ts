import {Validator, ValidatorResult, Schema} from 'jsonschema';

const blogsSchema: Schema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    ".*$": {
      type: 'array',
      properties: {
        title: {type: 'string'},
        content: {type: 'string'},
        author: {type: 'object',
          properties: {
            name: {type: 'string'},
            email: {type: 'string'}
          }
        }
      }
    },
  }
};

export const validateBlogsAgainstSchema = (blogs): ValidatorResult =>
  new Validator().validate(blogs, blogsSchema);