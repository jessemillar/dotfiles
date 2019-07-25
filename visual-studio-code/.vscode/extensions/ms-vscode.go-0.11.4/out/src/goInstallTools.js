/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const goStatus_1 = require("./goStatus");
const util_1 = require("./util");
const goLiveErrors_1 = require("./goLiveErrors");
const goPath_1 = require("./goPath");
const updatesDeclinedTools = [];
const installsDeclinedTools = [];
const allToolsWithImportPaths = {
    'gocode': 'github.com/mdempsky/gocode',
    'gocode-gomod': 'github.com/stamblerre/gocode',
    'gopkgs': 'github.com/uudashr/gopkgs/cmd/gopkgs',
    'go-outline': 'github.com/ramya-rao-a/go-outline',
    'go-symbols': 'github.com/acroca/go-symbols',
    'guru': 'golang.org/x/tools/cmd/guru',
    'gorename': 'golang.org/x/tools/cmd/gorename',
    'gomodifytags': 'github.com/fatih/gomodifytags',
    'goplay': 'github.com/haya14busa/goplay/cmd/goplay',
    'impl': 'github.com/josharian/impl',
    'gotype-live': 'github.com/tylerb/gotype-live',
    'godef': 'github.com/rogpeppe/godef',
    'gogetdoc': 'github.com/zmb3/gogetdoc',
    'goimports': 'golang.org/x/tools/cmd/goimports',
    'goreturns': 'github.com/sqs/goreturns',
    'goformat': 'winterdrache.de/goformat/goformat',
    'golint': 'golang.org/x/lint/golint',
    'gotests': 'github.com/cweill/gotests/...',
    'gometalinter': 'github.com/alecthomas/gometalinter',
    'staticcheck': 'honnef.co/go/tools/...',
    'golangci-lint': 'github.com/golangci/golangci-lint/cmd/golangci-lint',
    'revive': 'github.com/mgechev/revive',
    'go-langserver': 'github.com/sourcegraph/go-langserver',
    'gopls': 'golang.org/x/tools/cmd/gopls',
    'dlv': 'github.com/go-delve/delve/cmd/dlv',
    'fillstruct': 'github.com/davidrjenni/reftools/cmd/fillstruct',
    'godoctor': 'github.com/godoctor/godoctor',
};
function getToolImportPath(tool, goVersion) {
    if (tool === 'gocode' && goVersion && goVersion.major < 2 && goVersion.minor < 9) {
        return 'github.com/nsf/gocode';
    }
    return allToolsWithImportPaths[tool];
}
// Tools used explicitly by the basic features of the extension
const importantTools = [
    'gocode',
    'gocode-gomod',
    'gopkgs',
    'go-outline',
    'go-symbols',
    'guru',
    'gorename',
    'godef',
    'gogetdoc',
    'goreturns',
    'goimports',
    'golint',
    'gometalinter',
    'staticcheck',
    'golangci-lint',
    'revive',
    'dlv'
];
function getTools(goVersion) {
    const goConfig = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null);
    const tools = [
        'gocode',
        'gopkgs',
        'go-outline',
        'go-symbols',
        'guru',
        'gorename'
    ];
    // Check if the system supports dlv (e.g. is 64-bit)
    // There doesn't seem to be a good way to check if the mips and s390
    // families are 64-bit, so just try to install it and hope for the best
    if (process.arch.match(/^(arm64|mips|mipsel|ppc64|s390|s390x|x64)$/)) {
        tools.push('dlv');
    }
    // gocode-gomod needed in go 1.11 & higher
    if (!goVersion || (goVersion.major === 1 && goVersion.minor >= 11)) {
        tools.push('gocode-gomod');
    }
    // Install the doc/def tool that was chosen by the user
    if (goConfig['docsTool'] === 'godoc') {
        tools.push('godef');
    }
    else if (goConfig['docsTool'] === 'gogetdoc') {
        tools.push('gogetdoc');
    }
    // Install the formattool that was chosen by the user
    if (goConfig['formatTool'] === 'goimports') {
        tools.push('goimports');
    }
    else if (goConfig['formatTool'] === 'goformat') {
        tools.push('goformat');
    }
    else if (goConfig['formatTool'] === 'goreturns') {
        tools.push('goreturns');
    }
    // Install the linter that was chosen by the user
    if (goConfig['lintTool'] === 'golint'
        || goConfig['lintTool'] === 'gometalinter'
        || goConfig['lintTool'] === 'staticcheck'
        || goConfig['lintTool'] === 'golangci-lint'
        || goConfig['lintTool'] === 'revive') {
        tools.push(goConfig['lintTool']);
    }
    if (goConfig['useLanguageServer'] && (goVersion.major > 1 || (goVersion.major === 1 && goVersion.minor > 10))) {
        tools.push('gopls');
    }
    if (goLiveErrors_1.goLiveErrorsEnabled()) {
        tools.push('gotype-live');
    }
    tools.push('gotests', 'gomodifytags', 'impl', 'fillstruct', 'goplay', 'godoctor');
    return tools;
}
function installAllTools(updateExistingToolsOnly = false) {
    const allToolsDescription = {
        'gocode': '\t\t(Auto-completion)',
        'gocode-gomod': '(Autocompletion, works with Modules)',
        'gopkgs': '\t\t(Auto-completion of unimported packages & Add Import feature)',
        'go-outline': '\t(Go to symbol in file)',
        'go-symbols': '\t(Go to symbol in workspace)',
        'guru': '\t\t(Find all references and Go to implementation of symbols)',
        'gorename': '\t(Rename symbols)',
        'gomodifytags': '(Modify tags on structs)',
        'goplay': '\t\t(The Go playground)',
        'impl': '\t\t(Stubs for interfaces)',
        'gotype-live': '\t(Show errors as you type)',
        'godef': '\t\t(Go to definition)',
        'gogetdoc': '\t(Go to definition & text shown on hover)',
        'goimports': '\t(Formatter)',
        'goreturns': '\t(Formatter)',
        'goformat': '\t(Formatter)',
        'golint': '\t\t(Linter)',
        'gotests': '\t\t(Generate unit tests)',
        'gometalinter': '\t(Linter)',
        'golangci-lint': '\t(Linter)',
        'revive': '\t\t(Linter)',
        'staticcheck': '\t(Linter)',
        'go-langserver': '(Language Server from Sourcegraph)',
        'gopls': '\t\t(Language Server from Google)',
        'dlv': '\t\t\t(Debugging)',
        'fillstruct': '\t\t(Fill structs with defaults)',
        'godoctor': '\t\t(Extract to functions and variables)'
    };
    util_1.getGoVersion().then((goVersion) => {
        const allTools = getTools(goVersion);
        if (updateExistingToolsOnly) {
            installTools(allTools.filter(tool => {
                const toolPath = util_1.getBinPath(tool);
                return toolPath && path.isAbsolute(toolPath);
            }), goVersion);
            return;
        }
        vscode.window.showQuickPick(allTools.map(x => `${x} ${allToolsDescription[x]}`), {
            canPickMany: true,
            placeHolder: 'Select the tool to install/update.'
        }).then(selectedTools => {
            if (!selectedTools) {
                return;
            }
            installTools(selectedTools.map(x => x.substr(0, x.indexOf(' '))), goVersion);
        });
    });
}
exports.installAllTools = installAllTools;
function promptForMissingTool(tool) {
    // If user has declined to install, then don't prompt
    if (installsDeclinedTools.indexOf(tool) > -1) {
        return;
    }
    util_1.getGoVersion().then((goVersion) => {
        if (goVersion && goVersion.major === 1 && goVersion.minor < 9) {
            if (tool === 'golint') {
                vscode.window.showInformationMessage('golint no longer supports go1.8, update your settings to use gometalinter as go.lintTool and install gometalinter');
                return;
            }
            if (tool === 'gotests') {
                vscode.window.showInformationMessage('Generate unit tests feature is not supported as gotests tool needs go1.9 or higher.');
                return;
            }
        }
        const items = ['Install'];
        getMissingTools(goVersion).then(missing => {
            if (missing.indexOf(tool) === -1) {
                return;
            }
            missing = missing.filter(x => x === tool || importantTools.indexOf(x) > -1);
            if (missing.length > 1 && tool.indexOf('-gomod') === -1) {
                items.push('Install All');
            }
            let msg = `The "${tool}" command is not available.  Use "go get -v ${getToolImportPath(tool, goVersion)}" to install.`;
            if (tool === 'gocode-gomod') {
                msg = `To provide auto-completions when using Go modules, we are testing a fork(${getToolImportPath(tool, goVersion)}) of "gocode" and an updated version of "gopkgs". Please press the Install button to install them.`;
            }
            vscode.window.showInformationMessage(msg, ...items).then(selected => {
                if (selected === 'Install') {
                    if (tool === 'gocode-gomod') {
                        installTools(['gocode-gomod', 'gopkgs'], goVersion);
                    }
                    else {
                        installTools([tool], goVersion);
                    }
                }
                else if (selected === 'Install All') {
                    installTools(missing, goVersion);
                    goStatus_1.hideGoStatus();
                }
                else {
                    installsDeclinedTools.push(tool);
                }
            });
        });
    });
}
exports.promptForMissingTool = promptForMissingTool;
function promptForUpdatingTool(tool) {
    // If user has declined to update, then don't prompt
    if (updatesDeclinedTools.indexOf(tool) > -1) {
        return;
    }
    util_1.getGoVersion().then((goVersion) => {
        vscode.window.showInformationMessage(`The Go extension is better with the latest version of "${tool}". Use "go get -u -v ${getToolImportPath(tool, goVersion)}" to update`, 'Update').then(selected => {
            if (selected === 'Update') {
                installTools([tool], goVersion);
            }
            else {
                updatesDeclinedTools.push(tool);
            }
        });
    });
}
exports.promptForUpdatingTool = promptForUpdatingTool;
/**
 * Installs given array of missing tools. If no input is given, the all tools are installed
 *
 * @param string[] array of tool names to be installed
 */
