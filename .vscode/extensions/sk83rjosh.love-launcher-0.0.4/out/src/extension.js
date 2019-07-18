'use strict';
var vscode = require('vscode');
var child_process = require('child_process');
var output;
function log(message, useOutput) {
    if (useOutput) {
        output.appendLine(message);
    }
    else {
        console.log(output.name + ": " + message);
    }
}
function activate(context) {
    output = vscode.window.createOutputChannel("LÖVE Launcher");
    var disposable = vscode.commands.registerCommand('lovelauncher.launch', function () {
        var config = vscode.workspace.getConfiguration('lovelauncher');
        var useOutput = config.get('useOutput');
        var path = config.get('path');
        var args = config.get('args');
        var cwd = vscode.workspace.rootPath;
        var process = child_process.spawn("" + path, [".", args], { cwd: cwd });
        log("Spawning process: \"" + path + "\" \"" + cwd + "\" " + args, useOutput);
        if (useOutput) {
            process.stderr.on('data', function (data) {
                output.append(data.toString());
            });
            process.stdout.on('data', function (data) {
                output.append(data.toString());
            });
        }
        process.on('error', function (err) {
            log("Could not spawn process: " + err, useOutput);
        });
        process.on('close', function (code) {
            log("Process exited with code " + code, useOutput);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
    output.hide();
    output.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map