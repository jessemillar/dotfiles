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
class RequestGlob {
    static execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const glob = yield this.getInstance().requestForGlob();
            this.getInstance().shouldAbort(glob);
            yield this.getInstance().confirmGlob(glob);
            return glob;
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RequestGlob();
        }
        return this.instance;
    }
    constructor() { }
    requestForGlob() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vscode_1.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: 'Enter glob pattern',
                prompt: 'Format Files matching glob pattern - press esc to cancel',
            });
        });
    }
    shouldAbort(glob) {
        if (glob === undefined) {
            globals_1.Globals.logger.error('Operation Aborted', true);
        }
        else if (!glob.trim()) {
            globals_1.Globals.logger.error('Operation Aborted: Glob pattern empty', true);
        }
    }
    confirmGlob(glob) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode_1.window.showQuickPick(['Yes', 'No'], {
                ignoreFocusOut: true,
                placeHolder: `You entered '${glob}', is that correct?`,
            });
            if (result !== 'Yes') {
                globals_1.Globals.logger.error('Operation Aborted', true);
            }
        });
    }
}
exports.RequestGlob = RequestGlob;
//# sourceMappingURL=request-glob.js.map