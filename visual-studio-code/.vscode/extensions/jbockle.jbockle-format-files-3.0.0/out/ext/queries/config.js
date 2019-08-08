"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class Config {
    get configuration() {
        return vscode_1.workspace.getConfiguration();
    }
    get extensionsToInclude() {
        const extensions = this.configuration.get('formatFiles.extensionsToInclude');
        return extensions === '*' ? extensions : `{${extensions}}`;
    }
    get excludePattern() {
        return this.configuration.get('formatFiles.excludePattern');
    }
    get inheritWorkspaceExcludedFiles() {
        return this.configuration.get('formatFiles.inheritWorkspaceExcludedFiles');
    }
    get useGitIgnores() {
        return this.configuration.get('formatFiles.useGitIgnores');
    }
    get workspaceExcludes() {
        const excludes = this.configuration.get('files.exclude');
        return Object.keys(excludes)
            .filter((glob) => excludes[glob])
            .map((glob) => glob);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Config();
        }
        return this.instance;
    }
    constructor() { }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map