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
const globals_1 = require("../../globals");
const file_1 = require("../queries/file");
function formatFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        globals_1.Globals.logger.info(`formatting ${file.path}`);
        const doc = yield file_1.default(file.path);
        if (doc) {
            yield vscode_1.window.showTextDocument(doc, { preview: false, viewColumn: vscode_1.ViewColumn.One });
            yield vscode_1.commands.executeCommand('editor.action.formatDocument');
            yield vscode_1.commands.executeCommand('workbench.action.files.save');
            yield vscode_1.commands.executeCommand('workbench.action.closeActiveEditor');
        }
    });
}
exports.default = formatFile;
//# sourceMappingURL=format-file.js.map