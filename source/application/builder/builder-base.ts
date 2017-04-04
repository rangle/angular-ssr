import {Application} from './application';
import {ApplicationBuilder} from './builder';
import {ApplicationBootstrapper, ApplicationStateReader, Postprocessor, PrebootConfiguration, VariantsMap} from '../contracts';
import {FileReference, fileFromString} from '../../filesystem';
import {RenderOperation} from '../operation';
import {Route} from '../../route';

export abstract class ApplicationBuilderBase<V> implements ApplicationBuilder<V> {
  constructor(templateDocument?: FileReference | string) {
    if (templateDocument) {
      this.templateDocument(templateDocument.toString());
    }
  }

  protected operation: Partial<RenderOperation> = {};

  abstract build(): Application<V>;

  preboot(config?: PrebootConfiguration) {
    if (config != null) {
      this.operation.preboot = config;
    }
    return this.operation.preboot;
  }

  templateDocument(template?: string) {
    if (template != null) {
      this.operation.templateDocument = templateFileToTemplateString(template);
    }
    return this.operation.templateDocument;
  }

  bootstrap(bootstrapper?: ApplicationBootstrapper) {
    if (bootstrapper) {
      if (this.operation.bootstrappers == null) {
        this.operation.bootstrappers = [];
      }
      this.operation.bootstrappers.push(bootstrapper);
    }
    return this.operation.bootstrappers;
  }

  postprocess(transform?: Postprocessor) {
    if (transform) {
      if (this.operation.postprocessors == null) {
        this.operation.postprocessors = [];
      }
      this.operation.postprocessors.push(transform);
    }
    return this.operation.postprocessors;
  }

  variants(map: VariantsMap) {
    if (map) {
      this.operation.variants = map;
    }
    return this.operation.variants;
  }

  routes(routes?: Array<Route>) {
    if (routes) {
      this.operation.routes = routes;
    }
    return this.operation.routes;
  }

  stateReader<R>(stateReader?: ApplicationStateReader<R>) {
    if (stateReader) {
      this.operation.stateReader = stateReader;
    }
    return this.operation.stateReader;
  }
}

const templateFileToTemplateString = (fileOrTemplate: string): string => {
  const file = fileFromString(fileOrTemplate);

  if (file.exists()) {
    return file.content();
  }

  return fileOrTemplate;
}