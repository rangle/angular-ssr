import {Snapshot} from './snapshot';

import {AggregateException, OutputException} from '../exception';

import {none} from '../predicate';

export const assertSnapshot = <V>(snapshot: Snapshot<V>) => {
  if (snapshot == null) {
    throw new OutputException('Cannot output a null application snapshot');
  }

  switch (snapshot.exceptions.length) {
    case 0: break;
    case 1: throw snapshot.exceptions[0];
    default:
      throw new AggregateException(snapshot.exceptions);
  }

  if (none(snapshot.renderedDocument)) {
    throw new OutputException('Received an application snapshot with an empty document!');
  }
};