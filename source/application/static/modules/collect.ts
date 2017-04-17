import {
  CallExpression,
  ClassDeclaration,
  Identifier,
  Program,
  SyntaxKind
} from 'typescript';

import {ModuleDeclaration} from '../../project';
import {PathReference} from '../../../filesystem';
import {isExternalModule} from '../predicates';
import {importClause} from '../find';
import {traverse} from '../traverse';

export const collectModules = (basePath: PathReference, program: Program): Array<ModuleDeclaration> => {
  const modules = new Array<ModuleDeclaration>();

  for (const sourceFile of program.getSourceFiles()) {
    if (isExternalModule(sourceFile)) {
      continue;
    }

    traverse<ClassDeclaration>(sourceFile, SyntaxKind.ClassDeclaration,
      node => {
        for (const decorator of node.decorators || []) {
          if (decorator.expression.kind !== SyntaxKind.CallExpression) {
            continue;
          }

          const subexpr: Identifier = (decorator.expression as CallExpression).expression as any;

          const imported = importClause(basePath.toString(), sourceFile, subexpr.text);
          if (imported == null) {
            continue;
          }

          if (imported.symbol === 'NgModule') {
            modules.push({
              source: sourceFile.fileName,
              symbol: node.name.text,
            });
          }
        }
        return false;
      });
  }

  return modules;
};