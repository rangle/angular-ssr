import {Configuration} from 'webpack';

import {Project} from '../../../project';

export interface ConfigurationLoader {
  load(project: Project): Configuration;
}
