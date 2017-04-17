import {PrebootConfiguration} from '../../application/preboot';

import {JsonSchema, ValidatorResult} from '../../transformation';

const prebootSchema = new JsonSchema({
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  anyOf: [
    {required: ['appRoot']},
    {required: ['serverClientRoot']}
  ],
  properties: {
    appRoot: {
      anyOf: [
        {type: 'string'},
        {type: 'array', items: {type: 'string'}}
      ]
    },
    serverClientRoot: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clientSelector: {type: 'string'},
          serverSelector: {type: 'string'}
        },
      },
    },
    buffer: {type: 'boolean'},
    uglify: {type: 'boolean'},
    noInlineCache: {type: 'boolean'},
    eventSelectors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          selector: {type: 'string'},
          events: {
            type: 'array',
            items: {type: 'string'}
          },
          keyCodes: {
            type: 'array',
            items: {type: 'number'},
          },
          preventDefault: {type: 'boolean'},
          freeze: {type: 'boolean'},
          noReplay: {type: 'boolean'}
        }
      },
    },
  }
});

export const validatePrebootOptionsAgainstSchema =
  (configuration: PrebootConfiguration): ValidatorResult => prebootSchema.validate(configuration);