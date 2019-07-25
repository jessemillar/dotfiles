'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const goOutline_1 = require("./goOutline");
const goReferences_1 = require("./goReferences");
const goBaseCodelens_1 = require("./goBaseCodelens");
const methodRegex = /^func\s+\(\s*\w+\s+\*?\w+\s*\)\s+/;
class ReferencesCodeLens extends vscode_1.CodeLens {
    constructor(document, range) {
        super(range);
        this.document = document;
    }
}
class GoReferencesCodeLensProvider extends goBaseCodelens_1.GoBaseCodeLensProvider {
    provideCodeLenses(document, token) {
        if (!this.enabled) {
            return [];
        }
        const codeLensConfig = vscode.workspace.getConfiguration('go', document.uri).get('enableCodeLens');
        const codelensEnabled = codeLensConfig ? codeLensConfig['references'] : false;
        if (!codelensEnabled) {
            return Promise.resolve([]);
        }
        return this.provideDocumentSymbols(document, token).then(symbols => {
            return symbols.map(symbol => {
                let position = symbol.range.start;
                // Add offset for functions as go-outline returns position at the keyword func instead of func name
                if (symbol.kind === vscode.SymbolKind.Function) {
                    const funcDecl = document.lineAt(position.line).text.substr(position.character);
                    const match = methodRegex.exec(funcDecl);
                    position = position.translate(0, match ? match[0].length : 5);
                }
                return new ReferencesCodeLens(document, new vscode.Range(position, position));
            });
        });
    }
    resolveCodeLens(inputCodeLens, token) {
        const codeLens = inputCodeLens;
        if (token.isCancellationRequested) {
            return Promise.resolve(codeLens);
        }
        const options = {
            includeDeclaration: false
        };
        const referenceProvider = new goReferences_1.GoReferenceProvider();
        return referenceProvider.provideReferences(codeLens.document, codeLens.range.start, options, token).then(references => {
            codeLens.command = {
                title: references.length === 1
                    ? '1 reference'
                    : references.length + ' references',
                command: 'editor.action.showReferences',
                arguments: [codeLens.document.uri, codeLens.range.start, references]
            };
            return codeLens;
        }, err => {
            console.log(err);
            codeLens.command = {
                title: 'Error finding references',
                command: ''
            };
            return codeLens;
        });
    }
    provideDocumentSymbols(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbolProvider = new goOutline_1.GoDocumentSymbolProvider();
            const isTestFile = document.fileName.endsWith('_test.go');
            const symbols = yield symbolProvider.provideDocumentSymbols(document, token);
            return symbols[0].children.filter(symbol => {
                if (symbol.kind === vscode.SymbolKind.Interface) {
                    return true;
                }
                if (symbol.kind === vscode.SymbolKind.Function) {
                    if (isTestFile && (symbol.name.startsWith('Test') || symbol.name.startsWith('Example') || symbol.name.startsWith('Benchmark'))) {
                        return false;
                    }
                    return true;
                }
                return false;
            });
        });
    }
}
exports.GoReferencesCodeLensProvider = GoReferencesCodeLensProvider;
//# sourceMappingURL=goReferencesCodelens.js.map