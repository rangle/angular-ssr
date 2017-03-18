const domImpl = require('domino/lib/impl');

Object.assign(global, domImpl);

require('mock-local-storage');