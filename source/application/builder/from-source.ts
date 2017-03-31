import {Application} from './application';
import {ApplicationBase} from './application-base';
import {ServerPlatform, ApplicationRuntimeProject, RuntimeModuleLoader, createStaticPlatform} from '../../platform';
import {ApplicationBuilderBase} from './builder-base';
import {ApplicationModuleDescriptor, Project} from '../project';
import {getCompilableProgram} from '../compiler';
import {FileReference} from '../../filesystem';
import {RenderOperation} from '../operation';

export class ApplicationBuilderFromSource<V> extends ApplicationBuilderBase<any> {
  constructor(public project: Project, templateDocument?: FileReference | string) {
    super(templateDocument);
  }

  build(): Application<V> {
    const program = getCompilableProgram(this.project);

    const moduleFactory = program.loadModule(this.project.applicationModule, true);

    let platform: ServerPlatform;

    let applicationInstance;

    class ApplicationFromSourceImpl extends ApplicationBase<V, any> {
      constructor(operation: RenderOperation) {
        platform = createStaticPlatform([
          {provide: ApplicationRuntimeProject, useFactory: () => applicationInstance},
          {provide: RuntimeModuleLoader, useClass: RuntimeModuleLoader}
        ]) as ServerPlatform;

        super(platform, operation, () => moduleFactory);

        applicationInstance = this;
      }

      async getModule(moduleDescriptor: ApplicationModuleDescriptor): Promise<any> {
        return await program.loadModule(moduleDescriptor, false);
      }

      dispose() {
        platform.destroy();

        program.dispose();
      }
    }

    return new ApplicationFromSourceImpl(<RenderOperation> this.operation);
  }
}
