"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const path = require("path");
const cp = require("child_process");
const vscode = require("vscode");
const stateUtils_1 = require("./stateUtils");
const goInstallTools_1 = require("./goInstallTools");
const goPath_1 = require("./goPath");
function runGoModEnv(folderPath) {
    const goExecutable = util_1.getBinPath('go');
    if (!goExecutable) {
        return Promise.reject(new Error('Cannot find "go" binary. Update PATH or GOROOT appropriately.'));
    }
    return new Promise(resolve => {
        cp.execFile(goExecutable, ['env', 'GOMOD'], { cwd: folderPath, env: util_1.getToolsEnvVars() }, (err, stdout) => {
            if (err) {
                console.warn(`Error when running go env GOMOD: ${err}`);
                return resolve();
            }
            const [goMod] = stdout.split('\n');
            resolve(goMod);
        });
    });
}
function isModSupported(fileuri) {
    return getModFolderPath(fileuri).then(modPath => !!modPath);
}
exports.isModSupported = isModSupported;
const packageModCache = new Map();
function getModFolderPath(fileuri) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgPath = path.dirname(fileuri.fsPath);
        if (packageModCache.has(pkgPath)) {
            return packageModCache.get(pkgPath);
        }
        // We never would be using the path under module cache for anything
        // So, dont bother finding where exactly is the go.mod file
        const moduleCache = util_1.getModuleCache();
        if (goPath_1.fixDriveCasingInWindows(fileuri.fsPath).startsWith(moduleCache)) {
            return moduleCache;
        }
        const goVersion = yield util_1.getGoVersion();
        if (goVersion && (goVersion.major !== 1 || goVersion.minor < 11)) {
            return;
        }
        let goModEnvResult = yield runGoModEnv(pkgPath);
        if (goModEnvResult) {
            logModuleUsage();
            goModEnvResult = path.dirname(goModEnvResult);
            const goConfig = vscode.workspace.getConfiguration('go', fileuri);
            let promptFormatTool = goConfig['formatTool'] === 'goreturns';
            if (goConfig['inferGopath'] === true) {
                goConfig.update('inferGopath', false, vscode.ConfigurationTarget.WorkspaceFolder);
                vscode.window.showInformationMessage('The "inferGopath" setting is disabled for this workspace because Go modules are being used.');
            }
            if (goConfig['useLanguageServer'] === false) {
                const promptMsg = 'To get better performance during code completion, please update to use the language server from Google';
                const choseToUpdateLS = yield promptToUpdateToolForModules('gopls', promptMsg);
                promptFormatTool = promptFormatTool && !choseToUpdateLS;
            }
            else if (promptFormatTool) {
                const languageServerExperimentalFeatures = goConfig.get('languageServerExperimentalFeatures');
                promptFormatTool = languageServerExperimentalFeatures['format'] === false;
            }
            if (promptFormatTool) {
                goConfig.update('formatTool', 'goimports', vscode.ConfigurationTarget.WorkspaceFolder);
                vscode.window.showInformationMessage('`goreturns` doesnt support auto-importing missing imports when using Go modules yet. So updating the "formatTool" setting to `goimports` for this workspace.');
            }
        }
        packageModCache.set(pkgPath, goModEnvResult);
        return goModEnvResult;
    });
}
exports.getModFolderPath = getModFolderPath;
let moduleUsageLogged = false;
function logModuleUsage() {
    if (moduleUsageLogged) {
        return;
    }
    moduleUsageLogged = true;
    /* __GDPR__
        "modules" : {}
    */
    util_1.sendTelemetryEvent('modules');
}
const promptedToolsForCurrentSession = new Set();
function promptToUpdateToolForModules(tool, promptMsg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (promptedToolsForCurrentSession.has(tool)) {
            return false;
        }
        const promptedToolsForModules = stateUtils_1.getFromGlobalState('promptedToolsForModules', {});
        if (promptedToolsForModules[tool]) {
            return false;
        }
        const goVersion = yield util_1.getGoVersion();
        const selected = yield vscode.window.showInformationMessage(promptMsg, 'Update', 'Later', `Don't show again`);
        let choseToUpdate = false;
        switch (selected) {
            case 'Update':
                choseToUpdate = true;
                goInstallTools_1.installTools([tool], goVersion)
                    .then(() => {
                    if (tool === 'gopls') {
                        const goConfig = vscode.workspace.getConfiguration('go');
                        if (goConfig.get('useLanguageServer') === false) {
                            goConfig.update('useLanguageServer', true, vscode.ConfigurationTarget.Global);
                        }
                        if (goConfig.inspect('useLanguageServer').workspaceFolderValue === false) {
                            goConfig.update('useLanguageServer', true, vscode.ConfigurationTarget.WorkspaceFolder);
                        }
                        vscode.window.showInformationMessage('Reload VS Code window to enable the use of Go language server');
                    }
                });
                promptedToolsForModules[tool] = true;
                stateUtils_1.updateGlobalState('promptedToolsForModules', promptedToolsForModules);
                break;
            case `Don't show again`:
                promptedToolsForModules[tool] = true;
                stateUtils_1.updateGlobalState('promptedToolsForModules', promptedToolsForModules);
                break;
            case 'Later':
            default:
                promptedToolsForCurrentSession.add(tool);
                break;
        }
        return choseToUpdate;
    });
}
exports.promptToUpdateToolForModules = promptToUpdateToolForModules;
const folderToPackageMapping = {};
function getCurrentPackage(cwd) {
    if (folderToPackageMapping[cwd]) {
        return Promise.resolve(folderToPackageMapping[cwd]);
    }
    const moduleCache = util_1.getModuleCache();
    if (cwd.startsWith(moduleCache)) {
        let importPath = cwd.substr(moduleCache.length + 1);
        const matches = /@v\d+(\.\d+)?(\.\d+)?/.exec(importPath);
        if (matches) {
            importPath = importPath.substr(0, matches.index);
        }
        folderToPackageMapping[cwd] = importPath;
        return Promise.resolve(importPath);
    }
    const goRuntimePath = util_1.getBinPath('go');
    if (!goRuntimePath) {
        vscode.window.showInformationMessage('Cannot find "go" binary. Update PATH or GOROOT appropriately');
        return Promise.resolve(null);
    }
    return new Promise(resolve => {
        const childProcess = cp.spawn(goRuntimePath, ['list'], { cwd, env: util_1.getToolsEnvVars() });
        const chunks = [];
        childProcess.stdout.on('data', (stdout) => {
            chunks.push(stdout);
        });
        childProcess.on('close', () => {
            // Ignore lines that are empty or those that have logs about updating the module cache
            const pkgs = chunks.join('').toString().split('\n').filter(line => line && line.indexOf(' ') === -1);
            if (pkgs.length !== 1) {
                resolve();
                return;
            }
            folderToPackageMapping[cwd] = pkgs[0];
            resolve(pkgs[0]);
        });
    });
}
exports.getCurrentPackage = getCurrentPackage;
//# sourceMappingURL=goModules.js.map