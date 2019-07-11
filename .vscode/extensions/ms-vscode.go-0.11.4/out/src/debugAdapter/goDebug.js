"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const os = require("os");
const fs = require("fs");
const util = require("util");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
const json_rpc2_1 = require("json-rpc2");
const goPath_1 = require("../goPath");
const fsAccess = util.promisify(fs.access);
const fsUnlink = util.promisify(fs.unlink);
// This enum should stay in sync with https://golang.org/pkg/reflect/#Kind
var GoReflectKind;
(function (GoReflectKind) {
    GoReflectKind[GoReflectKind["Invalid"] = 0] = "Invalid";
    GoReflectKind[GoReflectKind["Bool"] = 1] = "Bool";
    GoReflectKind[GoReflectKind["Int"] = 2] = "Int";
    GoReflectKind[GoReflectKind["Int8"] = 3] = "Int8";
    GoReflectKind[GoReflectKind["Int16"] = 4] = "Int16";
    GoReflectKind[GoReflectKind["Int32"] = 5] = "Int32";
    GoReflectKind[GoReflectKind["Int64"] = 6] = "Int64";
    GoReflectKind[GoReflectKind["Uint"] = 7] = "Uint";
    GoReflectKind[GoReflectKind["Uint8"] = 8] = "Uint8";
    GoReflectKind[GoReflectKind["Uint16"] = 9] = "Uint16";
    GoReflectKind[GoReflectKind["Uint32"] = 10] = "Uint32";
    GoReflectKind[GoReflectKind["Uint64"] = 11] = "Uint64";
    GoReflectKind[GoReflectKind["Uintptr"] = 12] = "Uintptr";
    GoReflectKind[GoReflectKind["Float32"] = 13] = "Float32";
    GoReflectKind[GoReflectKind["Float64"] = 14] = "Float64";
    GoReflectKind[GoReflectKind["Complex64"] = 15] = "Complex64";
    GoReflectKind[GoReflectKind["Complex128"] = 16] = "Complex128";
    GoReflectKind[GoReflectKind["Array"] = 17] = "Array";
    GoReflectKind[GoReflectKind["Chan"] = 18] = "Chan";
    GoReflectKind[GoReflectKind["Func"] = 19] = "Func";
    GoReflectKind[GoReflectKind["Interface"] = 20] = "Interface";
    GoReflectKind[GoReflectKind["Map"] = 21] = "Map";
    GoReflectKind[GoReflectKind["Ptr"] = 22] = "Ptr";
    GoReflectKind[GoReflectKind["Slice"] = 23] = "Slice";
    GoReflectKind[GoReflectKind["String"] = 24] = "String";
    GoReflectKind[GoReflectKind["Struct"] = 25] = "Struct";
    GoReflectKind[GoReflectKind["UnsafePointer"] = 26] = "UnsafePointer";
})(GoReflectKind || (GoReflectKind = {}));
var GoVariableFlags;
(function (GoVariableFlags) {
    GoVariableFlags[GoVariableFlags["VariableEscaped"] = 1] = "VariableEscaped";
    GoVariableFlags[GoVariableFlags["VariableShadowed"] = 2] = "VariableShadowed";
    GoVariableFlags[GoVariableFlags["VariableConstant"] = 4] = "VariableConstant";
    GoVariableFlags[GoVariableFlags["VariableArgument"] = 8] = "VariableArgument";
    GoVariableFlags[GoVariableFlags["VariableReturnArgument"] = 16] = "VariableReturnArgument";
})(GoVariableFlags || (GoVariableFlags = {}));
process.on('uncaughtException', (err) => {
    const errMessage = err && (err.stack || err.message);
    vscode_debugadapter_1.logger.error(`Unhandled error in debug adapter: ${errMessage}`);
    throw err;
});
function logArgsToString(args) {
    return args.map(arg => {
        return typeof arg === 'string' ?
            arg :
            JSON.stringify(arg);
    }).join(' ');
}
function log(...args) {
    vscode_debugadapter_1.logger.warn(logArgsToString(args));
}
function logError(...args) {
    vscode_debugadapter_1.logger.error(logArgsToString(args));
}
function normalizePath(filePath) {
    if (process.platform === 'win32') {
        filePath = path.normalize(filePath);
        return goPath_1.fixDriveCasingInWindows(filePath);
    }
    return filePath;
}
class Delve {
    constructor(launchArgs, program) {
        this.request = launchArgs.request;
        this.program = normalizePath(program);
        this.remotePath = launchArgs.remotePath;
        this.isApiV1 = false;
        if (typeof launchArgs.apiVersion === 'number') {
            this.isApiV1 = launchArgs.apiVersion === 1;
        }
        this.stackTraceDepth = typeof launchArgs.stackTraceDepth === 'number' ? launchArgs.stackTraceDepth : 50;
        this.connection = new Promise((resolve, reject) => {
            const mode = launchArgs.mode;
            let dlvCwd = path_1.dirname(program);
            let serverRunning = false;
            const dlvArgs = new Array();
            // Get default LoadConfig values according to delve API:
            // https://github.com/go-delve/delve/blob/c5c41f635244a22d93771def1c31cf1e0e9a2e63/service/rpc1/server.go#L13
            // https://github.com/go-delve/delve/blob/c5c41f635244a22d93771def1c31cf1e0e9a2e63/service/rpc2/server.go#L423
            this.loadConfig = launchArgs.dlvLoadConfig || {
                followPointers: true,
                maxVariableRecurse: 1,
                maxStringLen: 64,
                maxArrayValues: 64,
                maxStructFields: -1
            };
            if (mode === 'remote') {
                this.debugProcess = null;
                serverRunning = true; // assume server is running when in remote mode
                connectClient(launchArgs.port, launchArgs.host);
                return;
            }
            let env;
            if (launchArgs.request === 'launch') {
                let isProgramDirectory = false;
                // Validations on the program
                if (!program) {
                    return reject('The program attribute is missing in the debug configuration in launch.json');
                }
                try {
                    const pstats = fs_1.lstatSync(program);
                    if (pstats.isDirectory()) {
                        if (mode === 'exec') {
                            logError(`The program "${program}" must not be a directory in exec mode`);
                            return reject('The program attribute must be an executable in exec mode');
                        }
                        dlvCwd = program;
                        isProgramDirectory = true;
                    }
                    else if (mode !== 'exec' && path_1.extname(program) !== '.go') {
                        logError(`The program "${program}" must be a valid go file in debug mode`);
                        return reject('The program attribute must be a directory or .go file in debug mode');
                    }
                }
                catch (e) {
                    logError(`The program "${program}" does not exist: ${e}`);
                    return reject('The program attribute must point to valid directory, .go file or executable.');
                }
                // read env from disk and merge into env variables
                let fileEnv = {};
                try {
                    fileEnv = goPath_1.parseEnvFile(launchArgs.envFile);
                }
                catch (e) {
                    return reject(e);
                }
                const launchArgsEnv = launchArgs.env || {};
                env = Object.assign({}, process.env, fileEnv, launchArgsEnv);
                const dirname = isProgramDirectory ? program : path.dirname(program);
                if (!env['GOPATH'] && (mode === 'debug' || mode === 'test')) {
                    // If no GOPATH is set, then infer it from the file/package path
                    // Not applicable to exec mode in which case `program` need not point to source code under GOPATH
                    env['GOPATH'] = goPath_1.getInferredGopath(dirname) || env['GOPATH'];
                }
                this.dlvEnv = env;
                log(`Using GOPATH: ${env['GOPATH']}`);
                if (!!launchArgs.noDebug) {
                    if (mode === 'debug') {
                        if (isProgramDirectory && launchArgs.currentFile) {
                            program = launchArgs.currentFile;
                            isProgramDirectory = false;
                        }
                        if (!isProgramDirectory) {
                            this.noDebug = true;
                            const runArgs = ['run'];
                            if (launchArgs.buildFlags) {
                                runArgs.push(launchArgs.buildFlags);
                            }
                            runArgs.push(program);
                            if (launchArgs.args) {
                                runArgs.push(...launchArgs.args);
                            }
                            this.debugProcess = child_process_1.spawn(goPath_1.getBinPathWithPreferredGopath('go', []), runArgs, { env });
                            this.debugProcess.stderr.on('data', chunk => {
                                const str = chunk.toString();
                                if (this.onstderr) {
                                    this.onstderr(str);
                                }
                            });
                            this.debugProcess.stdout.on('data', chunk => {
                                const str = chunk.toString();
                                if (this.onstdout) {
                                    this.onstdout(str);
                                }
                            });
                            this.debugProcess.on('close', (code) => {
                                logError('Process exiting with code: ' + code);
                                if (this.onclose) {
                                    this.onclose(code);
                                }
                            });
                            this.debugProcess.on('error', (err) => {
                                reject(err);
                            });
                            resolve();
                            return;
                        }
                    }
                }
                this.noDebug = false;
                if (!fs_1.existsSync(launchArgs.dlvToolPath)) {
                    log(`Couldn't find dlv at the Go tools path, ${process.env['GOPATH']}${env['GOPATH'] ? ', ' + env['GOPATH'] : ''} or ${goPath_1.envPath}`);
                    return reject(`Cannot find Delve debugger. Install from https://github.com/derekparker/delve & ensure it is in your Go tools path, "GOPATH/bin" or "PATH".`);
                }
                const currentGOWorkspace = goPath_1.getCurrentGoWorkspaceFromGOPATH(env['GOPATH'], dirname);
                dlvArgs.push(mode || 'debug');
                if (mode === 'exec') {
                    dlvArgs.push(program);
                }
                else if (currentGOWorkspace && env['GO111MODULE'] !== 'on') {
                    dlvArgs.push(dirname.substr(currentGOWorkspace.length + 1));
                }
                dlvArgs.push('--headless=true', `--listen=${launchArgs.host}:${launchArgs.port}`);
                if (!this.isApiV1) {
                    dlvArgs.push('--api-version=2');
                }
                if (launchArgs.showLog) {
                    dlvArgs.push('--log=' + launchArgs.showLog.toString());
                }
                if (launchArgs.logOutput) {
                    dlvArgs.push('--log-output=' + launchArgs.logOutput);
                }
                if (launchArgs.cwd) {
                    dlvArgs.push('--wd=' + launchArgs.cwd);
                }
                if (launchArgs.buildFlags) {
                    dlvArgs.push('--build-flags=' + launchArgs.buildFlags);
                }
                if (launchArgs.init) {
                    dlvArgs.push('--init=' + launchArgs.init);
                }
                if (launchArgs.backend) {
                    dlvArgs.push('--backend=' + launchArgs.backend);
                }
                if (launchArgs.output && (mode === 'debug' || mode === 'test')) {
                    dlvArgs.push('--output=' + launchArgs.output);
                }
                if (launchArgs.args && launchArgs.args.length > 0) {
                    dlvArgs.push('--', ...launchArgs.args);
                }
                this.localDebugeePath = this.getLocalDebugeePath(launchArgs.output);
            }
            else if (launchArgs.request === 'attach') {
                if (!launchArgs.processId) {
                    return reject(`Missing process ID`);
                }
                if (!fs_1.existsSync(launchArgs.dlvToolPath)) {
                    return reject(`Cannot find Delve debugger. Install from https://github.com/go-delve/delve & ensure it is in your Go tools path, "GOPATH/bin" or "PATH".`);
                }
                dlvArgs.push('attach', `${launchArgs.processId}`);
                dlvArgs.push('--headless=true', '--listen=' + launchArgs.host + ':' + launchArgs.port.toString());
                if (!this.isApiV1) {
                    dlvArgs.push('--api-version=2');
                }
                if (launchArgs.showLog) {
                    dlvArgs.push('--log=' + launchArgs.showLog.toString());
                }
                if (launchArgs.logOutput) {
                    dlvArgs.push('--log-output=' + launchArgs.logOutput);
                }
                if (launchArgs.cwd) {
                    dlvArgs.push('--wd=' + launchArgs.cwd);
                }
                if (launchArgs.backend) {
                    dlvArgs.push('--backend=' + launchArgs.backend);
                }
            }
            log(`Current working directory: ${dlvCwd}`);
            log(`Running: ${launchArgs.dlvToolPath} ${dlvArgs.join(' ')}`);
            this.debugProcess = child_process_1.spawn(launchArgs.dlvToolPath, dlvArgs, {
                cwd: dlvCwd,
                env,
            });
            function connectClient(port, host) {
                // Add a slight delay to avoid issues on Linux with
                // Delve failing calls made shortly after connection.
                setTimeout(() => {
                    const client = json_rpc2_1.Client.$create(port, host);
                    client.connectSocket((err, conn) => {
                        if (err)
                            return reject(err);
                        return resolve(conn);
                    });
                }, 200);
            }
            this.debugProcess.stderr.on('data', chunk => {
                const str = chunk.toString();
                if (this.onstderr) {
                    this.onstderr(str);
                }
            });
            this.debugProcess.stdout.on('data', chunk => {
                const str = chunk.toString();
                if (this.onstdout) {
                    this.onstdout(str);
                }
                if (!serverRunning) {
                    serverRunning = true;
                    connectClient(launchArgs.port, launchArgs.host);
                }
            });
            this.debugProcess.on('close', (code) => {
                // TODO: Report `dlv` crash to user.
                logError('Process exiting with code: ' + code);
                if (this.onclose) {
                    this.onclose(code);
                }
            });
            this.debugProcess.on('error', (err) => {
                reject(err);
            });
        });
    }
    call(command, args, callback) {
        this.connection.then(conn => {
            conn.call('RPCServer.' + command, args, callback);
        }, err => {
            callback(err, null);
        });
    }
    callPromise(command, args) {
        return new Promise((resolve, reject) => {
            this.connection.then(conn => {
                conn.call(`RPCServer.${command}`, args, (err, res) => {
                    return err ? reject(err) : resolve(res);
                });
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Closing a debugging session follows different approaches for launch vs attach debugging.
     *
     * For launch debugging, since the extension starts the delve process, the extension should close it as well.
     * To gracefully clean up the assets created by delve, we send the Detach request with kill option set to true.
     *
     * For attach debugging there are two scenarios; attaching to a local process by ID or connecting to a
     * remote delve server.  For attach-local we start the delve process so will also terminate it however we
     * detach from the debugee without killing it.  For attach-remote we only detach from delve.
     *
     * The only way to detach from delve when it is running a program is to send a Halt request first.
     * Since the Halt request might sometimes take too long to complete, we have a timer in place to forcefully kill
     * the debug process and clean up the assets in case of local debugging
     */
    close() {
        if (this.noDebug) {
            // delve isn't running so no need to halt
            return Promise.resolve();
        }
        log('HaltRequest');
        const isLocalDebugging = this.request === 'launch' && !!this.debugProcess;
        const forceCleanup = () => __awaiter(this, void 0, void 0, function* () {
            killTree(this.debugProcess.pid);
            yield removeFile(this.localDebugeePath);
        });
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const timeoutToken = isLocalDebugging && setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                log('Killing debug process manually as we could not halt delve in time');
                yield forceCleanup();
                resolve();
            }), 1000);
            let haltErrMsg;
            try {
                yield this.callPromise('Command', [{ name: 'halt' }]);
            }
            catch (err) {
                log('HaltResponse');
                haltErrMsg = err ? err.toString() : '';
                log(`Failed to halt - ${haltErrMsg}`);
            }
            clearTimeout(timeoutToken);
            const targetHasExited = haltErrMsg && haltErrMsg.endsWith('has exited with status 0');
            const shouldDetach = !haltErrMsg || targetHasExited;
            let shouldForceClean = !shouldDetach && isLocalDebugging;
            if (shouldDetach) {
                log('DetachRequest');
                try {
                    yield this.callPromise('Detach', [this.isApiV1 ? true : { Kill: isLocalDebugging }]);
                }
                catch (err) {
                    log('DetachResponse');
                    logError(`Failed to detach - ${(err.toString() || '')}`);
                    shouldForceClean = isLocalDebugging;
                }
            }
            if (shouldForceClean) {
                yield forceCleanup();
            }
            return resolve();
        }));
    }
    getLocalDebugeePath(output) {
        const configOutput = output || 'debug';
        return path.isAbsolute(configOutput)
            ? configOutput
            : path.resolve(this.program, configOutput);
    }
}
class GoDebugSession extends vscode_debugadapter_1.LoggingDebugSession {
    constructor(debuggerLinesStartAt1, isServer = false) {
        super('', debuggerLinesStartAt1, isServer);
        this.packageInfo = new Map();
        this.logLevel = vscode_debugadapter_1.Logger.LogLevel.Error;
        this.initdone = 'initdone·';
        this.showGlobalVariables = false;
        this.continueEpoch = 0;
        this.continueRequestRunning = false;
        this.variableHandles = new vscode_debugadapter_1.Handles();
        this.skipStopEventOnce = false;
        this.stopOnEntry = false;
        this.goroutines = new Set();
        this.debugState = null;
        this.delve = null;
        this.breakpoints = new Map();
        this.stackFrameHandles = new vscode_debugadapter_1.Handles();
    }
    initializeRequest(response, args) {
        log('InitializeRequest');
        // This debug adapter implements the configurationDoneRequest.
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsSetVariable = true;
        this.sendResponse(response);
        log('InitializeResponse');
    }
    findPathSeperator(path) {
        if (/^(\w:[\\/]|\\\\)/.test(path))
            return '\\';
        return path.includes('/') ? '/' : '\\';
    }
    // contains common code for launch and attach debugging initialization
    initLaunchAttachRequest(response, args) {
        this.logLevel = args.trace === 'verbose' ?
            vscode_debugadapter_1.Logger.LogLevel.Verbose :
            args.trace === 'log' ? vscode_debugadapter_1.Logger.LogLevel.Log :
                vscode_debugadapter_1.Logger.LogLevel.Error;
        const logPath = this.logLevel !== vscode_debugadapter_1.Logger.LogLevel.Error ? path.join(os.tmpdir(), 'vscode-go-debug.txt') : undefined;
        vscode_debugadapter_1.logger.setup(this.logLevel, logPath);
        if (typeof (args.showGlobalVariables) === 'boolean') {
            this.showGlobalVariables = args.showGlobalVariables;
        }
        if (args.stopOnEntry) {
            this.stopOnEntry = args.stopOnEntry;
        }
        if (!args.port) {
            args.port = random(2000, 50000);
        }
        if (!args.host) {
            args.host = '127.0.0.1';
        }
        let localPath;
        if (args.request === 'attach') {
            localPath = args.cwd;
        }
        else if (args.request === 'launch') {
            localPath = args.program;
        }
        if (!args.remotePath) {
            // too much code relies on remotePath never being null
            args.remotePath = '';
        }
        if (args.remotePath.length > 0) {
            this.localPathSeparator = this.findPathSeperator(localPath);
            this.remotePathSeparator = this.findPathSeperator(args.remotePath);
            const llist = localPath.split(/\/|\\/).reverse();
            const rlist = args.remotePath.split(/\/|\\/).reverse();
            let i = 0;
            for (; i < llist.length; i++)
                if (llist[i] !== rlist[i] || llist[i] === 'src')
                    break;
            if (i) {
                localPath = llist.reverse().slice(0, -i).join(this.localPathSeparator) + this.localPathSeparator;
                args.remotePath = rlist.reverse().slice(0, -i).join(this.remotePathSeparator) + this.remotePathSeparator;
            }
            else if ((args.remotePath.endsWith('\\')) || (args.remotePath.endsWith('/'))) {
                args.remotePath = args.remotePath.substring(0, args.remotePath.length - 1);
            }
        }
        // Launch the Delve debugger on the program
        this.delve = new Delve(args, localPath);
        this.delve.onstdout = (str) => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(str, 'stdout'));
        };
        this.delve.onstderr = (str) => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(str, 'stderr'));
        };
        this.delve.onclose = (code) => {
            if (code !== 0) {
                this.sendErrorResponse(response, 3000, 'Failed to continue: Check the debug console for details.');
            }
            log('Sending TerminatedEvent as delve is closed');
            this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
        };
        this.delve.connection.then(() => {
            if (!this.delve.noDebug) {
                this.delve.call('GetVersion', [], (err, out) => {
                    if (err) {
                        logError(err);
                        return this.sendErrorResponse(response, 2001, 'Failed to get remote server version: "{e}"', { e: err.toString() });
                    }
                    const clientVersion = this.delve.isApiV1 ? 1 : 2;
                    if (out.APIVersion !== clientVersion) {
                        const errorMessage = `The remote server is running on delve v${out.APIVersion} API and the client is running v${clientVersion} API. Change the version used on the client by using the property "apiVersion" in your launch.json file.`;
                        logError(errorMessage);
                        return this.sendErrorResponse(response, 3000, errorMessage);
                    }
                });
                this.sendEvent(new vscode_debugadapter_1.InitializedEvent());
                log('InitializeEvent');
            }
            this.sendResponse(response);
        }, err => {
            this.sendErrorResponse(response, 3000, 'Failed to continue: "{e}"', { e: err.toString() });
            log('ContinueResponse');
        });
    }
    launchRequest(response, args) {
        if (!args.program) {
            this.sendErrorResponse(response, 3000, 'Failed to continue: The program attribute is missing in the debug configuration in launch.json');
            return;
        }
        this.initLaunchAttachRequest(response, args);
    }
    attachRequest(response, args) {
        if (args.mode === 'local' && !args.processId) {
            this.sendErrorResponse(response, 3000, 'Failed to continue: the processId attribute is missing in the debug configuration in launch.json');
        }
        else if (args.mode === 'remote' && !args.port) {
            this.sendErrorResponse(response, 3000, 'Failed to continue: the port attribute is missing in the debug configuration in launch.json');
        }
        this.initLaunchAttachRequest(response, args);
    }
    disconnectRequest(response, args) {
        log('DisconnectRequest');
        this.delve.close().then(() => {
            log('DisconnectRequest to parent');
            super.disconnectRequest(response, args);
            log('DisconnectResponse');
        });
    }
    configurationDoneRequest(response, args) {
        log('ConfigurationDoneRequest');
        if (this.stopOnEntry) {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('breakpoint', 0));
            log('StoppedEvent("breakpoint")');
            this.sendResponse(response);
        }
        else {
            this.continueRequest(response);
        }
    }
    toDebuggerPath(path) {
        if (this.delve.remotePath.length === 0) {
            return this.convertClientPathToDebugger(path);
        }
        return path.replace(this.delve.program, this.delve.remotePath).split(this.localPathSeparator).join(this.remotePathSeparator);
    }
    toLocalPath(pathToConvert) {
        if (this.delve.remotePath.length === 0) {
            return this.convertDebuggerPathToClient(pathToConvert);
        }
        // Fix for https://github.com/Microsoft/vscode-go/issues/1178
        // When the pathToConvert is under GOROOT, replace the remote GOROOT with local GOROOT
        if (!pathToConvert.startsWith(this.delve.remotePath)) {
            const index = pathToConvert.indexOf(`${this.remotePathSeparator}src${this.remotePathSeparator}`);
            const goroot = process.env['GOROOT'];
            if (goroot && index > 0) {
                return path.join(goroot, pathToConvert.substr(index));
            }
        }
        return pathToConvert.replace(this.delve.remotePath, this.delve.program).split(this.remotePathSeparator).join(this.localPathSeparator);
    }
    updateGoroutinesList(goroutines) {
        // Assume we need to stop all the threads we saw before...
        const needsToBeStopped = new Set();
        this.goroutines.forEach(id => needsToBeStopped.add(id));
        for (const goroutine of goroutines) {
            // ...but delete from list of threads to stop if we still see it
            needsToBeStopped.delete(goroutine.id);
            if (!this.goroutines.has(goroutine.id)) {
                // Send started event if it's new
                this.sendEvent(new vscode_debugadapter_1.ThreadEvent('started', goroutine.id));
            }
            this.goroutines.add(goroutine.id);
        }
        // Send existed event if it's no longer there
        needsToBeStopped.forEach(id => {
            this.sendEvent(new vscode_debugadapter_1.ThreadEvent('exited', id));
            this.goroutines.delete(id);
        });
    }
    setBreakPoints(response, args) {
        const file = normalizePath(args.source.path);
        if (!this.breakpoints.get(file)) {
            this.breakpoints.set(file, []);
        }
        const remoteFile = this.toDebuggerPath(file);
        return Promise.all(this.breakpoints.get(file).map(existingBP => {
            log('Clearing: ' + existingBP.id);
            return this.delve.callPromise('ClearBreakpoint', [this.delve.isApiV1 ? existingBP.id : { Id: existingBP.id }]);
        })).then(() => {
            log('All cleared');
            return Promise.all(args.breakpoints.map(breakpoint => {
                if (this.delve.remotePath.length === 0) {
                    log('Creating on: ' + file + ':' + breakpoint.line);
                }
                else {
                    log('Creating on: ' + file + ' (' + remoteFile + ') :' + breakpoint.line);
                }
                const breakpointIn = {};
                breakpointIn.file = remoteFile;
                breakpointIn.line = breakpoint.line;
                breakpointIn.loadArgs = this.delve.loadConfig;
                breakpointIn.loadLocals = this.delve.loadConfig;
                breakpointIn.cond = breakpoint.condition;
                return this.delve.callPromise('CreateBreakpoint', [this.delve.isApiV1 ? breakpointIn : { Breakpoint: breakpointIn }]).then(null, err => {
                    log('Error on CreateBreakpoint: ' + err.toString());
                    return null;
                });
            }));
        }).then(newBreakpoints => {
            if (!this.delve.isApiV1) {
                // Unwrap breakpoints from v2 apicall
                newBreakpoints = newBreakpoints.map((bp, i) => {
                    return bp ? bp.Breakpoint : null;
                });
            }
            log('All set:' + JSON.stringify(newBreakpoints));
            const breakpoints = newBreakpoints.map((bp, i) => {
                if (bp) {
                    return { verified: true, line: bp.line };
                }
                else {
                    return { verified: false, line: args.lines[i] };
                }
            });
            this.breakpoints.set(file, newBreakpoints.filter(x => !!x));
            return breakpoints;
        }).then(breakpoints => {
            response.body = { breakpoints };
            this.sendResponse(response);
            log('SetBreakPointsResponse');
        }, err => {
            this.sendErrorResponse(response, 2002, 'Failed to set breakpoint: "{e}"', { e: err.toString() });
            logError(err);
        });
    }
    setBreakPointsRequest(response, args) {
        log('SetBreakPointsRequest');
        if (!this.continueRequestRunning) {
            this.setBreakPoints(response, args);
        }
        else {
            this.skipStopEventOnce = true;
            this.delve.callPromise('Command', [{ name: 'halt' }]).then(() => {
                return this.setBreakPoints(response, args).then(() => {
                    return this.continue(true).then(null, err => {
                        logError(`Failed to continue delve after halting it to set breakpoints: "${err.toString()}"`);
                    });
                });
            }, err => {
                this.skipStopEventOnce = false;
                logError(err);
                return this.sendErrorResponse(response, 2008, 'Failed to halt delve before attempting to set breakpoint: "{e}"', { e: err.toString() });
            });
        }
    }
    threadsRequest(response) {
        if (this.continueRequestRunning) {
            // Thread request to delve is syncronous and will block if a previous async continue request didn't return
            response.body = { threads: [new vscode_debugadapter_1.Thread(1, 'Dummy')] };
            return this.sendResponse(response);
        }
        log('ThreadsRequest');
        this.delve.call('ListGoroutines', [], (err, out) => {
            if (this.debugState && this.debugState.exited) {
                // If the program exits very quickly, the initial threadsRequest will complete after it has exited.
                // A TerminatedEvent has already been sent. Ignore the err returned in this case.
                response.body = { threads: [] };
                return this.sendResponse(response);
            }
            if (err) {
                logError('Failed to get threads - ' + err.toString());
                return this.sendErrorResponse(response, 2003, 'Unable to display threads: "{e}"', { e: err.toString() });
            }
            const goroutines = this.delve.isApiV1 ? out : out.Goroutines;
            log('goroutines', goroutines);
            this.updateGoroutinesList(goroutines);
            const threads = goroutines.map(goroutine => new vscode_debugadapter_1.Thread(goroutine.id, goroutine.userCurrentLoc.function ? goroutine.userCurrentLoc.function.name : (goroutine.userCurrentLoc.file + '@' + goroutine.userCurrentLoc.line)));
            response.body = { threads };
            this.sendResponse(response);
            log('ThreadsResponse', threads);
        });
    }
    stackTraceRequest(response, args) {
        log('StackTraceRequest');
        // delve does not support frame paging, so we ask for a large depth
        const goroutineId = args.threadId;
        const stackTraceIn = { id: goroutineId, depth: this.delve.stackTraceDepth };
        if (!this.delve.isApiV1) {
            Object.assign(stackTraceIn, { full: false, cfg: this.delve.loadConfig });
        }
        this.delve.call(this.delve.isApiV1 ? 'StacktraceGoroutine' : 'Stacktrace', [stackTraceIn], (err, out) => {
            if (err) {
                logError('Failed to produce stack trace!');
                return this.sendErrorResponse(response, 2004, 'Unable to produce stack trace: "{e}"', { e: err.toString() });
            }
            const locations = this.delve.isApiV1 ? out : out.Locations;
            log('locations', locations);
            let stackFrames = locations.map((location, frameId) => {
                const uniqueStackFrameId = this.stackFrameHandles.create([goroutineId, frameId]);
                return new vscode_debugadapter_1.StackFrame(uniqueStackFrameId, location.function ? location.function.name : '<unknown>', location.file === '<autogenerated>' ? null : new vscode_debugadapter_1.Source(path_1.basename(location.file), this.toLocalPath(location.file)), location.line, 0);
            });
            if (args.startFrame > 0) {
                stackFrames = stackFrames.slice(args.startFrame);
            }
            if (args.levels > 0) {
                stackFrames = stackFrames.slice(0, args.levels);
            }
            response.body = { stackFrames, totalFrames: locations.length };
            this.sendResponse(response);
            log('StackTraceResponse');
        });
    }
    scopesRequest(response, args) {
        log('ScopesRequest');
        const [goroutineId, frameId] = this.stackFrameHandles.get(args.frameId);
        const listLocalVarsIn = { goroutineID: goroutineId, frame: frameId };
        this.delve.call('ListLocalVars', this.delve.isApiV1 ? [listLocalVarsIn] : [{ scope: listLocalVarsIn, cfg: this.delve.loadConfig }], (err, out) => {
            if (err) {
                logError('Failed to list local variables - ' + err.toString());
                return this.sendErrorResponse(response, 2005, 'Unable to list locals: "{e}"', { e: err.toString() });
            }
            const locals = this.delve.isApiV1 ? out : out.Variables;
            log('locals', locals);
            this.addFullyQualifiedName(locals);
            const listLocalFunctionArgsIn = { goroutineID: goroutineId, frame: frameId };
            this.delve.call('ListFunctionArgs', this.delve.isApiV1 ? [listLocalFunctionArgsIn] : [{ scope: listLocalFunctionArgsIn, cfg: this.delve.loadConfig }], (err, outArgs) => {
                if (err) {
                    logError('Failed to list function args - ' + err.toString());
                    return this.sendErrorResponse(response, 2006, 'Unable to list args: "{e}"', { e: err.toString() });
                }
                const args = this.delve.isApiV1 ? outArgs : outArgs.Args;
                log('functionArgs', args);
                this.addFullyQualifiedName(args);
                const vars = args.concat(locals);
                // annotate shadowed variables in parentheses
                const shadowedVars = new Map();
                for (let i = 0; i < vars.length; ++i) {
                    if ((vars[i].flags & GoVariableFlags.VariableShadowed) === 0) {
                        continue;
                    }
                    const varName = vars[i].name;
                    if (!shadowedVars.has(varName)) {
                        const indices = new Array();
                        indices.push(i);
                        shadowedVars.set(varName, indices);
                    }
                    else {
                        shadowedVars.get(varName).push(i);
                    }
                }
                for (const svIndices of shadowedVars.values()) {
                    // sort by declared line number in descending order
                    svIndices.sort((lhs, rhs) => {
                        return vars[rhs].DeclLine - vars[lhs].DeclLine;
                    });
                    // enclose in parentheses, one pair per scope
                    for (let scope = 0; scope < svIndices.length; ++scope) {
                        const svIndex = svIndices[scope];
                        // start at -1 so scope of 0 has one pair of parens
                        for (let count = -1; count < scope; ++count) {
                            vars[svIndex].name = `(${vars[svIndex].name})`;
                        }
                    }
                }
                const scopes = new Array();
                const localVariables = {
                    name: 'Local',
                    addr: 0,
                    type: '',
                    realType: '',
                    kind: 0,
                    flags: 0,
                    onlyAddr: false,
                    DeclLine: 0,
                    value: '',
                    len: 0,
                    cap: 0,
                    children: vars,
                    unreadable: '',
                    fullyQualifiedName: '',
                };
                scopes.push(new vscode_debugadapter_1.Scope('Local', this.variableHandles.create(localVariables), false));
                response.body = { scopes };
                if (!this.showGlobalVariables) {
                    this.sendResponse(response);
                    log('ScopesResponse');
                    return;
                }
                this.getPackageInfo(this.debugState).then(packageName => {
                    if (!packageName) {
                        this.sendResponse(response);
                        log('ScopesResponse');
                        return;
                    }
                    const filter = `^${packageName}\\.`;
                    this.delve.call('ListPackageVars', this.delve.isApiV1 ? [filter] : [{ filter, cfg: this.delve.loadConfig }], (err, out) => {
                        if (err) {
                            logError('Failed to list global vars - ' + err.toString());
                            return this.sendErrorResponse(response, 2007, 'Unable to list global vars: "{e}"', { e: err.toString() });
                        }
                        const globals = this.delve.isApiV1 ? out : out.Variables;
                        let initdoneIndex = -1;
                        for (let i = 0; i < globals.length; i++) {
                            globals[i].name = globals[i].name.substr(packageName.length + 1);
                            if (initdoneIndex === -1 && globals[i].name === this.initdone) {
                                initdoneIndex = i;
                            }
                        }
                        if (initdoneIndex > -1) {
                            globals.splice(initdoneIndex, 1);
                        }
                        log('global vars', globals);
                        const globalVariables = {
                            name: 'Global',
                            addr: 0,
                            type: '',
                            realType: '',
                            kind: 0,
                            flags: 0,
                            onlyAddr: false,
                            DeclLine: 0,
                            value: '',
                            len: 0,
                            cap: 0,
                            children: globals,
                            unreadable: '',
                            fullyQualifiedName: '',
                        };
                        scopes.push(new vscode_debugadapter_1.Scope('Global', this.variableHandles.create(globalVariables), false));
                        this.sendResponse(response);
                        log('ScopesResponse');
                    });
                });
            });
        });
    }
    getPackageInfo(debugState) {
        if (!debugState.currentThread || !debugState.currentThread.file) {
            return Promise.resolve(null);
        }
        const dir = path.dirname(this.delve.remotePath.length ? this.toLocalPath(debugState.currentThread.file) : debugState.currentThread.file);
        if (this.packageInfo.has(dir)) {
            return Promise.resolve(this.packageInfo.get(dir));
        }
        return new Promise(resolve => {
            child_process_1.execFile(goPath_1.getBinPathWithPreferredGopath('go', []), ['list', '-f', '{{.Name}} {{.ImportPath}}'], { cwd: dir, env: this.delve.dlvEnv }, (err, stdout, stderr) => {
                if (err || stderr || !stdout) {
                    logError(`go list failed on ${dir}: ${stderr || err}`);
                    return resolve();
                }
                if (stdout.split('\n').length !== 2) {
                    logError(`Cannot determine package for ${dir}`);
                    return resolve();
                }
                const spaceIndex = stdout.indexOf(' ');
                const result = stdout.substr(0, spaceIndex) === 'main' ? 'main' : stdout.substr(spaceIndex).trim();
                this.packageInfo.set(dir, result);
                resolve(result);
            });
        });
    }
    convertDebugVariableToProtocolVariable(v) {
        if (v.kind === GoReflectKind.UnsafePointer) {
            return {
                result: `unsafe.Pointer(0x${v.children[0].addr.toString(16)})`,
                variablesReference: 0
            };
        }
        else if (v.kind === GoReflectKind.Ptr) {
            if (v.children[0].addr === 0) {
                return {
                    result: 'nil <' + v.type + '>',
                    variablesReference: 0
                };
            }
            else if (v.children[0].type === 'void') {
                return {
                    result: 'void',
                    variablesReference: 0
                };
            }
            else {
                if (v.children[0].children.length > 0) {
                    // Generate correct fullyQualified names for variable expressions
                    v.children[0].fullyQualifiedName = v.fullyQualifiedName;
                    v.children[0].children.forEach(child => {
                        child.fullyQualifiedName = v.fullyQualifiedName + '.' + child.name;
                    });
                }
                return {
                    result: `<${v.type}>(0x${v.children[0].addr.toString(16)})`,
                    variablesReference: v.children.length > 0 ? this.variableHandles.create(v) : 0
                };
            }
        }
        else if (v.kind === GoReflectKind.Slice) {
            return {
                result: '<' + v.type + '> (length: ' + v.len + ', cap: ' + v.cap + ')',
                variablesReference: this.variableHandles.create(v)
            };
        }
        else if (v.kind === GoReflectKind.Map) {
            return {
                result: '<' + v.type + '> (length: ' + v.len + ')',
                variablesReference: this.variableHandles.create(v)
            };
        }
        else if (v.kind === GoReflectKind.Array) {
            return {
                result: '<' + v.type + '>',
                variablesReference: this.variableHandles.create(v)
            };
        }
        else if (v.kind === GoReflectKind.String) {
            let val = v.value;
            const byteLength = Buffer.byteLength(val || '');
            if (v.value && byteLength < v.len) {
                val += `...+${v.len - byteLength} more`;
            }
            return {
                result: v.unreadable ? ('<' + v.unreadable + '>') : ('"' + val + '"'),
                variablesReference: 0
            };
        }
        else {
            // Default case - structs
            if (v.children.length > 0) {
                // Generate correct fullyQualified names for variable expressions
                v.children.forEach(child => {
                    child.fullyQualifiedName = v.fullyQualifiedName + '.' + child.name;
                });
            }
            return {
                result: v.value || ('<' + v.type + '>'),
                variablesReference: v.children.length > 0 ? this.variableHandles.create(v) : 0
            };
        }
    }
    variablesRequest(response, args) {
        log('VariablesRequest');
        const vari = this.variableHandles.get(args.variablesReference);
        let variablesPromise;
        const loadChildren = (exp, v) => __awaiter(this, void 0, void 0, function* () {
            // from https://github.com/go-delve/delve/blob/master/Documentation/api/ClientHowto.md#looking-into-variables
            if ((v.kind === GoReflectKind.Struct && v.len > v.children.length) ||
                (v.kind === GoReflectKind.Interface && v.children.length > 0 && v.children[0].onlyAddr === true)) {
                yield this.evaluateRequestImpl({ 'expression': exp }).then(result => {
                    const variable = this.delve.isApiV1 ? result : result.Variable;
                    v.children = variable.children;
                }, err => logError('Failed to evaluate expression - ' + err.toString()));
            }
        });
        // expressions passed to loadChildren defined per https://github.com/go-delve/delve/blob/master/Documentation/api/ClientHowto.md#loading-more-of-a-variable
        if (vari.kind === GoReflectKind.Array || vari.kind === GoReflectKind.Slice) {
            variablesPromise = Promise.all(vari.children.map((v, i) => {
                return loadChildren(`*(*"${v.type}")(${v.addr})`, v).then(() => {
                    const { result, variablesReference } = this.convertDebugVariableToProtocolVariable(v);
                    return {
                        name: '[' + i + ']',
                        value: result,
                        evaluateName: vari.fullyQualifiedName + '[' + i + ']',
                        variablesReference
                    };
                });
            }));
        }
        else if (vari.kind === GoReflectKind.Map) {
            variablesPromise = Promise.all(vari.children.map((_, i) => {
                // even indices are map keys, odd indices are values
                if (i % 2 === 0 && i + 1 < vari.children.length) {
                    const mapKey = this.convertDebugVariableToProtocolVariable(vari.children[i]);
                    return loadChildren(`${vari.fullyQualifiedName}.${vari.name}[${mapKey.result}]`, vari.children[i + 1]).then(() => {
                        const mapValue = this.convertDebugVariableToProtocolVariable(vari.children[i + 1]);
                        return {
                            name: mapKey.result,
                            value: mapValue.result,
                            evaluateName: vari.fullyQualifiedName + '[' + mapKey.result + ']',
                            variablesReference: mapValue.variablesReference
                        };
                    });
                }
            }));
        }
        else {
            variablesPromise = Promise.all(vari.children.map((v) => {
                return loadChildren(`*(*"${v.type}")(${v.addr})`, v).then(() => {
                    const { result, variablesReference } = this.convertDebugVariableToProtocolVariable(v);
                    return {
                        name: v.name,
                        value: result,
                        evaluateName: v.fullyQualifiedName,
                        variablesReference
                    };
                });
            }));
        }
        variablesPromise.then((variables) => {
            response.body = { variables };
            this.sendResponse(response);
            log('VariablesResponse', JSON.stringify(variables, null, ' '));
        });
    }
    cleanupHandles() {
        this.variableHandles.reset();
        this.stackFrameHandles.reset();
    }
    handleReenterDebug(reason) {
        this.cleanupHandles();
        if (this.debugState.exited) {
            this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            log('TerminatedEvent');
        }
        else {
            // [TODO] Can we avoid doing this? https://github.com/Microsoft/vscode/issues/40#issuecomment-161999881
            this.delve.call('ListGoroutines', [], (err, out) => {
                if (err) {
                    logError('Failed to get threads - ' + err.toString());
                }
                const goroutines = this.delve.isApiV1 ? out : out.Goroutines;
                this.updateGoroutinesList(goroutines);
                if (!this.debugState.currentGoroutine && goroutines.length > 0) {
                    this.debugState.currentGoroutine = goroutines[0];
                }
                if (this.skipStopEventOnce) {
                    this.skipStopEventOnce = false;
                    return;
                }
                const stoppedEvent = new vscode_debugadapter_1.StoppedEvent(reason, this.debugState.currentGoroutine.id);
                stoppedEvent.body.allThreadsStopped = true;
                this.sendEvent(stoppedEvent);
                log('StoppedEvent("' + reason + '")');
            });
        }
    }
    continue(calledWhenSettingBreakpoint) {
        this.continueEpoch++;
        const closureEpoch = this.continueEpoch;
        this.continueRequestRunning = true;
        const callback = (out) => {
            if (closureEpoch === this.continueEpoch) {
                this.continueRequestRunning = false;
            }
            const state = this.delve.isApiV1 ? out : out.State;
            log('continue state', state);
            this.debugState = state;
            this.handleReenterDebug('breakpoint');
        };
        // If called when setting breakpoint internally, we want the error to bubble up.
        const errorCallback = calledWhenSettingBreakpoint ? null : (err) => {
            if (err) {
                logError('Failed to continue - ' + err.toString());
            }
            this.handleReenterDebug('breakpoint');
            throw err;
        };
        return this.delve.callPromise('Command', [{ name: 'continue' }]).then(callback, errorCallback);
    }
    continueRequest(response) {
        log('ContinueRequest');
        this.continue();
        this.sendResponse(response);
        log('ContinueResponse');
    }
    nextRequest(response) {
        log('NextRequest');
        this.delve.call('Command', [{ name: 'next' }], (err, out) => {
            if (err) {
                logError('Failed to next - ' + err.toString());
            }
            const state = this.delve.isApiV1 ? out : out.State;
            log('next state', state);
            this.debugState = state;
            this.handleReenterDebug('step');
        });
        this.sendResponse(response);
        log('NextResponse');
    }
    stepInRequest(response) {
        log('StepInRequest');
        this.delve.call('Command', [{ name: 'step' }], (err, out) => {
            if (err) {
                logError('Failed to step - ' + err.toString());
            }
            const state = this.delve.isApiV1 ? out : out.State;
            log('stop state', state);
            this.debugState = state;
            this.handleReenterDebug('step');
        });
        this.sendResponse(response);
        log('StepInResponse');
    }
    stepOutRequest(response) {
        log('StepOutRequest');
        this.delve.call('Command', [{ name: 'stepOut' }], (err, out) => {
            if (err) {
                logError('Failed to stepout - ' + err.toString());
            }
            const state = this.delve.isApiV1 ? out : out.State;
            log('stepout state', state);
            this.debugState = state;
            this.handleReenterDebug('step');
        });
        this.sendResponse(response);
        log('StepOutResponse');
    }
    pauseRequest(response) {
        log('PauseRequest');
        this.delve.call('Command', [{ name: 'halt' }], (err, out) => {
            if (err) {
                logError('Failed to halt - ' + err.toString());
                return this.sendErrorResponse(response, 2010, 'Unable to halt execution: "{e}"', { e: err.toString() });
            }
            const state = this.delve.isApiV1 ? out : out.State;
            log('pause state', state);
            this.debugState = state;
            this.handleReenterDebug('pause');
        });
        this.sendResponse(response);
        log('PauseResponse');
    }
    evaluateRequest(response, args) {
        log('EvaluateRequest');
        this.evaluateRequestImpl(args).then(out => {
            const variable = this.delve.isApiV1 ? out : out.Variable;
            // #2326: Set the fully qualified name for variable mapping
            variable.fullyQualifiedName = variable.name;
            response.body = this.convertDebugVariableToProtocolVariable(variable);
            this.sendResponse(response);
            log('EvaluateResponse');
        }, err => {
            this.sendErrorResponse(response, 2009, 'Unable to eval expression: "{e}"', { e: err.toString() });
        });
    }
    evaluateRequestImpl(args) {
        // default to the topmost stack frame of the current goroutine
        let goroutineId = -1;
        let frameId = 0;
        // args.frameId won't be specified when evaluating global vars
        if (args.frameId) {
            [goroutineId, frameId] = this.stackFrameHandles.get(args.frameId);
        }
        const scope = {
            goroutineID: goroutineId,
            frame: frameId
        };
        const evalSymbolArgs = this.delve.isApiV1 ? {
            symbol: args.expression,
            scope
        } : {
            Expr: args.expression,
            Scope: scope,
            Cfg: this.delve.loadConfig
        };
        const returnValue = this.delve.callPromise(this.delve.isApiV1 ? 'EvalSymbol' : 'Eval', [evalSymbolArgs]).then(val => val, err => {
            logError('Failed to eval expression: ', JSON.stringify(evalSymbolArgs, null, ' '), '\n\rEval error:', err.toString());
            return Promise.reject(err);
        });
        return returnValue;
    }
    setVariableRequest(response, args) {
        log('SetVariableRequest');
        const scope = {
            goroutineID: this.debugState.currentGoroutine.id
        };
        const setSymbolArgs = {
            Scope: scope,
            Symbol: args.name,
            Value: args.value
        };
        this.delve.call(this.delve.isApiV1 ? 'SetSymbol' : 'Set', [setSymbolArgs], (err) => {
            if (err) {
                const errMessage = `Failed to set variable: ${err.toString()}`;
                logError(errMessage);
                return this.sendErrorResponse(response, 2010, errMessage);
            }
            response.body = { value: args.value };
            this.sendResponse(response);
            log('SetVariableResponse');
        });
    }
    addFullyQualifiedName(variables) {
        variables.forEach(local => {
            local.fullyQualifiedName = local.name;
            local.children.forEach(child => {
                child.fullyQualifiedName = local.name;
            });
        });
    }
}
function random(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
function killTree(processId) {
    if (process.platform === 'win32') {
        const TASK_KILL = 'C:\\Windows\\System32\\taskkill.exe';
        // when killing a process in Windows its child processes are *not* killed but become root processes.
        // Therefore we use TASKKILL.EXE
        try {
            child_process_1.execSync(`${TASK_KILL} /F /T /PID ${processId}`);
        }
        catch (err) {
        }
    }
    else {
        // on linux and OS X we kill all direct and indirect child processes as well
        try {
            const cmd = path.join(__dirname, '../../../scripts/terminateProcess.sh');
            child_process_1.spawnSync(cmd, [processId.toString()]);
        }
        catch (err) {
        }
    }
}
function removeFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fileExists = yield fsAccess(filePath)
                .then(() => true)
                .catch(() => false);
            if (filePath && fileExists) {
                yield fsUnlink(filePath);
            }
        }
        catch (e) {
            logError(`Potentially failed remove file: ${filePath} - ${e.toString() || ''}`);
        }
    });
}
vscode_debugadapter_1.DebugSession.run(GoDebugSession);
//# sourceMappingURL=goDebug.js.map