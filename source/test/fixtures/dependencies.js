// NOTE(bond): This file is required in each test runner to set up the test context.
// It is important that it defines all the polyfills and zone-mapped objects that are
// required to run an application.

require('../../runtime');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 128000; // we have integration tests that can take a long while