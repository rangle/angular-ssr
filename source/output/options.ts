import {PathReference} from '../filesystem/contracts';

export interface OutputOptions {
  // Output filename to generate for each route (index.html by default)
  filename: string;

  output: PathReference;

  // Inline CSS stylesheets into the output
  inlineStylesheets: boolean;

  // Inline SVG <use xlink:href> references to get around absolute path issues
  inlineVectorGraphics: boolean;
}