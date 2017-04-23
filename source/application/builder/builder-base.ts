import {Provider} from '@angular/core';

import {Application} from './application';
import {ApplicationBuilder} from './builder';
import {ApplicationBootstrapper, ApplicationStateReader, Postprocessor, VariantsMap} from '../contracts';
import {ConfigurationException} from '../../exception';
import {FileReference, fileFromString} from '../../filesystem';
import {PrebootQueryable, PrebootConfiguration} from '../preboot';
import {RenderOperation} from '../operation';
import {Route} from '../../route';

export abstract class ApplicationBuilderBase<V> implements ApplicationBuilder<V> {
  protected operation: Partial<RenderOperation> = {stabilizeTimeout: 5000};

  constructor(templateDocument?: FileReference | string) {
    if (templateDocument) {
      this.templateDocument(templateDocument.toString());
    }
  }

  abstract build(): Application<V>;

  templateDocument(template?: string) {
    if (template != null) {
      this.operation.templateDocument = templateFileToTemplateString(template);
    }
    return this.operation.templateDocument;
  }

  bootstrap(bootstrapper?: ApplicationBootstrapper) {
    if (this.operation.bootstrappers == null) {
      this.operation.bootstrappers = [];
    }
    this.operation.bootstrappers.push(bootstrapper);
  }

  postprocess(transform?: Postprocessor) {
    if (this.operation.postprocessors == null) {
      this.operation.postprocessors = [];
    }
    this.operation.postprocessors.push(transform);
  }

  providers(providers: Array<Provider>) {
    if (this.operation.providers == null) {
      this.operation.providers = [];
    }
    this.operation.providers.push(...providers);
  }

  variants(map: VariantsMap) {
    this.operation.variants = map;
  }

  routes(routes?: Array<Route>) {
    this.operation.routes = routes;
  }

  preboot(preboot?: PrebootConfiguration | boolean) {
    if (typeof preboot === 'boolean') {
      this.operation.preboot = preboot ? {} as PrebootQueryable : null;
    }
    else {
      this.operation.preboot = preboot as PrebootQueryable;
    }
  }

  stateReader<R>(stateReader?: ApplicationStateReader<R>) {
    this.operation.stateReader = stateReader;
  }

  stabilizeTimeout(milliseconds?: number): number | null {
    if (milliseconds !== undefined) {
      this.operation.stabilizeTimeout = milliseconds;
    }
    return this.operation.stabilizeTimeout;
  }
}

const templateFileToTemplateString = (fileOrTemplate: string): string => {
  const file = fileFromString(fileOrTemplate);

  if (file.exists()) {
    return file.content();
  }
  else if (/<html>/i.test(fileOrTemplate) === false) {
    throw new ConfigurationException(`Invalid template file or missing <html> element: ${fileOrTemplate}`);
  }
  return fileOrTemplate;
}