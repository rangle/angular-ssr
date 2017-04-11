import {Project} from '../../../project';

export interface ConfigurationLoader {
  load(project: Project): any;
}
