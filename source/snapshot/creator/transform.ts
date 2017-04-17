import {Postprocessor} from '../../application/contracts';

import {SnapshotException} from '../../exception';

const {createDocument} = require('domino');

export const transformDocument = (processors: Array<Postprocessor>, document: Document): string => {
  for (const processor of processors || []) {
    switch (processor.length) {
      case 1:
        processor(document); // mutated the document itself
        break;
      case 2:
        const result = processor(document, document.documentElement.outerHTML);
        switch (typeof result) {
          case 'string': // returned a new document
            document.documentElement = createDocument(result as string);
            break;
          default: // mutated the document itself
            if (result != null) {
              throw new SnapshotException(`Invalid postprocessor result type: ${typeof result}`);
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