function installTools(missing, goVersion) {
    const goRuntimePath = util_1.getBinPath('go');
    if (!goRuntimePath) {
        vscode.window.showErrorMessage(`Failed to run "go get" to install the packages as the "go" binary cannot be found in either GOROOT(${process.env['GOROOT']}) or PATH(${goPath_1.envPath})`);
        return;
    }
    if (!missing) {
        return;
    }
    // http.proxy setting takes precedence over environment variables
    const httpProxy = vscode.workspace.getConfiguration('http').get('proxy');
    let envForTools = Object.assign({}, process.env);
    if (httpProxy) {
        envForTools = Object.assign({}, process.env, {
            http_proxy: httpProxy,
            HTTP_PROXY: httpProxy,
            https_proxy: httpProxy,
            HTTPS_PROXY: httpProxy,
        });
    }
    // If the go.toolsGopath is set, use its value as the GOPATH for the "go get" child process.
    // Else use the Current Gopath
    let toolsGopath = util_1.getToolsGopath();
    if (toolsGopath) {
        // User has explicitly chosen to use toolsGopath, so ignore GOBIN
        envForTools['GOBIN'] = '';
    }
    else {
        toolsGopath = util_1.getCurrentGoPath();
    }
    if (toolsGopath) {
        const paths = toolsGopath.split(path.delimiter);
        toolsGopath = paths[0];
        envForTools['GOPATH'] = toolsGopath;
    }
    else {
        vscode.window.showInformationMessage('Cannot install Go tools. Set either go.gopath or go.toolsGopath in settings.', 'Open User Settings', 'Open Workspace Settings').then(selected => {
            if (selected === 'Open User Settings') {
                vscode.commands.executeCommand('workbench.action.openGlobalSettings');
            }
            else if (selected === 'Open Workspace Settings') {
                vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
            }
        });
        return;
    }
    envForTools['GO111MODULE'] = 'off';
    goStatus_1.outputChannel.show();
    goStatus_1.outputChannel.clear();
    goStatus_1.outputChannel.appendLine(`Installing ${missing.length} ${missing.length > 1 ? 'tools' : 'tool'} at ${toolsGopath}${path.sep}bin`);
    missing.forEach((missingTool, index, missing) => {
        goStatus_1.outputChannel.appendLine('  ' + missingTool);
    });
    goStatus_1.outputChannel.appendLine(''); // Blank line for spacing.
    return missing.reduce((res, tool) => {
        return res.then(sofar => new Promise((resolve, reject) => {
            const callback = (err, stdout, stderr) => {
                if (err) {
                    goStatus_1.outputChannel.appendLine('Installing ' + getToolImportPath(tool, goVersion) + ' FAILED');
                    const failureReason = tool + ';;' + err + stdout.toString() + stderr.toString();
                    resolve([...sofar, failureReason]);
                }
                else {
                    goStatus_1.outputChannel.appendLine('Installing ' + getToolImportPath(tool, goVersion) + ' SUCCEEDED');
                    if (tool === 'gometalinter') {
                        // Gometalinter needs to install all the linters it uses.
                        goStatus_1.outputChannel.appendLine('Installing all linters used by gometalinter....');
                        const gometalinterBinPath = util_1.getBinPath('gometalinter');
                        cp.execFile(gometalinterBinPath, ['--install'], { env: envForTools }, (err, stdout, stderr) => {
                            if (!err) {
                                goStatus_1.outputChannel.appendLine('Installing all linters used by gometalinter SUCCEEDED.');
                                resolve([...sofar, null]);
                            }
                            else {
                                const failureReason = `Error while running gometalinter --install;; ${stderr}`;
                                resolve([...sofar, failureReason]);
                            }
                        });
                    }
                    else {
                        resolve([...sofar, null]);
                    }
                }
            };
            let closeToolPromise = Promise.resolve(true);
            const toolBinPath = util_1.getBinPath(tool);
            if (path.isAbsolute(toolBinPath) && (tool === 'gocode' || tool === 'gocode-gomod')) {
                closeToolPromise = new Promise((innerResolve) => {
                    cp.execFile(toolBinPath, ['close'], {}, (err, stdout, stderr) => {
                        if (stderr && stderr.indexOf('rpc: can\'t find service Server.') > -1) {
                            goStatus_1.outputChannel.appendLine('Installing gocode aborted as existing process cannot be closed. Please kill the running process for gocode and try again.');
                            return innerResolve(false);
                        }
                        innerResolve(true);
                    });
                });
            }
            closeToolPromise.then((success) => {
                if (!success) {
                    resolve([...sofar, null]);
                    return;
                }
                const args = ['get', '-u', '-v'];
                if (tool.endsWith('-gomod')) {
                    args.push('-d');
                }
                args.push(getToolImportPath(tool, goVersion));
                cp.execFile(goRuntimePath, args, { env: envForTools }, (err, stdout, stderr) => {
                    if (stderr.indexOf('unexpected directory layout:') > -1) {
                        goStatus_1.outputChannel.appendLine(`Installing ${tool} failed with error "unexpected directory layout". Retrying...`);
                        cp.execFile(goRuntimePath, args, { env: envForTools }, callback);
                    }
                    else if (!err && tool.endsWith('-gomod')) {
                        const outputFile = path.join(toolsGopath, 'bin', process.platform === 'win32' ? `${tool}.exe` : tool);
                        cp.execFile(goRuntimePath, ['build', '-o', outputFile, getToolImportPath(tool, goVersion)], { env: envForTools }, callback);
                    }
                    else {
                        callback(err, stdout, stderr);
                    }
                });
            });
        }));
    }, Promise.resolve([])).then(res => {
        goStatus_1.outputChannel.appendLine(''); // Blank line for spacing
        const failures = res.filter(x => x != null);
        if (failures.length === 0) {
            if (missing.indexOf('go-langserver') > -1 || missing.indexOf('gopls') > -1) {
                goStatus_1.outputChannel.appendLine('Reload VS Code window to use the Go language server');
            }
            goStatus_1.outputChannel.appendLine('All tools successfully installed. You\'re ready to Go :).');
            return;
        }
        goStatus_1.outputChannel.appendLine(failures.length + ' tools failed to install.\n');
        failures.forEach((failure, index, failures) => {
            const reason = failure.split(';;');
            goStatus_1.outputChannel.appendLine(reason[0] + ':');
            goStatus_1.outputChannel.appendLine(reason[1]);
        });
    });
}
exports.installTools = installTools;
function updateGoPathGoRootFromConfig() {
    const goroot = vscode.workspace.getConfiguration('go', vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : null)['goroot'];
    if (goroot) {
        process.env['GOROOT'] = util_1.resolvePath(goroot);
    }
    if (process.env['GOPATH'] && process.env['GOROOT']) {
        return Promise.resolve();
    }
    // If GOPATH is still not set, then use the one from `go env`
    const goRuntimePath = util_1.getBinPath('go');
    if (!goRuntimePath) {
        vscode.window.showErrorMessage(`Failed to run "go env" to find GOPATH as the "go" binary cannot be found in either GOROOT(${process.env['GOROOT']}) or PATH(${goPath_1.envPath})`);
        return;
    }
    const goRuntimeBasePath = path.dirname(goRuntimePath);
    // cgo and a few other Go tools expect Go binary to be in the path
    let pathEnvVar;
    if (process.env.hasOwnProperty('PATH')) {
        pathEnvVar = 'PATH';
    }
    else if (process.platform === 'win32' && process.env.hasOwnProperty('Path')) {
        pathEnvVar = 'Path';
    }
    if (goRuntimeBasePath
        && pathEnvVar
        && process.env[pathEnvVar]
        && process.env[pathEnvVar].split(path.delimiter).indexOf(goRuntimeBasePath) === -1) {
        process.env[pathEnvVar] += path.delimiter + goRuntimeBasePath;
    }
    return new Promise((resolve, reject) => {
        cp.execFile(goRuntimePath, ['env', 'GOPATH', 'GOROOT'], (err, stdout, stderr) => {
            if (err) {
                return reject();
            }
            const envOutput = stdout.split('\n');
            if (!process.env['GOPATH'] && envOutput[0].trim()) {
                process.env['GOPATH'] = envOutput[0].trim();
            }
            if (!process.env['GOROOT'] && envOutput[1] && envOutput[1].trim()) {
                process.env['GOROOT'] = envOutput[1].trim();
            }
            return resolve();
        });
    });
}
exports.updateGoPathGoRootFromConfig = updateGoPathGoRootFromConfig;
let alreadyOfferedToInstallTools = false;
function offerToInstallTools() {
    if (alreadyOfferedToInstallTools) {
        return;
    }
    alreadyOfferedToInstallTools = true;
    util_1.isVendorSupported();
    util_1.getGoVersion().then(goVersion => {
        getMissingTools(goVersion).then(missing => {
            missing = missing.filter(x => importantTools.indexOf(x) > -1);
            if (missing.length > 0) {
                goStatus_1.showGoStatus('Analysis Tools Missing', 'go.promptforinstall', 'Not all Go tools are available on the GOPATH');
                vscode.commands.registerCommand('go.promptforinstall', () => {
                    promptForInstall(missing, goVersion);
                });
            }
        });
        const usingSourceGraph = goPath_1.getToolFromToolPath(getLanguageServerToolPath()) === 'go-langserver';
        if (usingSourceGraph && (goVersion.major > 1 || (goVersion.major === 1 && goVersion.minor > 10))) {
            const promptMsg = 'The language server from Sourcegraph is no longer under active development and it does not support Go modules as well. Please install and use the language server from Google or disable the use of language servers altogether.';
            const disableLabel = 'Disable language server';
            const installLabel = 'Install';
            vscode.window.showInformationMessage(promptMsg, installLabel, disableLabel)
                .then(selected => {
                if (selected === installLabel) {
                    installTools(['gopls'], goVersion)
                        .then(() => {
                        vscode.window.showInformationMessage('Reload VS Code window to enable the use of Go language server');
                    });
                }
                else if (selected === disableLabel) {
                    const goConfig = vscode.workspace.getConfiguration('go');
                    const inspectLanguageServerSetting = goConfig.inspect('useLanguageServer');
                    if (inspectLanguageServerSetting.globalValue === true) {
                        goConfig.update('useLanguageServer', false, vscode.ConfigurationTarget.Global);
                    }
                    else if (inspectLanguageServerSetting.workspaceFolderValue === true) {
                        goConfig.update('useLanguageServer', false, vscode.ConfigurationTarget.WorkspaceFolder);
                    }
                }
            });
        }
    });
    function promptForInstall(missing, goVersion) {
        const installItem = {
            title: 'Install',
            command() {
                goStatus_1.hideGoStatus();
                installTools(missing, goVersion);
            }
        };
        const showItem = {
            title: 'Show',
            command() {
                goStatus_1.outputChannel.clear();
                goStatus_1.outputChannel.appendLine('Below tools are needed for the basic features of the Go extension.');
                missing.forEach(x => goStatus_1.outputChannel.appendLine(x));
            }
        };
        vscode.window.showInformationMessage('Failed to find some of the Go analysis tools. Would you like to install them?', installItem, showItem).then(selection => {
            if (selection) {
                selection.command();
            }
            else {
                goStatus_1.hideGoStatus();
            }
        });
    }
}
exports.offerToInstallTools = offerToInstallTools;
function getMissingTools(goVersion) {
    const keys = getTools(goVersion);
    return Promise.all(keys.map(tool => new Promise((resolve, reject) => {
        const toolPath = util_1.getBinPath(tool);
        fs.exists(toolPath, exists => {
            resolve(exists ? null : tool);
        });
    }))).then(res => {
        return res.filter(x => x != null);
    });
}
/**
 * Gets the absolute path to the language server to be used.
 * If the required tool is not available, then user is prompted to install it.
 * This supports the language servers from both Google and Sourcegraph with the
 * former getting a precedence over the latter
 */
