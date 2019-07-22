'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode");
const proc = require("child_process");
const os = require("os");
const path = require("path");
const fs = require("fs");
const Love2DCompletionProvider_1 = require("./Love2DCompletionProvider");
const Text_1 = require("./Text");
const LUA_MODE = { language: 'lua', scheme: 'file' };
//Any processes we have started from this plugin
//are mapped into this hash table keyed by the proc Id
let loveProcesses = {};
let debugMode = false;
let relSearchDir = ".";
let loveExe = "";
let runLoveFlag = false;
let runOnSave = false;
let outChannel = null;
//True when config has been loaded for the 1st time
let firstConfigLoaded = false;
let love2d_url = "https://love2d.org/wiki/";
function kill_process(pid) {
    //This works for windows when we create a detached process ...but I don't like it
    //TODO: revisit
    if (os.platform() === 'win32') {
        proc.exec('taskkill /pid ' + pid + ' /T /F');
    }
    else if (loveProcesses.hasOwnProperty(pid)) {
        loveProcesses[pid].kill();
    }
    //Remove it from our list of spawned processes
    if (loveProcesses[pid] != null) {
        loveProcesses[pid].removeAllListeners();
        delete loveProcesses[pid];
    }
}
//Load up our config
//
function load_config() {
    //Get settings for our plugin
    loveExe = vscode.workspace.getConfiguration('pixelbyte.love2d').get('path').toString();
    if (os.platform() == 'darwin' && loveExe.startsWith("C:\\")) {
        loveExe = "/Applications/love.app/Contents/MacOS/love";
    }
    else if (os.platform() == 'linux' && loveExe.startsWith("C:\\")) {
        loveExe = "love";
    }
    debugMode = vscode.workspace.getConfiguration('pixelbyte.love2d').get('debug');
    relSearchDir = vscode.workspace.getConfiguration('pixelbyte.love2d').get('srcDir').toString();
    if (firstConfigLoaded) {
        outChannel.appendLine("Reloading configuration (toggled states will be reset).");
        outChannel.show(false);
    }
    firstConfigLoaded = true;
}
function run_love() {
    runLoveFlag = false;
    let searchPath = path.join(vscode.workspace.rootPath, relSearchDir);
    //Is there a main.lua file in the project?
    let args = debugMode ? ["--console", searchPath] : [searchPath];
    let mainLuaIndex = -1;
    if (searchPath == undefined)
        return;
    if (!fs.existsSync(searchPath)) {
        outChannel.appendLine("The specified main.lua search path: '" + searchPath + "' does not exist.");
        outChannel.appendLine("The setting pixelbyte.love2d.srcDir is currently set to: '" + relSearchDir + "'");
        outChannel.show(true);
    }
    else {
        let files = fs.readdirSync(searchPath);
        mainLuaIndex = files.findIndex((name, index, arr) => {
            return (path.basename(name.toLowerCase()) == "main.lua");
        });
    }
    if (mainLuaIndex < 0) {
        //well then ... check if the currently open tab is main.lua
        var openTabFilePath = vscode.window.activeTextEditor.document.fileName;
        if (path.basename(openTabFilePath.toLowerCase()) != "main.lua") {
            vscode.window.showErrorMessage("Unable to find main.lua. This is not a Love2D project.");
            return;
        }
        else {
            searchPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
            args = debugMode ? ["--console", searchPath] : [searchPath];
        }
    }
    // love2dOut.appendLine(cmd);
    //1st, kill any love2d processes we have spun up
    for (var key in loveProcesses) {
        var pid = Number(key);
        if (!isNaN(pid)) {
            kill_process(Number(pid));
        }
    }
    let loveProc = null;
    if (fs.existsSync(loveExe)) {
        if (fs.lstatSync(loveExe).isDirectory()) {
            vscode.window.showErrorMessage("The setting specified in pixelbyte.love2d.path must be an executable file, not a directory. Check your settings.");
            return;
        }
    }
    else {
        vscode.window.showErrorMessage("The love executable path specified in pixelbyte.love2d.path does not exist. Check your settings.");
        return;
    }
    //Could use proc.spawn for the non-debug mode but exeFile() is supposed to be faster
    if (!debugMode || os.platform() != 'win32') {
        loveProc = proc.spawn(loveExe, args, { shell: debugMode, cwd: vscode.workspace.rootPath, detached: debugMode, stdio: 'pipe' });
        loveProc.unref();
        // loveProc.stdout.on('data', data => {
        //     outChannel.append(data.toString());
        //     console.log(data.toString());
        // });
        // loveProc.stderr.on('data', data => {
        //     outChannel.append(data.toString());
        //     console.log(data.toString());
        // });
        // outChannel.appendLine("PID: " + loveProc.pid);
        // outChannel.show(true);
    }
    else {
        //TODO: Should be able to read stdout and stderr from a spawned process and display it in VSCode but 
        //it is not working for some reason. spawn with shell = true and set attached = true to get the cmd window to show up
        // outChannel.appendLine(loveExe);
        //Weird. If there are spaces in the love2d path i need to do this but using execFile above, i don't
        loveProc = proc.spawn('"'.concat(loveExe).concat('"'), args, { shell: debugMode, cwd: vscode.workspace.rootPath, detached: debugMode, stdio: 'pipe' });
        loveProc.unref();
        // loveProc.stdout.on('data', data => {
        //     outChannel.append(data.toString());
        //     console.log(data.toString());
        // });
        // loveProc.stderr.on('data', data => {
        //     outChannel.append(data.toString());
        //     console.log(data.toString());
        // });
    }
    //Add the proc to our list
    if (loveProc != null)
        loveProcesses[loveProc.pid] = loveProc;
    //When the love2d process exits, remove it from our list
    loveProc.on('exit', (pid, sig) => {
        if (loveProcesses[pid] != null) {
            loveProcesses[pid].removeAllListeners();
            delete loveProcesses[pid];
        }
    });
}
// this method is called when your extension is activated
function activate(context) {
    outChannel = vscode.window.createOutputChannel("Pixelbyte.Love2D");
    // love2dOut.show(true);
    load_config();
    //register our Love2D completion provider
    vscode.languages.registerCompletionItemProvider(LUA_MODE, new Love2DCompletionProvider_1.default(), ".", "(");
    //Anytime the VSCode configuration changes, reload our config data in case it was changed
    vscode.workspace.onDidChangeConfiguration(load_config);
    //Hook the document saved event
    vscode.workspace.onDidSaveTextDocument((doc) => {
        if (!runOnSave)
            return;
        //TOOD: Could use vscode.workspace.textDocuments[i].isDirty
        //to determine if we should run Love2D, but that would mean
        //ALL modified files would have to be saved before Love2D would run
        //not sure what the best solution is here. For now we just delay 250ms
        //in case the user chose the SaveAll option from the file menu
        if (!runLoveFlag) {
            runLoveFlag = true;
            //wait 250ms before running Love2D
            setTimeout(run_love, 250);
        }
    });
    // Here we register our commands with corresponding functions to execute them
    let disposable = vscode.commands.registerCommand('pixelbyte.love2d.run', run_love);
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('pixelbyte.love2d.runOnsave.enable', function () {
        runOnSave = true;
        outChannel.appendLine("runOnSave Enabled");
        outChannel.show(true);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('pixelbyte.love2d.runOnsave.disable', function () {
        runOnSave = false;
        outChannel.appendLine("runOnSave Disabled");
        outChannel.show(true);
    });
    disposable = vscode.commands.registerCommand('pixelbyte.love2d.runOnsave.toggle', function () {
        runOnSave = !runOnSave;
        outChannel.appendLine("runOnSave " + (runOnSave ? "Enabled" : "Disabled"));
        outChannel.show(true);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('pixelbyte.love2d.debug.toggle', function () {
        debugMode = !debugMode;
        outChannel.appendLine("debugMode " + (debugMode ? "Enabled" : "Disabled"));
        outChannel.show(true);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('pixelbyte.love2d.help', function () {
        let identifier = Text_1.default.get_identifier_under_cursor();
        //see if it looks like a love function if so, try and open a manpage for that function
        if (identifier.startsWith("love.")) {
            outChannel.append("Open web help for: " + identifier);
            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(love2d_url + identifier));
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    for (var key in loveProcesses) {
        var pid = Number(key);
        if (isNaN(pid)) {
            outChannel.appendLine("Unable to convert pid to a number: " + pid);
            outChannel.show(true);
        }
        else {
            kill_process(Number(key));
        }
    }
    if (outChannel != null) {
        outChannel.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map