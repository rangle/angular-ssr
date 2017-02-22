import {install} from '../transpile/install/require';

import {RuntimeException} from '../exception';

try {
  install();
}
catch (exception) {
  throw new RuntimeException('Failed to install runtime transpiler', exception);
}