import {Postprocessor} from '../../application/contracts';

import {SnapshotException} from './../../exception';

export const transformDocument = (processors: Array<Postprocessor>, document: Document & { outerHTML?: string }) => {
  for (const processor of processors || []) {
    switch (processor.length) {
      case 1:
        processor(document);
        break;
      case 2:
        const result = processor(document, document.outerHTML);
        switch (typeof result) {
          case 'string':
            document.outerHTML = result as string;
            break;
          default:
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
  return document;
};