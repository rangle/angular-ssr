import {
  CallExpression,
  Identifier,
  Program,
  PropertyAccessExpression,
  SyntaxKind,
} from 'typescript';

import chalk = require('chalk');

import {ModuleDeclaration} from '../../project';
import {PathReference} from '../../../filesystem';
import {StaticAnalysisException} from '../../../exception';
import {importClause, exportClause} from '../find';
import {BootstrapFunctions} from '../../../static';
import {isExternalModule} from '../predicates';
import {traverse} from '../traverse';

export const discoverRootModule = (basePath: PathReference, program: Program): ModuleDeclaration => {
  const identifiers = Object.keys(BootstrapFunctions).map(k => BootstrapFunctions[k]).join('|');

  const expression = new RegExp(`(\.${identifiers})`);

  const candidates = new Array<ModuleDeclaration>();

  for (const sourceFile of program.getSourceFiles()) {
    if (isExternalModule(sourceFile) || expression.test(sourceFile.text) === false) { // broad filter, performance optimization
      continue;
    }

    const bootstrapIdentifiers = new Set<string>();

    traverse<CallExpression>(sourceFile, SyntaxKind.CallExpression,
      node => {
        if (node.expression.kind !== SyntaxKind.PropertyAccessExpression) {
          return false;
        }
        const pae = <PropertyAccessExpression> node.expression;
        if (pae.name.kind !== SyntaxKind.Identifier) {
          return false;
        }
        switch (pae.name.text) {
          case BootstrapFunctions.bootstrap:
          case BootstrapFunctions.bootstrapFactory:
            if (node.arguments.length === 0 || node.arguments[0].kind !== SyntaxKind.Identifier) {
              break;
            }
            bootstrapIdentifiers.add((<Identifier> node.arguments[0]).text);
            return true;
        }
        return false;
      });

    for (const identifier of Array.from(bootstrapIdentifiers)) {
      const imported = importClause(basePath.toString(), sourceFile, identifier);
      if (imported) {
        candidates.push(imported);
      }
      else {
        const declaration = exportClause(basePath.toString(), sourceFile, identifier);
        if (declaration) {
          const descriptions = [
            'Pairing bootstrapModule or bootstrapModuleFactory with the root @NgModule in the same file will not work',
            'Otherwise it is impossible to import that module without bootstrapping the application',
            `You must extract "${identifier}" from ${sourceFile.fileName} and export it from a separate file for this to work`
          ];

          throw new StaticAnalysisException(chalk.red(descriptions.join('\n')));
        }
      }
    }
  }

  switch (candidates.length) {
    case 0:
      throw new StaticAnalysisException('No root @NgModule discovered (an NgModule which is passed to a bootstrap function) (use the CLI or API options instead)');
    case 1:
      return candidates[0];
    default:
      throw new StaticAnalysisException(`Multiple root @NgModule discovered, cannot determine the correct one (${candidates.map(m => `${m.symbol} in ${m.source}`).join(', and ')})`);
  }
};
