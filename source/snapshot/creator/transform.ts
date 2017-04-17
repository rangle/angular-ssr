import {Postprocessor} from '../../application/contracts';

import {SnapshotException} from '../../exception';

const {createDocument} = require('domino');

export const transformAndSerializeDocument = (processors: Array<Postprocessor>, document: Document): string => {
  if (processors == null || processors.length === 0) {
    return document.documentElement.outerHTML;
  }

  for (let index = 0; index < processors.length; ++index) {
    const processor = processors[index];

    switch (processor.length) { // fn arguments
      case 1:
        processor(document); // mutated the document itself
        break;
      case 2:
        const newDocument = processor(document, document.documentElement.outerHTML) as string;
        switch (typeof newDocument) {
          case 'string':
            if (index === processors.length - 1) {
              return newDocument; // optimization, no need to recreate the document
            }
            document.documentElement = createDocument(newDocument); // have another preprocessor to run
            break;
          default: // mutated the document itself?
            if (newDocument != null) {
              throw new SnapshotException(`Invalid postprocessor result type: ${typeof newDocument} (should be void or string)`);
            }
            break;
        }
        break;
      default:
        throw new SnapshotException(`A postprocessor function must accept one or two arguments, not ${processor.length}`);
    }
  }

  return document.documentElement.outerHTML;
};