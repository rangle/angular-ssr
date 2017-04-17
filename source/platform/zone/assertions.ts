import chalk = require('chalk');

import {PlatformException} from '../../exception';

const assertionFailure = (identifier: string) => {
  console.error(chalk.red(`This application is executing in a context where '${identifier}' is defined`));
  console.error(chalk.red(`This is completely unexpected and unsupported`));
  console.error(chalk.red('Please ensure that you have not imported a conflicting DOM library like jsdom!'));

  throw new PlatformException(`Running in a browserless environment but '${identifier}' is non-null!`);
}

if (typeof window !== 'undefined') {
  assertionFailure('window');
}

if (typeof document !== 'undefined') {
  assertionFailure('document');
}

if (typeof Zone === 'undefined') {
  throw new PlatformException(`Zone is undefined (import zone.js into this process)`);
}