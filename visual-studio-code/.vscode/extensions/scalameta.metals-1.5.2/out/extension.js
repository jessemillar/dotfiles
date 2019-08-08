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
const path = require("path");
const promisify_child_process_1 = require("promisify-child-process");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const child_process_1 = require("child_process");
const client_commands_1 = require("./client-commands");
const protocol_1 = require("./protocol");
const lazy_progress_1 = require("./lazy-progress");
const fs = require("fs");
const semver = require("semver");
const getJavaHome_1 = require("./getJavaHome");
const getJavaOptions_1 = require("./getJavaOptions");
const treeview_1 = require("./treeview");
const MetalsFeatures_1 = require("./MetalsFeatures");
const tree_view_protocol_1 = require("./tree-view-protocol");
const outputChannel = vscode_1.window.createOutputChannel("Metals");
const openSettingsAction = "Open settings";
const openSettingsCommand = "workbench.action.openSettings";
let treeViews;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        detectLaunchConfigurationChanges();
        checkServerVersion();
        getJavaHome_1.getJavaHome()
            .then(javaHome => fetchAndLaunchMetals(context, javaHome))
            .catch(err => {
            const message = "Unable to find Java 8 home. To fix this problem, update the 'Java Home' setting to point to a Java 8 home directory";
            outputChannel.appendLine(message);
            outputChannel.appendLine(err);
            vscode_1.window.showErrorMessage(message, openSettingsAction).then(choice => {
                if (choice === openSettingsAction) {
                    vscode_1.commands.executeCommand("workbench.action.openSettings");
                }
            });
        });
        vscode_1.commands.executeCommand("setContext", "metals:enabled", true);
    });
}
exports.activate = activate;
function fetchAndLaunchMetals(context, javaHome) {
    if (!vscode_1.workspace.workspaceFolders) {
        outputChannel.appendLine(`Metals will not start because you've opened a single file and not a project directory.`);
        return;
    }
    const dottyArtifact = dottyIdeArtifact();
    if (dottyArtifact && fs.existsSync(dottyArtifact)) {
        outputChannel.appendLine(`Metals will not start since Dotty is enabled for this workspace. ` +
            `To enable Metals, remove the file ${dottyArtifact} and run 'Reload window'`);
        return;
    }
    outputChannel.appendLine(`Java home: ${javaHome}`);
    const javaPath = path.join(javaHome, "bin", "java");
    const coursierPath = path.join(context.extensionPath, "./coursier");
    const config = vscode_1.workspace.getConfiguration("metals");
    const serverVersionConfig = config.get("serverVersion");
    const defaultServerVersion = config.inspect("serverVersion")
        .defaultValue;
    const serverVersion = serverVersionConfig
        ? serverVersionConfig
        : defaultServerVersion;
    const serverProperties = vscode_1.workspace
        .getConfiguration("metals")
        .get("serverProperties")
        .split(" ")
        .filter(e => e.length > 0);
    const javaOptions = getJavaOptions_1.getJavaOptions(outputChannel);
    const fetchProperties = serverProperties.filter(p => !p.startsWith("-agentlib"));
    const customRepositories = config
        .get("customRepositories")
        .split(" ")
        .filter(e => e.length > 0)
        .join("|");
    const customRepositoriesEnv = customRepositories.length == 0
        ? {}
        : { COURSIER_REPOSITORIES: customRepositories };
    const fetchProcess = promisify_child_process_1.spawn(javaPath, javaOptions.concat(fetchProperties).concat([
        "-jar",
        coursierPath,
        "fetch",
        "-p",
        "--ttl",
        // Use infinite ttl to avoid redunant "Checking..." logs when using SNAPSHOT
        // versions. Metals SNAPSHOT releases are effectively immutable since we
        // never publish the same version twice.
        "Inf",
        `org.scalameta:metals_2.12:${serverVersion}`,
        "-r",
        "bintray:scalacenter/releases",
        "-r",
        "sonatype:public",
        "-r",
        "sonatype:snapshots",
        "-p"
    ]), {
        env: Object.assign({ COURSIER_NO_TERM: "true" }, customRepositoriesEnv, process.env)
    });
    const title = `Downloading Metals v${serverVersion}`;
    trackDownloadProgress(title, outputChannel, fetchProcess).then(classpath => {
        launchMetals(outputChannel, context, javaPath, classpath, serverProperties, javaOptions);
    }, () => {
        const msg = (() => {
            const proxy = `See https://scalameta.org/metals/docs/editors/vscode.html#http-proxy for instructions ` +
                `if you are using an HTTP proxy.`;
            if (process.env.FLATPAK_SANDBOX_DIR) {
                return (`Failed to download Metals. It seems you are running Visual Studio Code inside the ` +
                    `Flatpak sandbox, which is known to interfere with the download of Metals. ` +
                    `Please, try running Visual Studio Code without Flatpak.`);
            }
            else if (serverVersion === defaultServerVersion) {
                return (`Failed to download Metals, make sure you have an internet connection and ` +
                    `the Java Home '${javaPath}' is valid. You can configure the Java Home in the settings.` +
                    proxy);
            }
            else {
                return (`Failed to download Metals, make sure you have an internet connection, ` +
                    `the Metals version '${serverVersion}' is correct and the Java Home '${javaPath}' is valid. ` +
                    `You can configure the Metals version and Java Home in the settings.` +
                    proxy);
            }
        })();
        outputChannel.show();
        vscode_1.window.showErrorMessage(msg, openSettingsAction).then(choice => {
            if (choice === openSettingsAction) {
                vscode_1.commands.executeCommand(openSettingsCommand);
            }
        });
    });
}
function launchMetals(outputChannel, context, javaPath, metalsClasspath, serverProperties, javaOptions) {
    // Make editing Scala docstrings slightly nicer.
    enableScaladocIndentation();
    const baseProperties = [
        `-Dmetals.input-box=on`,
        `-Dmetals.client=vscode`,
        `-Xss4m`,
        `-Xms100m`
    ];
    const mainArgs = ["-classpath", metalsClasspath, "scala.meta.metals.Main"];
    // let user properties override base properties
    const launchArgs = baseProperties
        .concat(javaOptions)
        .concat(serverProperties)
        .concat(mainArgs);
    const serverOptions = {
        run: { command: javaPath, args: launchArgs },
        debug: { command: javaPath, args: launchArgs }
    };
    const clientOptions = {
        documentSelector: [{ scheme: "file", language: "scala" }],
        synchronize: {
            configurationSection: "metals"
        },
        revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
        outputChannel: outputChannel
    };
    const client = new vscode_languageclient_1.LanguageClient("metals", "Metals", serverOptions, clientOptions);
    const features = new MetalsFeatures_1.MetalsFeatures();
    client.registerFeature(features);
    function registerCommand(command, callback) {
        context.subscriptions.push(vscode_1.commands.registerCommand(command, callback));
    }
    registerCommand("metals.restartServer", () => {
        // First try to gracefully shutdown the server with LSP `shutdown` and `exit`.
        // If Metals doesn't respond within 4 seconds we kill the process.
        const timeout = (ms) => new Promise((_resolve, reject) => setTimeout(reject, ms));
        const gracefullyTerminate = client
            .sendRequest(vscode_languageclient_1.ShutdownRequest.type)
            .then(() => {
            client.sendNotification(vscode_languageclient_1.ExitNotification.type);
            vscode_1.window.showInformationMessage("Metals is restarting");
        });
        Promise.race([gracefullyTerminate, timeout(4000)]).catch(() => {
            vscode_1.window.showWarningMessage("Metals is unresponsive, killing the process and starting a new server.");
            const serverPid = client["_serverProcess"].pid;
            child_process_1.exec(`kill ${serverPid}`);
        });
    });
    context.subscriptions.push(client.start());
    client.onReady().then(_ => {
        let doctor;
        function getDoctorPanel(isReload) {
            if (!doctor) {
                doctor = vscode_1.window.createWebviewPanel("metals-doctor", "Metals Doctor", vscode_1.ViewColumn.Active);
                context.subscriptions.push(doctor);
                doctor.onDidDispose(() => {
                    doctor = undefined;
                });
            }
            else if (!isReload) {
                doctor.reveal();
            }
            return doctor;
        }
        [
            "build-import",
            "build-connect",
            "sources-scan",
            "doctor-run",
            "compile-cascade",
            "compile-cancel"
        ].forEach(command => {
            registerCommand("metals." + command, () => __awaiter(this, void 0, void 0, function* () { return client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, { command: command }); }));
        });
        let channelOpen = false;
        const clientCommands = {
            focusDiagnostics: () => vscode_1.commands.executeCommand("workbench.action.problems.focus"),
            runDoctor: () => vscode_1.commands.executeCommand("metals.doctor-run"),
            // Open or close the extension output channel. The user may have to trigger
            // this command twice in case the channel has been focused through another
            // button. There is no `isFocused` API to check if a channel is focused.
            toggleLogs: () => {
                if (channelOpen) {
                    client.outputChannel.hide();
                    channelOpen = false;
                }
                else {
                    client.outputChannel.show(true);
                    channelOpen = true;
                }
            }
        };
        Object.entries(clientCommands).forEach(([name, command]) => registerCommand(name, command));
        // Handle the metals/executeClientCommand extension notification.
        client.onNotification(protocol_1.ExecuteClientCommand.type, params => {
            const isRun = params.command === "metals-doctor-run";
            const isReload = params.command === "metals-doctor-reload";
            if (isRun || (doctor && isReload)) {
                const html = params.arguments && params.arguments[0];
                if (typeof html === "string") {
                    const panel = getDoctorPanel(isReload);
                    panel.webview.html = html;
                }
            }
            else {
                switch (params.command) {
                    case "metals-goto-location":
                        const location = params.arguments && params.arguments[0];
                        if (location) {
                            vscode_1.workspace
                                .openTextDocument(vscode_1.Uri.parse(location.uri))
                                .then(textDocument => vscode_1.window.showTextDocument(textDocument))
                                .then(editor => {
                                const range = new vscode_1.Range(location.range.start.line, location.range.start.character, location.range.end.line, location.range.end.character);
                                // Select an offset position instead of range position to
                                // avoid triggering noisy document highlight.
                                editor.selection = new vscode_1.Selection(range.start, range.start);
                                editor.revealRange(range, vscode_1.TextEditorRevealType.InCenter);
                            });
                        }
                        break;
                    default:
                        outputChannel.appendLine(`unknown command: ${params.command}`);
                }
            }
            // Ignore other commands since they are less important.
        });
        // The server updates the client with a brief text message about what
        // it is currently doing, for example "Compiling..".
        const item = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 100);
        item.command = client_commands_1.ClientCommands.toggleLogs;
        item.hide();
        client.onNotification(protocol_1.MetalsStatus.type, params => {
            item.text = params.text;
            if (params.show) {
                item.show();
            }
            else if (params.hide) {
                item.hide();
            }
            if (params.tooltip) {
                item.tooltip = params.tooltip;
            }
            if (params.command) {
                item.command = params.command;
                vscode_1.commands.getCommands().then(values => {
                    if (params.command && values.includes(params.command)) {
                        registerCommand(params.command, () => {
                            client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, {
                                command: params.command
                            });
                        });
                    }
                });
            }
            else {
                item.command = undefined;
            }
        });
        registerCommand("metals.goto", args => {
            client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, {
                command: "goto",
                arguments: args
            });
        });
        registerCommand("metals.reveal-active-file", () => {
            if (treeViews) {
                const editor = vscode_1.window.visibleTextEditors.find(e => isSupportedLanguage(e.document.languageId));
                if (editor) {
                    const pos = editor.selection.start;
                    const params = {
                        textDocument: { uri: editor.document.uri.toString() },
                        position: { line: pos.line, character: pos.character }
                    };
                    return vscode_1.window.withProgress({
                        location: vscode_1.ProgressLocation.Window,
                        title: "Metals: Reveal Active File in Side Bar"
                    }, progress => {
                        return client
                            .sendRequest(tree_view_protocol_1.MetalsTreeViewReveal.type, params)
                            .then(result => {
                            progress.report({ increment: 100 });
                            if (treeViews) {
                                treeViews.reveal(result);
                            }
                        });
                    });
                }
            }
            else {
                vscode_1.window.showErrorMessage("This version of Metals does not support tree views.");
            }
        });
        registerCommand("metals-echo-command", (arg) => {
            client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, {
                command: arg
            });
        });
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (editor && isSupportedLanguage(editor.document.languageId)) {
                client.sendNotification(protocol_1.MetalsDidFocus.type, editor.document.uri.toString());
            }
        });
        vscode_1.window.onDidChangeWindowState(windowState => {
            client.sendNotification(protocol_1.MetalsWindowStateDidChange.type, {
                focused: windowState.focused
            });
        });
        client.onRequest(protocol_1.MetalsInputBox.type, (options, requestToken) => {
            return vscode_1.window.showInputBox(options, requestToken).then(result => {
                if (result === undefined) {
                    return { cancelled: true };
                }
                else {
                    return { value: result };
                }
            });
        });
        // Long running tasks such as "import project" trigger start a progress
        // bar with a "cancel" button.
        client.onRequest(protocol_1.MetalsSlowTask.type, (params, requestToken) => {
            return new Promise(requestResolve => {
                vscode_1.window.withProgress({
                    location: vscode_1.ProgressLocation.Notification,
                    title: params.message,
                    cancellable: true
                }, (progress, progressToken) => {
                    // Open logs so user can keep track of progress.
                    client.outputChannel.show(true);
                    // Update total running time every second.
                    let seconds = 0;
                    const interval = setInterval(() => {
                        seconds += 1;
                        progress.report({ message: readableSeconds(seconds) });
                    }, 1000);
                    // Hide logs and clean up resources on completion.
                    function onComplete() {
                        clearInterval(interval);
                        client.outputChannel.hide();
                    }
                    // Client triggered cancelation from the progress notification.
                    progressToken.onCancellationRequested(() => {
                        onComplete();
                        requestResolve({ cancel: true });
                    });
                    return new Promise(progressResolve => {
                        // Server completed long running task.
                        requestToken.onCancellationRequested(() => {
                            onComplete();
                            progress.report({ increment: 100 });
                            setTimeout(() => progressResolve(), 1000);
                        });
                    });
                });
            });
        });
        if (features.treeViewProvider) {
            // NOTE(olafur): `require("./package.json")` should work in theory but it
            // seems to read a stale version of package.json when I try it.
            const packageJson = JSON.parse(fs.readFileSync(path.join(context.extensionPath, "package.json"), "utf8"));
            const viewIds = packageJson.contributes.views["metals-explorer"].map((view) => view.id);
            treeViews = treeview_1.startTreeView(client, outputChannel, context, viewIds);
            context.subscriptions.concat(treeViews.disposables);
        }
    });
}
function trackDownloadProgress(title, output, download) {
    const progress = new lazy_progress_1.LazyProgress();
    let stdout = [];
    download.stdout.on("data", (out) => {
        stdout.push(out);
    });
    download.stderr.on("data", (err) => {
        const msg = err.toString().trim();
        if (!msg.startsWith("Downloading")) {
            output.appendLine(msg);
        }
        progress.startOrContinue(title, output, download);
    });
    download.on("close", (code) => {
        if (code != 0) {
            // something went wrong, print stdout to the console to help troubleshoot.
            stdout.forEach(buffer => output.append(buffer.toString()));
            throw Error(`coursier exit: ${code}`);
        }
    });
    return download.then(() => stdout.map(buffer => buffer.toString().trim()).join(""));
}
function readableSeconds(totalSeconds) {
    const minutes = (totalSeconds / 60) | 0;
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        if (seconds === 0)
            return `${minutes}m`;
        else
            return `${minutes}m${seconds}s`;
    }
    else {
        return `${seconds}s`;
    }
}
function enableScaladocIndentation() {
    // Adapted from:
    // https://github.com/Microsoft/vscode/blob/9d611d4dfd5a4a101b5201b8c9e21af97f06e7a7/extensions/typescript/src/typescriptMain.ts#L186
    vscode_1.languages.setLanguageConfiguration("scala", {
        indentationRules: {
            // ^(.*\*/)?\s*\}.*$
            decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
            // ^.*\{[^}"']*$
            increaseIndentPattern: /^.*\{[^}"']*$/
        },
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        onEnterRules: [
            {
                // e.g. /** | */
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                afterText: /^\s*\*\/$/,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent, appendText: " * " }
            },
            {
                // e.g. |
                beforeText: /^(\s*\|.*|.*"""\|)$/,
                action: { indentAction: vscode_1.IndentAction.Indent, appendText: "|" }
            },
            {
                // e.g. /** ...|
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: " * " }
            },
            {
                // e.g.  * ...| Javadoc style
                beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: "* " }
            },
            {
                // e.g.  * ...| Scaladoc style
                beforeText: /^(\t|(\ \ ))*\*(\ ([^\*]|\*(?!\/))*)?$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: "* " }
            },
            {
                // e.g.  */|
                beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                action: { indentAction: vscode_1.IndentAction.None, removeText: 1 }
            },
            {
                // e.g.  *-----*/|
                beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                action: { indentAction: vscode_1.IndentAction.None, removeText: 1 }
            }
        ]
    });
}
function dottyIdeArtifact() {
    if (vscode_1.workspace.workspaceFolders) {
        return path.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, ".dotty-ide-artifact");
    }
}
function detectLaunchConfigurationChanges() {
    vscode_1.workspace.onDidChangeConfiguration(e => {
        const promptRestartKeys = [
            "serverVersion",
            "serverProperties",
            "javaHome",
            "customRepositories"
        ];
        const shouldPromptRestart = promptRestartKeys.some(k => e.affectsConfiguration(`metals.${k}`));
        if (shouldPromptRestart) {
            vscode_1.window
                .showInformationMessage("Server launch configuration change detected. Reload the window for changes to take effect", "Reload Window", "Not now")
                .then(choice => {
                if (choice === "Reload Window") {
                    vscode_1.commands.executeCommand("workbench.action.reloadWindow");
                }
            });
        }
    });
}
function serverVersionInfo(config) {
    const computedVersion = config.get("serverVersion");
    const { defaultValue, workspaceFolderValue, workspaceValue } = config.inspect("serverVersion");
    const configurationTarget = (() => {
        if (workspaceFolderValue && workspaceFolderValue !== defaultValue) {
            return vscode_1.ConfigurationTarget.WorkspaceFolder;
        }
        if (workspaceValue && workspaceValue !== defaultValue) {
            return vscode_1.ConfigurationTarget.Workspace;
        }
        return vscode_1.ConfigurationTarget.Workspace;
    })();
    return {
        serverVersion: computedVersion,
        latestServerVersion: defaultValue,
        configurationTarget
    };
}
function checkServerVersion() {
    const config = vscode_1.workspace.getConfiguration("metals");
    const { serverVersion, latestServerVersion, configurationTarget } = serverVersionInfo(config);
    const isOutdated = (() => {
        try {
            return semver.lt(serverVersion, latestServerVersion);
        }
        catch (_e) {
            // serverVersion has an invalid format
            // ignore the exception here, and let subsequent checks handle this
            return false;
        }
    })();
    if (isOutdated) {
        const upgradeAction = `Upgrade to ${latestServerVersion} now`;
        vscode_1.window
            .showWarningMessage(`You are running an out-of-date version of Metals. Latest version is ${latestServerVersion}, but you have configured a custom server version ${serverVersion}`, upgradeAction, openSettingsAction, "Not now")
            .then(choice => {
            switch (choice) {
                case upgradeAction:
                    config.update("serverVersion", latestServerVersion, configurationTarget);
                    break;
                case openSettingsAction:
                    vscode_1.commands.executeCommand(openSettingsCommand);
                    break;
            }
        });
    }
}
function isSupportedLanguage(languageId) {
    switch (languageId) {
        case "scala":
        case "java":
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=extension.js.map