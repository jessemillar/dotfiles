"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const globals_1 = require("../../globals");
class WorkspaceValidator {
    static getInstance() {
        if (!this.instance) {
            this.instance = new WorkspaceValidator();
        }
        return this.instance;
    }
    constructor() { }
    validate() {
        globals_1.Globals.logger.info(`Validating workspace`);
        if (!this.isInWorkspace()) {
            const message = 'Format Files requires an active workspace, please open a workspace and try again';
            globals_1.Globals.logger.error(message, true);
        }
        globals_1.Globals.logger.info(`Workspace is valid!`);
    }
    isInWorkspace() {
        return !!vscode_1.workspace.workspaceFolders;
    }
}
exports.WorkspaceValidator = WorkspaceValidator;
//# sourceMappingURL=workspace-validator.js.map