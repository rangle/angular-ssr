import {SourceFile} from 'typescript';

import {Files} from '../../static';

const externalModuleExpression = new RegExp(`(\\|\/)${Files.modules}(\\|\/)`);

export const isExternalModule = (file: SourceFile): boolean => externalModuleExpression.test(file.fileName);

