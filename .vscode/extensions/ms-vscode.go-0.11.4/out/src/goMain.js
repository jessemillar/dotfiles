/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
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
const goSuggest_1 = require("./goSuggest");
const goExtraInfo_1 = require("./goExtraInfo");
const goDeclaration_1 = require("./goDeclaration");
const goReferences_1 = require("./goReferences");
const goImplementations_1 = require("./goImplementations");
const goTypeDefinition_1 = require("./goTypeDefinition");
const goFormat_1 = require("./goFormat");
const goRename_1 = require("./goRename");
const goOutline_1 = require("./goOutline");
const goRunTestCodelens_1 = require("./goRunTestCodelens");
const goSignature_1 = require("./goSignature");
const goSymbol_1 = require("./goSymbol");
const goCodeAction_1 = require("./goCodeAction");
const goCheck_1 = require("./goCheck");
const goInstallTools_1 = require("./goInstallTools");
const goMode_1 = require("./goMode");
const goStatus_1 = require("./goStatus");
const goCover_1 = require("./goCover");
const goTest_1 = require("./goTest");
const testUtils_1 = require("./testUtils");
const goGenerateTests = require("./goGenerateTests");
const goImport_1 = require("./goImport");
const goInstallTools_2 = require("./goInstallTools");
const util_1 = require("./util");
const vscode_languageclient_1 = require("vscode-languageclient");
const goPath_1 = require("./goPath");
const goModifytags_1 = require("./goModifytags");
const goFillStruct_1 = require("./goFillStruct");
const goLiveErrors_1 = require("./goLiveErrors");
const goReferencesCodelens_1 = require("./goReferencesCodelens");
const goImpl_1 = require("./goImpl");
const goDoctor_1 = require("./goDoctor");
const goBrowsePackage_1 = require("./goBrowsePackage");
const goGetPackage_1 = require("./goGetPackage");
const goDebugConfiguration_1 = require("./goDebugConfiguration");
const goPlayground_1 = require("./goPlayground");
const goLint_1 = require("./goLint");
const goVet_1 = require("./goVet");
const goBuild_1 = require("./goBuild");
const goInstall_1 = require("./goInstall");
const stateUtils_1 = require("./stateUtils");
function activate(ctx) {
    stateUtils_1.setGlobalState(ctx.globalState);
    goInstallTools_1.updateGoPathGoRootFromConfig().then(() => __awaiter(this, void 0, void 0, function* () {
        const updateToolsCmdText = 'Update tools';
        const toolsGoInfo = ctx.globalState.get('toolsGoInfo') || {};
        const toolsGopath = util_1.getToolsGopath() || util_1.getCurrentGoPath();
        if (!toolsGoInfo[toolsGopath]) {
            toolsGoInfo[toolsGopath] = { goroot: null, version: null };
        }
        const prevGoroot = toolsGoInfo[toolsGopath].goroot;
        const currentGoroot = process.env['GOROOT'] && process.env['GOROOT'].toLowerCase();
        if (prevGoroot && prevGoroot.toLowerCase() !== currentGoroot) {
            vscode.window.showInformationMessage(`Your current goroot (${currentGoroot}) is different than before (${prevGoroot}), a few Go tools may need recompiling`, updateToolsCmdText).then(selected => {
                if (selected === updateToolsCmdText) {
                    goInstallTools_2.installAllTools(true);
                }
            });
        }
        else {
            const currentVersion = yield util_1.getGoVersion();
            if (currentVersion) {
                const prevVersion = toolsGoInfo[toolsGopath].version;
                const currVersionString = `${currentVersion.major}.${currentVersion.minor}`;
                if (prevVersion !== currVersionString) {
                    if (prevVersion) {
                        vscode.window.showInformationMessage('Your Go version is different than before, few Go tools may need re-compiling', updateToolsCmdText).then(selected => {
                            if (selected === updateToolsCmdText) {
                                goInstallTools_2.installAllTools(true);
                            }
                        });
                    }
                    toolsGoInfo[toolsGopath].version = currVersionString;
                }
            }
        }
        toolsGoInfo[toolsGopath].goroot = currentGoroot;
        ctx.globalState.update('toolsGoInfo', toolsGoInfo);
        goInstallTools_1.offerToInstallTools();
        const languageServerToolPath = goInstallTools_2.getLanguageServerToolPath();
        if (languageServerToolPath) {
            const languageServerTool = goPath_1.getToolFromToolPath(languageServerToolPath);
            const languageServerExperimentalFeatures = vscode.workspace.getConfiguration('go').get('languageServerExperimentalFeatures') || {};
            const langServerFlags = vscode.workspace.getConfiguration('go')['languageServerFlags'] || [];
            // `-trace was a flag for `go-langserver` which is replaced with `-rpc.trace` for gopls to avoid crash
            const traceFlagIndex = langServerFlags.indexOf('-trace');
            if (traceFlagIndex > -1 && languageServerTool === 'gopls') {
                langServerFlags[traceFlagIndex] = '-rpc.trace';
            }
            const c = new vscode_languageclient_1.LanguageClient(languageServerTool, {
                command: languageServerToolPath,
                args: ['-mode=stdio', ...langServerFlags],
                options: {
                    env: util_1.getToolsEnvVars()
                }
            }, {
                initializationOptions: {
                    funcSnippetEnabled: vscode.workspace.getConfiguration('go')['useCodeSnippetsOnFunctionSuggest'],
                    gocodeCompletionEnabled: languageServerExperimentalFeatures['autoComplete'],
                    incrementalSync: languageServerExperimentalFeatures['incrementalSync']
                },
                documentSelector: ['go', 'go.mod', 'go.sum'],
                uriConverters: {
                    // Apply file:/// scheme to all file paths.
                    code2Protocol: (uri) => (uri.scheme ? uri : uri.with({ scheme: 'file' })).toString(),
                    protocol2Code: (uri) => vscode.Uri.parse(uri),
                },
                revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
                middleware: {
                    provideDocumentFormattingEdits: (document, options, token, next) => {
                        if (languageServerExperimentalFeatures['format'] === true) {
                            return next(document, options, token);
                        }
                        return [];
                    },
                    provideCompletionItem: (document, position, context, token, next) => __awaiter(this, void 0, void 0, function* () {
                        if (languageServerExperimentalFeatures['autoComplete'] === true) {
                            const promiseFromLanguageServer = Promise.resolve(next(document, position, context, token));
                            const promiseWithoutGoCode = goSuggest_1.getCompletionsWithoutGoCode(document, position);
                            const [resultFromLanguageServer, resultWithoutGoCode] = yield Promise.all([promiseFromLanguageServer, promiseWithoutGoCode]);
                            if (!resultWithoutGoCode || !resultWithoutGoCode.length) {
                                return resultFromLanguageServer;
                            }
                            const completionItemsFromLanguageServer = Array.isArray(resultFromLanguageServer) ? resultFromLanguageServer : resultFromLanguageServer.items;
                            resultWithoutGoCode.forEach(x => {
                                if (x.kind !== vscode.CompletionItemKind.Module || !completionItemsFromLanguageServer.some(y => y.label === x.label)) {
                                    completionItemsFromLanguageServer.push(x);
                                }
                            });
                            return resultFromLanguageServer;
                        }
                        return [];
                    }),
                    provideRenameEdits: (document, position, newName, token, next) => {
                        if (languageServerExperimentalFeatures['rename'] === true) {
                            return next(document, position, newName, token);
                        }
                        return null;
                    },
                    provideDefinition: (document, position, token, next) => {
                        if (languageServerExperimentalFeatures['goToDefinition'] === true) {
                            return next(document, position, token);
                        }
                        return null;
                    },
                    provideTypeDefinition: (document, position, token, next) => {
                        if (languageServerExperimentalFeatures['goToTypeDefinition'] === true) {
                            return next(document, position, token);
                        }
                        return null;
                    },
                    provideHover: (document, position, token, next) => {
                        if (languageServerExperimentalFeatures['hover'] === true) {
                            return next(document, position, token);
                        }
                        return null;
                    },
                    provideReferences: (document, position, options, token, next) => {
                        if (languageServerExperimentalFeatures['findReferences'] === true) {
                            return next(document, position, options, token);
                        }
                        return [];
                    },
                    provideSignatureHelp: (document, position, token, next) => {
                        if (languageServerExperimentalFeatures['signatureHelp'] === true) {
                            return next(document, position, token);
                        }
                        return null;
                    },
                    provideDocumentSymbols: (document, token, next) => {
                        if (languageServerExperimentalFeatures['documentSymbols'] === true) {
                            return next(document, token);
                        }
                        return [];
                    },
                    provideWorkspaceSymbols: (query, token, next) => {
                        if (languageServerExperimentalFeatures['workspaceSymbols'] === true) {
                            return next(query, token);
                        }
                        return [];
                    },
                    provideImplementation: (document, position, token, next) => {
                        if (languageServerExperimentalFeatures['goToImplementation'] === true) {
                            return next(document, position, token);
                        }
                        return null;
                    },
                    handleDiagnostics: (uri, diagnostics, next) => {
                        if (languageServerExperimentalFeatures['diagnostics'] === true) {
                            return next(uri, diagnostics);
                        }
                        return null;
                    },
                    provideDocumentLinks: (document, token, next) => {
                        if (languageServerExperimentalFeatures['documentLink'] === true) {
                            return next(document, token);
                        }
                        return null;
                    }
                }
            });
            c.onReady().then(() => {
                const capabilities = c.initializeResult && c.initializeResult.capabilities;
                if (!capabilities) {
                    return vscode.window.showErrorMessage('The language server is not able to serve any features at the moment.');
                }
                if (languageServerExperimentalFeatures['autoComplete'] !== true || !capabilities.completionProvider) {
                    registerCompletionProvider(ctx);
                }
                if (languageServerExperimentalFeatures['format'] !== true || !capabilities.documentFormattingProvider) {
                    ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(goMode_1.GO_MODE, new goFormat_1.GoDocumentFormattingEditProvider()));
                }
                if (languageServerExperimentalFeatures['rename'] !== true || !capabilities.renameProvider) {
                    ctx.subscriptions.push(vscode.languages.registerRenameProvider(goMode_1.GO_MODE, new goRename_1.GoRenameProvider()));
                }
                if (languageServerExperimentalFeatures['goToTypeDefinition'] !== true || !capabilities.typeDefinitionProvider) {
                    ctx.subscriptions.push(vscode.languages.registerTypeDefinitionProvider(goMode_1.GO_MODE, new goTypeDefinition_1.GoTypeDefinitionProvider()));
                }
                if (languageServerExperimentalFeatures['hover'] !== true || !capabilities.hoverProvider) {
                    ctx.subscriptions.push(vscode.languages.registerHoverProvider(goMode_1.GO_MODE, new goExtraInfo_1.GoHoverProvider()));
                }
                if (languageServerExperimentalFeatures['goToDefinition'] !== true || !capabilities.definitionProvider) {
                    ctx.subscriptions.push(vscode.languages.registerDefinitionProvider(goMode_1.GO_MODE, new goDeclaration_1.GoDefinitionProvider()));
                }
                if (languageServerExperimentalFeatures['findReferences'] !== true || !capabilities.referencesProvider) {
                    ctx.subscriptions.push(vscode.languages.registerReferenceProvider(goMode_1.GO_MODE, new goReferences_1.GoReferenceProvider()));
                }
                if (languageServerExperimentalFeatures['documentSymbols'] !== true || !capabilities.documentSymbolProvider) {
                    ctx.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(goMode_1.GO_MODE, new goOutline_1.GoDocumentSymbolProvider()));
                }
                if (languageServerExperimentalFeatures['signatureHelp'] !== true || !capabilities.signatureHelpProvider) {
                    ctx.subscriptions.push(vscode.languages.registerSignatureHelpProvider(goMode_1.GO_MODE, new goSignature_1.GoSignatureHelpProvider(), '(', ','));
                }
                if (languageServerExperimentalFeatures['workspaceSymbols'] !== true || !capabilities.workspaceSymbolProvider) {
                    ctx.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new goSymbol_1.GoWorkspaceSymbolProvider()));
                }
                if (languageServerExperimentalFeatures['goToImplementation'] !== true || !capabilities.implementationProvider) {
                    ctx.subscriptions.push(vscode.languages.registerImplementationProvider(goMode_1.GO_MODE, new goImplementations_1.GoImplementationProvider()));
                }
            });
            let languageServerDisposable = c.start();
            ctx.subscriptions.push(languageServerDisposable);
            ctx.subscriptions.push(vscode.commands.registerCommand('go.languageserver.restart', () => __awaiter(this, void 0, void 0, function* () {
                yield c.stop();
                languageServerDisposable.dispose();
                languageServerDisposable = c.start();
                ctx.subscriptions.push(languageServerDisposable);
            })));
            if (languageServerTool !== 'gopls' || !languageServerExperimentalFeatures['diagnostics']) {
                vscode.workspace.onDidChangeTextDocument(goLiveErrors_1.parseLiveFile, null, ctx.subscriptions);
            }
        }
        else {
            registerCompletionProvider(ctx);
            ctx.subscriptions.push(vscode.languages.registerHoverProvider(goMode_1.GO_MODE, new goExtraInfo_1.GoHoverProvider()));
            ctx.subscriptions.push(vscode.languages.registerDefinitionProvider(goMode_1.GO_MODE, new goDeclaration_1.GoDefinitionProvider()));
            ctx.subscriptions.push(vscode.languages.registerReferenceProvider(goMode_1.GO_MODE, new goReferences_1.GoReferenceProvider()));
            ctx.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(goMode_1.GO_MODE, new goOutline_1.GoDocumentSymbolProvider()));
            ctx.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new goSymbol_1.GoWorkspaceSymbolProvider()));
            ctx.subscriptions.push(vscode.languages.registerSignatureHelpProvider(goMode_1.GO_MODE, new goSignature_1.GoSignatureHelpProvider(), '(', ','));
            ctx.subscriptions.push(vscode.languages.registerImplementationProvider(goMode_1.GO_MODE, new goImplementations_1.GoImplementationProvider()));
            ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(goMode_1.GO_MODE, new goFormat_1.GoDocumentFormattingEditProvider()));
            ctx.subscriptions.push(vscode.languages.registerTypeDefinitionProvider(goMode_1.GO_MODE, new goTypeDefinition_1.GoTypeDefinitionProvider()));
            ctx.subscriptions.push(vscode.languages.registerRenameProvider(goMode_1.GO_MODE, new goRename_1.GoRenameProvider()));
            vscode.workspace.onDidChangeTextDocument(goLiveErrors_1.parseLiveFile, null, ctx.subscriptions);
        }
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'go' && util_1.isGoPathSet()) {
            runBuilds(vscode.window.activeTextEditor.document, vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor.document.uri));
        }
    }));
    goCover_1.initCoverageDecorators(ctx);
    const testCodeLensProvider = new goRunTestCodelens_1.GoRunTestCodeLensProvider();
    const referencesCodeLensProvider = new goReferencesCodelens_1.GoReferencesCodeLensProvider();
    ctx.subscriptions.push(vscode.languages.registerCodeActionsProvider(goMode_1.GO_MODE, new goCodeAction_1.GoCodeActionProvider()));
    ctx.subscriptions.push(vscode.languages.registerCodeLensProvider(goMode_1.GO_MODE, testCodeLensProvider));
    ctx.subscriptions.push(vscode.languages.registerCodeLensProvider(goMode_1.GO_MODE, referencesCodeLensProvider));
    ctx.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('go', new goDebugConfiguration_1.GoDebugConfigurationProvider()));
    exports.buildDiagnosticCollection = vscode.languages.createDiagnosticCollection('go');
    ctx.subscriptions.push(exports.buildDiagnosticCollection);
    exports.lintDiagnosticCollection = vscode.languages.createDiagnosticCollection('go-lint');
    ctx.subscriptions.push(exports.lintDiagnosticCollection);
    exports.vetDiagnosticCollection = vscode.languages.createDiagnosticCollection('go-vet');
    ctx.subscriptions.push(exports.vetDiagnosticCollection);
    addOnChangeTextDocumentListeners(ctx);
    addOnChangeActiveTextEditorListeners(ctx);
    addOnSaveTextDocumentListeners(ctx);
    ctx.subscriptions.push(vscode.commands.registerCommand('go.gopath', () => {
        const gopath = util_1.getCurrentGoPath();
        let msg = `${gopath} is the current GOPATH.`;
        const wasInfered = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null)['inferGopath'];
        let root = vscode.workspace.rootPath;
        if (vscode.window.activeTextEditor && vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri)) {
            root = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri).uri.fsPath;
            root = goPath_1.fixDriveCasingInWindows(root);
        }
        // not only if it was configured, but if it was successful.
        if (wasInfered && root && root.indexOf(gopath) === 0) {
            const inferredFrom = vscode.window.activeTextEditor ? 'current folder' : 'workspace root';
            msg += ` It is inferred from ${inferredFrom}`;
        }
        vscode.window.showInformationMessage(msg);
        return gopath;
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.add.tags', (args) => {
        goModifytags_1.addTags(args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.remove.tags', (args) => {
        goModifytags_1.removeTags(args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.fill.struct', () => {
        goFillStruct_1.runFillStruct(vscode.window.activeTextEditor);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.impl.cursor', () => {
        goImpl_1.implCursor();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.godoctor.extract', () => {
        goDoctor_1.extractFunction();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.godoctor.var', () => {
        goDoctor_1.extractVariable();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.cursor', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        goTest_1.testAtCursor(goConfig, 'test', args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.debug.cursor', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        goTest_1.testAtCursor(goConfig, 'debug', args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.benchmark.cursor', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        goTest_1.testAtCursor(goConfig, 'benchmark', args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.package', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        const isBenchmark = false;
        goTest_1.testCurrentPackage(goConfig, isBenchmark, args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.benchmark.package', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        const isBenchmark = true;
        goTest_1.testCurrentPackage(goConfig, isBenchmark, args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.file', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        const isBenchmark = false;
        goTest_1.testCurrentFile(goConfig, isBenchmark, args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.benchmark.file', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        const isBenchmark = true;
        goTest_1.testCurrentFile(goConfig, isBenchmark, args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.workspace', (args) => {
        const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        goTest_1.testWorkspace(goConfig, args);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.previous', () => {
        goTest_1.testPrevious();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.coverage', () => {
        goCover_1.toggleCoverageCurrentPackage();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.showOutput', () => {
        testUtils_1.showTestOutput();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.cancel', () => {
        testUtils_1.cancelRunningTests();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.import.add', (arg) => {
        return goImport_1.addImport(arg);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.add.package.workspace', () => {
        goImport_1.addImportToWorkspace();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.tools.install', (args) => {
        if (Array.isArray(args) && args.length) {
            util_1.getGoVersion().then(goVersion => {
                goInstallTools_1.installTools(args, goVersion);
            });
            return;
        }
        goInstallTools_2.installAllTools();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.browse.packages', () => {
        goBrowsePackage_1.browsePackages();
    }));
    ctx.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (!e.affectsConfiguration('go')) {
            return;
        }
        const updatedGoConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
        sendTelemetryEventForConfig(updatedGoConfig);
        goInstallTools_1.updateGoPathGoRootFromConfig();
        // If there was a change in "toolsGopath" setting, then clear cache for go tools
        if (util_1.getToolsGopath() !== util_1.getToolsGopath(false)) {
            goPath_1.clearCacheForTools();
        }
        const languageServerToolPathBeingUsed = goInstallTools_2.getLanguageServerToolPath();
        let reloadMessage;
        if (e.affectsConfiguration('go.useLanguageServer')) {
            if (updatedGoConfig['useLanguageServer']) {
                if (languageServerToolPathBeingUsed) {
                    reloadMessage = 'Reload VS Code window to enable the use of language server';
                }
            }
            else {
                reloadMessage = 'Reload VS Code window to disable the use of language server';
            }
        }
        else if (e.affectsConfiguration('go.languageServerFlags') || e.affectsConfiguration('go.languageServerExperimentalFeatures')) {
            reloadMessage = 'Reload VS Code window for the changes in language server settings to take effect';
        }
        // If there was a change in "useLanguageServer" setting, then ask the user to reload VS Code.
        if (reloadMessage) {
            vscode.window.showInformationMessage(reloadMessage, 'Reload').then(selected => {
                if (selected === 'Reload') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }
        if (updatedGoConfig['enableCodeLens']) {
            testCodeLensProvider.setEnabled(updatedGoConfig['enableCodeLens']['runtest']);
            referencesCodeLensProvider.setEnabled(updatedGoConfig['enableCodeLens']['references']);
        }
        const languageServerExperimentalFeatures = updatedGoConfig.get('languageServerExperimentalFeatures');
        if (e.affectsConfiguration('go.formatTool') && (!languageServerToolPathBeingUsed || languageServerExperimentalFeatures['format'] === false)) {
            checkToolExists(updatedGoConfig['formatTool']);
        }
        if (e.affectsConfiguration('go.lintTool')) {
            checkToolExists(updatedGoConfig['lintTool']);
        }
        if (e.affectsConfiguration('go.docsTool')) {
            checkToolExists(updatedGoConfig['docsTool']);
        }
        if (e.affectsConfiguration('go.coverageDecorator')) {
            goCover_1.updateCodeCoverageDecorators(updatedGoConfig['coverageDecorator']);
        }
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.generate.package', () => {
        goGenerateTests.generateTestCurrentPackage();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.generate.file', () => {
        goGenerateTests.generateTestCurrentFile();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.test.generate.function', () => {
        goGenerateTests.generateTestCurrentFunction();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.toggle.test.file', () => {
        goGenerateTests.toggleTestFile();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.debug.startSession', config => {
        let workspaceFolder;
        if (vscode.window.activeTextEditor) {
            workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
        }
        return vscode.debug.startDebugging(workspaceFolder, config);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.show.commands', () => {
        const extCommands = util_1.getExtensionCommands();
        extCommands.push({
            command: 'editor.action.goToDeclaration',
            title: 'Go to Definition'
        });
        extCommands.push({
            command: 'editor.action.goToImplementation',
            title: 'Go to Implementation'
        });
        extCommands.push({
            command: 'workbench.action.gotoSymbol',
            title: 'Go to Symbol in File...'
        });
        extCommands.push({
            command: 'workbench.action.showAllSymbols',
            title: 'Go to Symbol in Workspace...'
        });
        vscode.window.showQuickPick(extCommands.map(x => x.title)).then(cmd => {
            const selectedCmd = extCommands.find(x => x.title === cmd);
            if (selectedCmd) {
                vscode.commands.executeCommand(selectedCmd.command);
            }
        });
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.get.package', goGetPackage_1.goGetPackage));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.playground', goPlayground_1.playgroundCommand));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.lint.package', () => goLint_1.lintCode('package')));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.lint.workspace', () => goLint_1.lintCode('workspace')));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.lint.file', () => goLint_1.lintCode('file')));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.vet.package', goVet_1.vetCode));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.vet.workspace', () => goVet_1.vetCode(true)));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.build.package', goBuild_1.buildCode));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.build.workspace', () => goBuild_1.buildCode(true)));
    ctx.subscriptions.push(vscode.commands.registerCommand('go.install.package', goInstall_1.installCurrentPackage));
    vscode.languages.setLanguageConfiguration(goMode_1.GO_MODE.language, {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    });
    sendTelemetryEventForConfig(vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null));
}
exports.activate = activate;
function deactivate() {
    return Promise.all([util_1.disposeTelemetryReporter(), testUtils_1.cancelRunningTests(), Promise.resolve(util_1.cleanupTempDir())]);
}
exports.deactivate = deactivate;
function runBuilds(document, goConfig) {
    if (document.languageId !== 'go') {
        return;
    }
    exports.buildDiagnosticCollection.clear();
    exports.lintDiagnosticCollection.clear();
    exports.vetDiagnosticCollection.clear();
    goCheck_1.check(document.uri, goConfig)
        .then(results => {
        results.forEach(result => {
            util_1.handleDiagnosticErrors(document, result.errors, result.diagnosticCollection);
        });
    })
        .catch(err => {
        vscode.window.showInformationMessage('Error: ' + err);
    });
}
function addOnSaveTextDocumentListeners(ctx) {
    vscode.workspace.onDidSaveTextDocument(document => {
        if (document.languageId !== 'go') {
            return;
        }
        if (vscode.window.visibleTextEditors.some(e => e.document.fileName === document.fileName)) {
            runBuilds(document, vscode.workspace.getConfiguration('go', document.uri));
        }
    }, null, ctx.subscriptions);
}
function addOnChangeTextDocumentListeners(ctx) {
    vscode.workspace.onDidChangeTextDocument(goCover_1.removeCodeCoverageOnFileChange, null, ctx.subscriptions);
    vscode.workspace.onDidChangeTextDocument(goCheck_1.removeTestStatus, null, ctx.subscriptions);
    vscode.workspace.onDidChangeTextDocument(goCheck_1.notifyIfGeneratedFile, ctx, ctx.subscriptions);
}
function addOnChangeActiveTextEditorListeners(ctx) {
    vscode.window.onDidChangeActiveTextEditor(goStatus_1.showHideStatus, null, ctx.subscriptions);
    vscode.window.onDidChangeActiveTextEditor(goCover_1.applyCodeCoverage, null, ctx.subscriptions);
}
function sendTelemetryEventForConfig(goConfig) {
    /* __GDPR__
       "goConfig" : {
          "buildOnSave" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "buildFlags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "buildTags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "formatTool": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "formatFlags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "generateTestsFlags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "lintOnSave": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "lintFlags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "lintTool": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "vetOnSave": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "vetFlags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "testOnSave": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "testFlags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "coverOnSave": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "coverOnTestPackage": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "coverageDecorator": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "coverageOptions": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "gopath": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "goroot": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "inferGopath": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "toolsGopath": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "gocodeAutoBuild": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "gocodePackageLookupMode": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "useCodeSnippetsOnFunctionSuggest": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "useCodeSnippetsOnFunctionSuggestWithoutType": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "autocompleteUnimportedPackages": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "docsTool": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "useLanguageServer": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "includeImports": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "addTags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "removeTags": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
          "editorContextMenuCommands": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "liveErrors": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "codeLens": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
          "alternateTools": { "classification": "CustomerContent", "purpose": "FeatureInsight" }
       }
     */
    util_1.sendTelemetryEvent('goConfig', {
        buildOnSave: goConfig['buildOnSave'] + '',
        buildFlags: goConfig['buildFlags'],
        buildTags: goConfig['buildTags'],
        formatOnSave: goConfig['formatOnSave'] + '',
        formatTool: goConfig['formatTool'],
        formatFlags: goConfig['formatFlags'],
        lintOnSave: goConfig['lintOnSave'] + '',
        lintFlags: goConfig['lintFlags'],
        lintTool: goConfig['lintTool'],
        generateTestsFlags: goConfig['generateTestsFlags'],
        vetOnSave: goConfig['vetOnSave'] + '',
        vetFlags: goConfig['vetFlags'],
        testOnSave: goConfig['testOnSave'] + '',
        testFlags: goConfig['testFlags'],
        coverOnSave: goConfig['coverOnSave'] + '',
        coverOnTestPackage: goConfig['coverOnTestPackage'] + '',
        coverageDecorator: goConfig['coverageDecorator'],
        coverageOptions: goConfig['coverageOptions'],
        gopath: goConfig['gopath'] ? 'set' : '',
        goroot: goConfig['goroot'] ? 'set' : '',
        inferGopath: goConfig['inferGopath'] + '',
        toolsGopath: goConfig['toolsGopath'] ? 'set' : '',
        gocodeAutoBuild: goConfig['gocodeAutoBuild'] + '',
        gocodePackageLookupMode: goConfig['gocodePackageLookupMode'] + '',
        useCodeSnippetsOnFunctionSuggest: goConfig['useCodeSnippetsOnFunctionSuggest'] + '',
        useCodeSnippetsOnFunctionSuggestWithoutType: goConfig['useCodeSnippetsOnFunctionSuggestWithoutType'] + '',
        autocompleteUnimportedPackages: goConfig['autocompleteUnimportedPackages'] + '',
        docsTool: goConfig['docsTool'],
        useLanguageServer: goConfig['useLanguageServer'] + '',
        languageServerExperimentalFeatures: JSON.stringify(goConfig['languageServerExperimentalFeatures']),
        includeImports: goConfig['gotoSymbol'] && goConfig['gotoSymbol']['includeImports'] + '',
        addTags: JSON.stringify(goConfig['addTags']),
        removeTags: JSON.stringify(goConfig['removeTags']),
        editorContextMenuCommands: JSON.stringify(goConfig['editorContextMenuCommands']),
        liveErrors: JSON.stringify(goConfig['liveErrors']),
        codeLens: JSON.stringify(goConfig['enableCodeLens']),
        alternateTools: JSON.stringify(goConfig['alternateTools'])
    });
}
function checkToolExists(tool) {
    if (tool === util_1.getBinPath(tool)) {
        goInstallTools_1.promptForMissingTool(tool);
    }
}
function registerCompletionProvider(ctx) {
    const provider = new goSuggest_1.GoCompletionItemProvider(ctx.globalState);
    ctx.subscriptions.push(provider);
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(goMode_1.GO_MODE, provider, '.', '\"'));
}
//# sourceMappingURL=goMain.js.map