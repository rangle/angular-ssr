import {ApplicationRuntimeProject, RuntimeModuleLoader, ServerPlatform} from '../../platform';
import {getCompilerFromProject, ModuleLoader} from '../compiler';
import {RenderOperation} from '../operation';
import {ModuleDeclaration, Project} from '../project';

import {Application} from './application';
import {ApplicationBuilder} from './builder';
import {ApplicationBuilderImpl, ApplicationImpl} from './impl';

export const applicationBuilderFromSource = <V = {}>(project: Project, templateDocument?: string): ApplicationBuilder<V> => {
  let platform: ServerPlatform = null;

  let loader: Promise<ModuleLoader>;

  const dispose = async () => {
    (await Promise.resolve(loader)).dispose();

    if (platform) {
      platform.destroy();
    }
  }

  const build = (operation: RenderOperation): Application<V> => {
    const compiler = getCompilerFromProject(project);

    loader = compiler.compile();

    let applicationInstance;

    platform = compiler.createPlatform([
      {provide: ApplicationRuntimeProject, useFactory: () => applicationInstance},
      {provide: RuntimeModuleLoader, useClass: RuntimeModuleLoader}
    ]);

    const moduleFactory =
      loader
        .then(l => l.load())
        .then(m => typeof m !== 'object'
          ? platform.compileModule(m)
          : m)
        .catch(exception => {
          platform.destroy();

          return Promise.reject(exception);
        });

    const load = (module: ModuleDeclaration) => loader.then(l => l.lazy(module));

    applicationInstance = new ApplicationImpl(platform, operation, moduleFactory, load, dispose);

    return applicationInstance;
  }

  return new ApplicationBuilderImpl(build, dispose, templateDocument);
};