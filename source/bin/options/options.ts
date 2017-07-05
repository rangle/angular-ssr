import {FileReference, PrebootConfiguration, Project, OutputProducer} from '../../index';

export interface CommandLineOptions {
  blacklist?: boolean;
  debug: boolean;
  output: OutputProducer;
  pessimistic: boolean; // ignore routes that cannot render
  preboot: PrebootConfiguration | boolean;
  project: Project;
  templateDocument: string;
  webpack?: FileReference;
}