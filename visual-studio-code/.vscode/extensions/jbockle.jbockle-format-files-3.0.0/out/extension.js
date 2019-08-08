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
const vscode_1 = require("vscode");
const format_files_1 = require("./ext/commands/format-files");
const request_glob_1 = require("./ext/commands/request-glob");
const should_start_1 = require("./ext/commands/should-start");
const files_1 = require("./ext/queries/files");
const globals_1 = require("./globals");
function activate(context) {
    globals_1.Globals.logger.info('activating');
    registerCommand(context, globals_1.Globals.formatFiles, formatFiles);
    registerCommand(context, globals_1.Globals.formatFilesFromGlob, fromGlob);
    globals_1.Globals.logger.info('activated');
}
exports.activate = activate;
function deactivate() {
    globals_1.Globals.logger.info('Format Files deactivated');
}
exports.deactivate = deactivate;
function registerCommand(context, command, callback) {
    globals_1.Globals.logger.info(`registering command ${command}`);
    context.subscriptions
        .push(vscode_1.commands.registerCommand(command, callback));
}
function formatFiles(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        globals_1.Globals.logger.info(`Starting Format Files - Workspace`);
        globals_1.Globals.workspaceValidator.validate();
        const files = yield files_1.Files.getInstance().getFiles(folder);
        yield should_start_1.default(files.length, `Format Files: Start formatting ${files.length} workspace files?`);
        yield format_files_1.FormatFiles.getInstance().execute(files);
        globals_1.Globals.logger.info(`Format Files completed`);
    });
}
function fromGlob() {
    return __awaiter(this, void 0, void 0, function* () {
        globals_1.Globals.logger.info(`Starting Format Files - By Glob Pattern`);
        globals_1.Globals.workspaceValidator.validate();
        const glob = yield request_glob_1.RequestGlob.execute();
        const useDefaultExcludes = yield files_1.Files.getInstance().shouldUseDefaultExcludes();
        const files = yield files_1.Files.getInstance().getFilesByGlob(glob, useDefaultExcludes);
        yield should_start_1.default(files.length, `Format Files: Start formatting ${files.length} workspace files using glob '${glob}'?`);
        yield format_files_1.FormatFiles.getInstance().execute(files);
        globals_1.Globals.logger.info(`Format Files completed`);
    });
}
//# sourceMappingURL=extension.js.map