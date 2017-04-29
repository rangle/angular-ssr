import 'reflect-metadata';

import 'zone.js';

import 'hammerjs';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

import {AppModule} from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