function getLanguageServerToolPath() {
    const latestGoConfig = vscode.workspace.getConfiguration('go');
    if (!latestGoConfig['useLanguageServer'])
        return;
    if (!allFoldersHaveSameGopath()) {
        vscode.window.showInformationMessage('The Go language server is not supported in a multi root set up with different GOPATHs.');
        return;
    }
    // Get the path to gopls or any alternative that the user might have set for gopls
    const goplsBinaryPath = util_1.getBinPath('gopls');
    if (path.isAbsolute(goplsBinaryPath)) {
        return goplsBinaryPath;
    }
    // Get the path to go-langserver or any alternative that the user might have set for go-langserver
    const golangserverBinaryPath = util_1.getBinPath('go-langserver');
    if (path.isAbsolute(golangserverBinaryPath)) {
        return golangserverBinaryPath;
    }
    // Notify the user about the unavailability of the language server
    let languageServerOfChoice = 'gopls';
    if (latestGoConfig['alternateTools']) {
        const goplsAlternate = latestGoConfig['alternateTools']['gopls'];
        const golangserverAlternate = latestGoConfig['alternateTools']['go-langserver'];
        if (typeof goplsAlternate === 'string') {
            languageServerOfChoice = goPath_1.getToolFromToolPath(goplsAlternate);
        }
        else if (typeof golangserverAlternate === 'string') {
            languageServerOfChoice = goPath_1.getToolFromToolPath(golangserverAlternate);
        }
        if (languageServerOfChoice !== 'gopls' && languageServerOfChoice !== 'go-langserver') {
            vscode.window.showErrorMessage(`Cannot find the language server ${languageServerOfChoice}. Please install it and reload this VS Code window`);
            return;
        }
    }
    promptForMissingTool(languageServerOfChoice);
    vscode.window.showInformationMessage('Reload VS Code window after installing the Go language server');
}
exports.getLanguageServerToolPath = getLanguageServerToolPath;
function allFoldersHaveSameGopath() {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length <= 1) {
        return true;
    }
    const tempGopath = util_1.getCurrentGoPath(vscode.workspace.workspaceFolders[0].uri);
    return vscode.workspace.workspaceFolders.find(x => tempGopath !== util_1.getCurrentGoPath(x.uri)) ? false : true;
}
//# sourceMappingURL=goInstallTools.js.map