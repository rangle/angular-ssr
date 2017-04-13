import '../zone';

const promise = Promise;

const bluebird = require('bluebird'); // some webpack plugins use bluebird to disastrous effect

bluebird.Promise = promise;

import 'zone.js/dist/zone-bluebird';

declare const Zone;

Zone[Zone.__symbol__('bluebird')](bluebird);