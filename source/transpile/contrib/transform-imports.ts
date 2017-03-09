// tslint:disable

// This is forked from babel-plugin-transform-inline-imports-commonjs to make defineProperty
// set `configurable' to true so that files can export the same symbol multiple times. This
// may sound silly, but @angular/material has index files that export the same symbol more
// than once. All copyrights etc belongs to the original upstream package author.

const pathModule = require('path');

const builtinModules = new Set(require('builtin-modules/static'));

const THIS_BREAK_KEYS = [
  'FunctionExpression',
  'FunctionDeclaration',
  'ClassProperty',
  'ClassMethod',
  'ObjectMethod',
];

module.exports = context => {
  const template = context.template;
  const t = context.types;

  let buildRequire = template(`
    require($0);
  `);

  let buildExportsModuleDeclaration = template(`
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  `);

  let buildExportsFrom = template(`
    Object.defineProperty(exports, $0, {
      enumerable: true,
      configurable: true,
      get: function () {
        return $1;
      }
    });
  `);

  let buildLooseExportsModuleDeclaration = template(`
    exports.__esModule = true;
  `);

  let buildExportsAssignment = template(`
    exports.$0 = $1;
  `);

  let buildExportAll = template(`
    Object.keys(OBJECT).forEach(function (key) {
      if (key === "default" || key === "__esModule") return;
      Object.defineProperty(exports, key, {
        enumerable: true,
        configurable: true,
        get: function () {
          return OBJECT[key];
        }
      });
    });
  `);

  let REASSIGN_REMAP_SKIP = Symbol();

  let reassignmentVisitor = {
    ReferencedIdentifier(path) {
      let name = path.node.name;
      let remap = this.remaps[name];
      if (!remap) return;

      // redeclared in this scope
      if (this.scope.getBinding(name) !== path.scope.getBinding(name)) return;

      if (path.parentPath.isCallExpression({ callee: path.node })) {
        path.replaceWith(t.sequenceExpression([t.numericLiteral(0), remap]));
      } else {
        path.replaceWith(remap);
      }
      this.requeueInParent(path);
    },

    AssignmentExpression(path) {
      let node = path.node;
      if (node[REASSIGN_REMAP_SKIP]) return;

      let left = path.get('left');
      if (!left.isIdentifier()) return;

      let name = left.node.name;
      let exports = this.exports[name];
      if (!exports) return;

      // redeclared in this scope
      if (this.scope.getBinding(name) !== path.scope.getBinding(name)) return;

      node[REASSIGN_REMAP_SKIP] = true;

      for (let reid of exports) {
        node = buildExportsAssignment(reid, node).expression;
      }

      path.replaceWith(node);
      this.requeueInParent(path);
    },

    UpdateExpression(path) {
      let arg = path.get('argument');
      if (!arg.isIdentifier()) return;

      let name = arg.node.name;
      let exports = this.exports[name];
      if (!exports) return;

      // redeclared in this scope
      if (this.scope.getBinding(name) !== path.scope.getBinding(name)) return;

      let node = t.assignmentExpression(
        path.node.operator[0] + '=',
        arg.node,
        t.numericLiteral(1)
      );

      if (
        (path.parentPath.isExpressionStatement() && !path.isCompletionRecord()) ||
        path.node.prefix
      ) {
        path.replaceWith(node);
        this.requeueInParent(path);
        return;
      }

      let nodes = [];
      nodes.push(node);

      let operator;
      if (path.node.operator === '--') {
        operator = '+';
      } else { // '++'
        operator = '-';
      }
      nodes.push(t.binaryExpression(operator, arg.node, t.numericLiteral(1)));

      path.replaceWithMultiple(t.sequenceExpression(nodes));
    }
  };

  return {
    inherits: require('babel-plugin-transform-strict-mode'),

    visitor: {
      ThisExpression(path, state) {
        // If other plugins run after this plugin's Program#exit handler, we allow them to
        // insert top-level `this` values. This allows the AMD and UMD plugins to
        // function properly.
        if (this.ranCommonJS) return;

        if (
          state.opts.allowTopLevelThis !== true &&
          !path.findParent((path) => !path.is('shadow') &&
          THIS_BREAK_KEYS.indexOf(path.type) >= 0)
        ) {
          path.replaceWith(t.identifier('undefined'));
        }
      },

      Program: {
        exit(path) {
          this.ranCommonJS = true;

          let strict = !!this.opts.strict;

          // rename these commonjs variables if they're declared in the file
          path.scope.rename('module');
          path.scope.rename('exports');
          path.scope.rename('require');

          let hasExports = false;
          let hasImports = false;

          let body = path.get('body');
          let imports = Object.create(null);
          let exports = Object.create(null);

          let nonHoistedExportNames = Object.create(null);

          let topNodes = [];
          let remaps = Object.create(null);

          let requires = Object.create(null);

          const excludeNodeBuiltins = this.opts.excludeNodeBuiltins
            ? builtinModules
            : null;
          const excludeModules = Array.isArray(this.opts.excludeModules)
            ? new Set(this.opts.excludeModules)
            : null;

          const addRequire = (source, blockHoist, interop?) => {
            const cacheKey = JSON.stringify({source, interop});

            let cached = requires[cacheKey];
            if (cached) return cached;

            // require(moduleID);
            const requireCallExpression = buildRequire(t.stringLiteral(source)).expression;

            // $INTEROP(require(moduleID));
            const wrappedRequireCall = interop
              ? t.callExpression(this.addHelper(interop), [requireCallExpression])
              : requireCallExpression;

            if (
              (excludeNodeBuiltins && excludeNodeBuiltins.has(source)) ||
              (excludeModules && excludeModules.has(source))
            ) {
              // var memoizedID;
              const declID = path.scope.generateUidIdentifier(source);
              const varDecl = t.variableDeclaration('var', [
                t.variableDeclarator(declID, wrappedRequireCall)
              ]);
              // Copy location from the original import statement for sourcemap
              // generation.
              if (imports[source]) {
                varDecl.loc = imports[source].loc;
              }
              if (typeof blockHoist === 'number' && blockHoist > 0) {
                varDecl._blockHoist = blockHoist;
              }
              topNodes.push(varDecl);
              return requires[cacheKey] = declID;
            }

            const filename = pathModule.basename(source, pathModule.extname(source));
            const memoizedID =
              path.scope.generateUidIdentifier(filename);
            const memoizedFunction =
              path.scope.generateUidIdentifier('load' + memoizedID.name);

            // var memoizedID;
            const memoizerVarDecl =
              t.variableDeclaration('var', [t.variableDeclarator(memoizedID)]);

            // function memoizedFunction() { return memoizedID = expression; }
            const memoizerFuncDecl =
              t.functionDeclaration(memoizedFunction, [], t.blockStatement([
                t.returnStatement(t.assignmentExpression('=', memoizedID, wrappedRequireCall)),
              ]));

            // memoizedID || memoizedFunction();
            const memoizedRef =
              t.logicalExpression('||', memoizedID, t.callExpression(memoizedFunction, []));

            // Copy location from the original import statement for sourcemap
            // generation.
            if (imports[source]) {
              memoizerFuncDecl.loc = imports[source].loc;
            }

            if (typeof blockHoist === 'number' && blockHoist > 0) {
              memoizerVarDecl._blockHoist = blockHoist;
              memoizerFuncDecl._blockHoist = blockHoist;
            }

            topNodes.push(memoizerVarDecl, memoizerFuncDecl);

            return requires[cacheKey] = memoizedRef;
          }

          function addTo(obj, key, arr) {
            let existing = obj[key] || [];
            obj[key] = existing.concat(arr);
          }

          for (let path of body) {
            if (path.isExportDeclaration()) {
              hasExports = true;

              let specifiers = [].concat(path.get('declaration'), path.get('specifiers'));
              for (let specifier of specifiers) {
                let ids = specifier.getBindingIdentifiers();
                if (ids.__esModule) {
                  throw specifier.buildCodeFrameError('Illegal export "__esModule"');
                }
              }
            }

            if (path.isImportDeclaration()) {
              hasImports = true;

              let key = path.node.source.value;
              let importsEntry = imports[key] || {
                specifiers: [],
                maxBlockHoist: 0,
                loc: path.node.loc,
              };

              Array.prototype.push.apply(
                importsEntry.specifiers,
                path.node.specifiers
              );

              if (typeof path.node._blockHoist === 'number') {
                importsEntry.maxBlockHoist = Math.max(
                  path.node._blockHoist,
                  importsEntry.maxBlockHoist
                );
              }

              imports[key] = importsEntry;

              path.remove();
            } else if (path.isExportDefaultDeclaration()) {
              let declaration = path.get('declaration');
              if (declaration.isFunctionDeclaration()) {
                let id = declaration.node.id;
                let defNode = t.identifier('default');
                if (id) {
                  addTo(exports, id.name, defNode);
                  topNodes.push(buildExportsAssignment(defNode, id));
                  path.replaceWith(declaration.node);
                } else {
                  topNodes.push(
                    buildExportsAssignment(defNode, t.toExpression(declaration.node))
                  );
                  path.remove();
                }
              } else if (declaration.isClassDeclaration()) {
                let id = declaration.node.id;
                let defNode = t.identifier('default');
                if (id) {
                  addTo(exports, id.name, defNode);
                  path.replaceWithMultiple([
                    declaration.node,
                    buildExportsAssignment(defNode, id)
                  ]);
                } else {
                  path.replaceWith(
                    buildExportsAssignment(defNode, t.toExpression(declaration.node))
                  );

                  // Manualy re-queue `export default class {}` expressions so
                  // that the ES3 transform has an opportunity to convert them.
                  // Ideally this would happen automatically from the
                  // replaceWith above. See #4140 for more info.
                  path.parentPath.requeue(path.get('expression.left'));
                }
              } else {
                path.replaceWith(
                  buildExportsAssignment(t.identifier('default'), declaration.node)
                );

                // Manualy re-queue `export default foo;` expressions so that
                // the ES3 transform has an opportunity to convert them. Ideally
                // this would happen automatically from the replaceWith above.
                // See #4140 for more info.
                path.parentPath.requeue(path.get('expression.left'));
              }
            } else if (path.isExportNamedDeclaration()) {
              let declaration = path.get('declaration');
              if (declaration.node) {
                if (declaration.isFunctionDeclaration()) {
                  let id = declaration.node.id;
                  addTo(exports, id.name, id);
                  topNodes.push(buildExportsAssignment(id, id));
                  path.replaceWith(declaration.node);
                } else if (declaration.isClassDeclaration()) {
                  let id = declaration.node.id;
                  addTo(exports, id.name, id);
                  path.replaceWithMultiple([
                    declaration.node,
                    buildExportsAssignment(id, id)
                  ]);
                  nonHoistedExportNames[id.name] = true;
                } else if (declaration.isVariableDeclaration()) {
                  let declarators = declaration.get('declarations');
                  for (let decl of declarators) {
                    let id = decl.get('id');

                    let init = decl.get('init');
                    if (!init.node) init.replaceWith(t.identifier('undefined'));

                    if (id.isIdentifier()) {
                      addTo(exports, id.node.name, id.node);
                      init.replaceWith(buildExportsAssignment(id.node, init.node).expression);
                      nonHoistedExportNames[id.node.name] = true;
                    } else {
                      // todo
                    }
                  }
                  path.replaceWith(declaration.node);
                }
                continue;
              }

              let specifiers = path.get('specifiers');
              let nodes = [];
              let source = path.node.source;
              if (source) {
                let ref = addRequire(source.value, path.node._blockHoist);

                for (let specifier of specifiers) {
                  if (specifier.isExportNamespaceSpecifier()) {
                    // todo
                  } else if (specifier.isExportDefaultSpecifier()) {
                    // todo
                  } else if (specifier.isExportSpecifier()) {
                    if (specifier.node.local.name === 'default') {
                      topNodes.push(
                        buildExportsFrom(
                          t.stringLiteral(specifier.node.exported.name),
                          t.memberExpression(
                            t.callExpression(this.addHelper('interopRequireDefault'), [ref]),
                            specifier.node.local
                          )
                        )
                      );
                    } else {
                      topNodes.push(
                        buildExportsFrom(
                          t.stringLiteral(specifier.node.exported.name),
                          t.memberExpression(ref, specifier.node.local)
                        )
                      );
                    }
                    nonHoistedExportNames[specifier.node.exported.name] = true;
                  }
                }
              } else {
                for (let specifier of specifiers) {
                  if (specifier.isExportSpecifier()) {
                    addTo(exports, specifier.node.local.name, specifier.node.exported);
                    nonHoistedExportNames[specifier.node.exported.name] = true;
                    nodes.push(
                      buildExportsAssignment(
                        specifier.node.exported,
                        specifier.node.local
                      )
                    );
                  }
                }
              }
              path.replaceWithMultiple(nodes);
            } else if (path.isExportAllDeclaration()) {
              let exportNode = buildExportAll({
                OBJECT: addRequire(path.node.source.value, path.node._blockHoist)
              });
              exportNode.loc = path.node.loc;
              topNodes.push(exportNode);
              path.remove();
            }
          }

          for (let source in imports) {
            let specifiers = imports[source].specifiers;
            let maxBlockHoist = imports[source].maxBlockHoist;

            if (specifiers.length) {
              let uid;

              let wildcard;

              for (let i = 0; i < specifiers.length; i++) {
                let specifier = specifiers[i];
                if (t.isImportNamespaceSpecifier(specifier)) {
                  if (strict) {
                    if (!uid) uid = addRequire(source, maxBlockHoist);
                    remaps[specifier.local.name] = uid;
                  } else {
                    if (!uid) uid = addRequire(source, maxBlockHoist, 'interopRequireWildcard');
                    remaps[specifier.local.name] = uid;
                  }
                  wildcard = uid;
                } else if (t.isImportDefaultSpecifier(specifier)) {
                  specifiers[i] = t.importSpecifier(specifier.local, t.identifier('default'));
                }
              }

              for (let specifier of specifiers) {
                if (t.isImportSpecifier(specifier)) {
                  let target;
                  if (specifier.imported.name === 'default') {
                    if (wildcard) {
                      target = wildcard;
                    } else {
                      if (!uid) uid = addRequire(source, maxBlockHoist, 'interopRequireDefault');
                      target = wildcard = uid;
                    }
                  }
                  if (!target) target = addRequire(source, maxBlockHoist);
                  remaps[specifier.local.name] = t.memberExpression(
                    target,
                    t.cloneWithoutLoc(specifier.imported)
                  );
                }
              }
            } else {
              // bare import
              let requireNode = buildRequire(t.stringLiteral(source));
              requireNode.loc = imports[source].loc;
              topNodes.push(requireNode);
            }
          }

          if (hasImports && Object.keys(nonHoistedExportNames).length) {
            let hoistedExportsNode = t.identifier('undefined');

            for (let name in nonHoistedExportNames) {
              hoistedExportsNode = buildExportsAssignment(
                t.identifier(name),
                hoistedExportsNode
              ).expression;
            }

            const node = t.expressionStatement(hoistedExportsNode);
            node._blockHoist = 3;

            topNodes.unshift(node);
          }

          // add __esModule declaration if this file has any exports
          if (hasExports && !strict) {
            let buildTemplate = buildExportsModuleDeclaration;
            if (this.opts.loose) buildTemplate = buildLooseExportsModuleDeclaration;

            const declar = buildTemplate();
            declar._blockHoist = 3;

            topNodes.unshift(declar);
          }

          path.unshiftContainer('body', topNodes);
          path.traverse(reassignmentVisitor, {
            remaps,
            scope: path.scope,
            exports,
            requeueInParent: (newPath) => path.requeue(newPath),
          });
        }
      }
    }
  };
}
