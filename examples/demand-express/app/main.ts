import 'reflect-metadata';

import 'zone.js';

import 'hammerjs';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

import {RootModule} from './root.module';

platformBrowserDynamic().bootstrapModule(RootModule);
