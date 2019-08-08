"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workspace_validator_1 = require("./ext/commands/workspace-validator");
const logger_1 = require("./logger");
class Globals {
}
Globals.logger = new logger_1.Logger(logger_1.LogLevel._info);
Globals.workspaceValidator = workspace_validator_1.WorkspaceValidator.getInstance();
Globals.formatFiles = 'formatFiles.start.workspace';
Globals.formatFilesFromGlob = 'formatFiles.start.fromGlob';
Globals.skipExcludes = false;
exports.Globals = Globals;
//# sourceMappingURL=globals.js.map