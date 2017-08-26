import 'reflect-metadata';

import express = require('express');

import {applicationBuilderFromModule, StateTransition} from 'angular-ssr';

import {Injectable, enableProdMode} from '@angular/core';

import {RootModule} from '../app/root.module';
import {LocaleService} from '../app/locale';
import {absoluteUri, configure, listen} from './http';
import {index} from './paths';

enableProdMode();

@Injectable()
export class TransitionLocale implements StateTransition<string> {
  constructor(private service: LocaleService) {}

  transition(locale: string) {
    this.service.locale(locale);
  }
}

export interface Variants {
  locale: string;
}

const builder = applicationBuilderFromModule<Variants>(RootModule, index);

builder.variants({
  locale: { // select a locale based on renderUri arguments
    transition: TransitionLocale
  }
});

builder.preboot(true);

const application = builder.build();

const http = express();

configure(http);

http.get(/.*/, async (request, response) => {
  try {
    const options: Variants = {locale: request.cookies['locale'] || 'en-US'};

    const snapshot = await application.renderUri(absoluteUri(request), options);

    response.send(snapshot.renderedDocument);
  }
  catch (exception) {
    console.error('Rendering exception', exception);

    response.send(builder.templateDocument()); // fall back on client document
  }
});

listen(http).then(port => console.log(`Load http://localhost:${port}/blog/1 (or try other blog ID numbers to see demand loading)`));
