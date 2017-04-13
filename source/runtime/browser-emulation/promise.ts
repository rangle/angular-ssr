import '../zone';

const promise = Promise;

const bluebird = require('bluebird'); // some webpack plugins use bluebird to disastrous effect

bluebird.Promise = promise;