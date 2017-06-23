import {PathReference} from '../filesystem/contracts';

export interface OutputOptions {
  output: PathReference;

  // Inline CSS stylesheets into the output
  inlineStylesheets: boolean;

  // Inline SVG <use xlink:href> references to get around absolute path issues
  inlineVectorGraphics: boolean;
}