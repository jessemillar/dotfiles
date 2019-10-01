/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const goGenerateTests = require("./goGenerateTests");
const stateUtils_1 = require("./stateUtils");
const goInstallTools_1 = require("./goInstallTools");
const util_1 = require("./util");
const goLanguageServer_1 = require("./goLanguageServer");
const goCover_1 = require("./goCover");
const goStatus_1 = require("./goStatus");
const goRunTestCodelens_1 = require("./goRunTestCodelens");
const goReferencesCodelens_1 = require("./goReferencesCodelens");
const goMode_1 = require("./goMode");
const goCodeAction_1 = require("./goCodeAction");
const goDebugConfiguration_1 = require("./goDebugConfiguration");
const goPath_1 = require("./goPath");
const goModifytags_1 = require("./goModifytags");
const goFillStruct_1 = require("./goFillStruct");
const goImpl_1 = require("./goImpl");
const goDoctor_1 = require("./goDoctor");
const goTest_1 = require("./goTest");
const testUtils_1 = require("./testUtils");
const goImport_1 = require("./goImport");
const goBrowsePackage_1 = require("./goBrowsePackage");
const goGetPackage_1 = require("./goGetPackage");
const goPlayground_1 = require("./goPlayground");
const goLint_1 = require("./goLint");
const goVet_1 = require("./goVet");
const goBuild_1 = require("./goBuild");
const goInstall_1 = require("./goInstall");
const goCheck_1 = require("./goCheck");
const goModules_1 = require("./goModules");
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
                    goInstallTools_1.installAllTools(true);
                }
            });
        }
        else {
            const currentVersion = yield util_1.getGoVersion();
            if (currentVersion) {
                const prevVersion = toolsGoInfo[toolsGopath].version;
                const currVersionString = currentVersion.format();
                if (prevVersion !== currVersionString) {
                    if (prevVersion) {
                        vscode.window.showInformationMessage('Your Go version is different than before, few Go tools may need re-compiling', updateToolsCmdText).then(selected => {
                            if (selected === updateToolsCmdText) {
                                goInstallTools_1.installAllTools(true);
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
        // This handles all of the configurations and registrations for the language server.
        // It also registers the necessary language feature providers that the language server may not support.
        yield goLanguageServer_1.registerLanguageFeatures(ctx);
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'go' && util_1.isGoPathSet()) {
            runBuilds(vscode.window.activeTextEditor.document, vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor.document.uri));
        }
    }));
    goCover_1.initCoverageDecorators(ctx);
    ctx.subscriptions.push(vscode.commands.registerCommand('go.open.modulewiki', () => __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/microsoft/vscode-go/wiki/Go-modules-support-in-Visual-Studio-Code'));
    })));
    goStatus_1.showHideStatus(vscode.window.activeTextEditor);
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
        const root = util_1.getWorkspaceFolderPath(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri);
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
    ctx.subscriptions.push(vscode.commands.registerCommand('go.tools.install', (args) => __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(args) && args.length) {
            const goVersion = yield util_1.getGoVersion();
            goInstallTools_1.installTools(args, goVersion);
            return;
        }
        goInstallTools_1.installAllTools();
    })));
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
        if (updatedGoConfig['enableCodeLens']) {
            testCodeLensProvider.setEnabled(updatedGoConfig['enableCodeLens']['runtest']);
            referencesCodeLensProvider.setEnabled(updatedGoConfig['enableCodeLens']['references']);
        }
        if (e.affectsConfiguration('go.formatTool')) {
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
        if (e.affectsConfiguration('go.toolsEnvVars')) {
            const env = util_1.getToolsEnvVars();
            if (goModules_1.GO111MODULE !== env['GO111MODULE']) {
                const reloadMsg = 'Reload VS Code window so that the Go tools can respect the change to GO111MODULE';
                vscode.window.showInformationMessage(reloadMsg, 'Reload').then((selected) => {
                    if (selected === 'Reload') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            }
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
        if (vscode.debug.activeDebugSession) {
            vscode.window.showWarningMessage('A debug session is currently active. Changes to your Go files may result in unexpected behaviour.');
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
//# sourceMappingURL=goMain.js.map