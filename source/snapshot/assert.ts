import {EOL} from 'os';

import {ConsoleType} from './console';

import {Snapshot} from './snapshot';

import {AggregateException, OutputException} from '../exception';

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

  if (snapshot.renderedDocument == null || snapshot.renderedDocument.length === 0) {
    throw new OutputException('Received an application snapshot with an empty document!');
  }

  const logs = snapshot.console || [];

  const errors = logs.filter(c => c.type === ConsoleType.Error || c.type === ConsoleType.Assertion);

  if (errors.length > 0) {
    const messages = errors.map(message => message.args.map(a => a.toString()).join(' ')).join(EOL);

    throw new OutputException(`Application printed error messages to the console, which is considered a failure: ${messages}`);
  }
};
