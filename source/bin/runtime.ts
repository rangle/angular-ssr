import '../dependencies';

import {install} from '../transpile/install';

import {RuntimeException} from '../exception';

try {
  install();
}
catch (exception) {
  throw new RuntimeException('Failed to install runtime transpiler', exception);
}