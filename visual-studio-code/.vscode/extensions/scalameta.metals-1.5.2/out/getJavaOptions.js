"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
const shell_quote_1 = require("shell-quote");
function jvmOpts(outputChannel) {
    if (vscode_1.workspace.workspaceFolders) {
        const jvmoptsPath = path.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, ".jvmopts");
        if (fs.existsSync(jvmoptsPath)) {
            outputChannel.appendLine("Using JVM options set in " + jvmoptsPath);
            const raw = fs.readFileSync(jvmoptsPath, "utf8");
            return raw.match(/[^\r\n]+/g) || [];
        }
    }
    return [];
}
function javaOpts(outputChannel) {
    function expandVariable(variable) {
        if (variable) {
            outputChannel.appendLine("Using JAVA options set in JAVA_OPTS");
            return shell_quote_1.parse(variable).filter((entry) => {
                if (typeof entry === "string") {
                    return true;
                }
                else {
                    outputChannel.appendLine(`Ignoring unexpected JAVA_OPTS token: ${entry}`);
                    return false;
                }
            });
        }
        else {
            return [];
        }
    }
    const javaOpts = expandVariable(process.env.JAVA_OPTS);
    const javaFlags = expandVariable(process.env.JAVA_FLAGS);
    return javaOpts.concat(javaFlags);
}
function getJavaOptions(outputChannel) {
    const combinedOptions = [
        ...javaOpts(outputChannel),
        ...jvmOpts(outputChannel)
    ];
    const options = combinedOptions.reduce((options, line) => {
        if (line.startsWith("-") &&
            // We care most about enabling options like HTTP proxy settings.
            // We don't include memory options because Metals does not have the same
            // memory requirements as for example the sbt build.
            !line.startsWith("-Xms") &&
            !line.startsWith("-Xmx") &&
            !line.startsWith("-Xss")) {
            return [...options, line];
        }
        return options;
    }, []);
    return options;
}
exports.getJavaOptions = getJavaOptions;
//# sourceMappingURL=getJavaOptions.js.map