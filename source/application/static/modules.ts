import {Program} from 'typescript';

import {ModuleDeclaration} from '../project';
import {PathReference} from '../../filesystem/contracts';
import {NotImplementedException} from '../../exception';

export const discoverModules = (basePath: PathReference, program: Program): Array<ModuleDeclaration> => {
  throw new NotImplementedException();
};