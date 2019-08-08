"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["_info"] = 1] = "_info";
    LogLevel[LogLevel["_warn"] = 2] = "_warn";
    LogLevel[LogLevel["error"] = 3] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger {
    constructor(level) {
        this.level = level;
        this.output = vscode_1.window.createOutputChannel('Format Files');
    }
    info(message) {
        callLog(LogLevel._info, message, this);
    }
    warn(message) {
        callLog(LogLevel._warn, message, this);
    }
    error(message, raiseException = false) {
        callLog(LogLevel.error, message, this);
        if (raiseException) {
            throw new Error(message);
        }
    }
}
exports.Logger = Logger;
function getLevelPrefix(level) {
    const levelName = LogLevel[level];
    const timestamp = getTimestamp();
    return `[${levelName}:${timestamp}]`;
}
function callLog(level, message, logger) {
    if (shouldLog(level, logger.level)) {
        const prefix = getLevelPrefix(level);
        logger.output.appendLine(`${prefix} ${message}`);
    }
}
function shouldLog(targetlevel, level) {
    return targetlevel.valueOf() >= level.valueOf();
}
function getTimestamp() {
    return new Date().toTimeString().split(' ')[0];
}
//# sourceMappingURL=logger.js.map