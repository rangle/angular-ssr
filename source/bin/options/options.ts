import {FileReference, PrebootConfiguration, Project, OutputProducer} from '../../index';

export interface CommandLineOptions {
  blacklist?: boolean;
  debug: boolean;
  output: OutputProducer;
  preboot: PrebootConfiguration | boolean;
  project: Project;
  templateDocument: string;
  webpack?: FileReference;
}