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
const format_file_1 = require("./format-file");
class FormatFiles {
    static getInstance() {
        if (!this.instance) {
            this.instance = new FormatFiles();
        }
        return this.instance;
    }
    constructor() { }
    execute(files) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode_1.window.withProgress({
                cancellable: true,
                location: vscode_1.ProgressLocation.Notification,
                title: 'formatting documents',
            }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                const incrementProgressBy = (1 / files.length) * 100;
                try {
                    for (let index = 0; index < files.length; index++) {
                        const file = files[index];
                        if (token.isCancellationRequested) {
                            this.showModal(`Format Files operation cancelled. Processed ${index} files.`);
                            break;
                        }
                        progress.report({ message: file.path, increment: incrementProgressBy });
                        yield format_file_1.default(file);
                    }
                    if (!token.isCancellationRequested) {
                        this.showModal(`Format Files completed. Processed ${files.length} files.`);
                    }
                }
                catch (error) {
                    globals_1.Globals.logger.error(`An error occurred while running Format Files: ${error.message}`, true);
                }
            }));
        });
    }
    showModal(message) {
        return __awaiter(this, void 0, void 0, function* () {
            globals_1.Globals.logger.info(message);
            yield vscode_1.window.showInformationMessage(message, { modal: true });
        });
    }
}
exports.FormatFiles = FormatFiles;
//# sourceMappingURL=format-files.js.map