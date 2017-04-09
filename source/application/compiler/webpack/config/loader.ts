import {Configuration} from 'webpack';

export interface ConfigurationLoader {
  load(): Configuration;
}
