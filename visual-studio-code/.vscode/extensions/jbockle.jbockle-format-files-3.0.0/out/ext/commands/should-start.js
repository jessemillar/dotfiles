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
function shouldStartFormatting(length, prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield vscode_1.window.showQuickPick([`Do it!`, `Nevermind`], {
            ignoreFocusOut: true,
            placeHolder: `${prompt} (check 'Format Files' output for list of files)`,
        });
        if (!result || result === 'Nevermind') {
            globals_1.Globals.logger.error(`Operation Aborted`, true);
        }
    });
}
exports.default = shouldStartFormatting;
//# sourceMappingURL=should-start.js.map