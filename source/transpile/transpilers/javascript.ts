import {TransformOptions, transform} from 'babel-core';

import {TranspileException} from '../../exception';

export const compilejs = (module: NodeModule, source: string): string => {
  const filename = module.filename;

  const plugins = pluginConfiguration();

  try {
    const transformOptions: TransformOptions = {
      presets: [],
      plugins,
      sourceMaps: false,
      filename,
    };

    const result = transform(source, transformOptions);
    if (result == null) {
      throw new TranspileException('Unknown error');
    }
    return result.code;
  }
  catch (exception) {
    throw new TranspileException(`Transpilation of ${module.id} failed: ${exception.stack}`);
  }
};

const pluginConfiguration = (): Array<Array<string> | any> => {
  return [
    [require.resolve('babel-plugin-module-resolver'), {
      alias: {
        '@angular/core': '@angular/core/',
        '@angular/common': '@angular/common/',
        '@angular/compiler': '@angular/compiler/',
        '@angular/compiler-cli': '@angular/compiler-cli/',
        '@angular/platform-browser': '@angular/platform-browser/',
        '@angular/forms': '@angular/forms/',
        '@angular/router': '@angular/router/'
      }
    }],
    [require.resolve('babel-plugin-transform-inline-imports-commonjs')]
  ];
};
