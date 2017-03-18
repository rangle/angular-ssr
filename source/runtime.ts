const domImpl = require('domino/lib/impl');

Object.assign(global, domImpl);

import {XMLHttpRequest} from './platform';

Object.assign(global, {XMLHttpRequest});

require('mock-local-storage');