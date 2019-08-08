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
const config_1 = require("./config");
class Files {
    constructor() {
        this.config = config_1.Config.getInstance();
    }
    get root() {
        return vscode_1.workspace.workspaceFolders[0].uri.path;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Files();
        }
        return this.instance;
    }
    shouldUseDefaultExcludes() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode_1.window.showQuickPick([
                `Yes - Use 'formatFiles' settings in vscode`,
                `No - Don't use excludes`,
            ], { placeHolder: 'Use default excludes?', ignoreFocusOut: true });
            if (!result) {
                globals_1.Globals.logger.error('Operation Aborted', true);
            }
            return result.startsWith('Yes');
        });
    }
    getFiles(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            const includeGlob = yield this.getIncludeGlob(folder);
            const excludeGlob = yield this.getExcludeGlob();
            return yield (this.findFiles(includeGlob, excludeGlob));
        });
    }
    getFilesByGlob(glob, defaultExcludes) {
        return __awaiter(this, void 0, void 0, function* () {
            const excludeGlob = defaultExcludes ? yield this.getExcludeGlob() : '';
            return yield (this.findFiles(glob, excludeGlob));
        });
    }
    findFiles(includeGlob, excludeGlob) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield vscode_1.workspace.findFiles(includeGlob, excludeGlob);
            globals_1.Globals.logger.info(`Found ${files.length}`);
            files.forEach((file) => globals_1.Globals.logger.info(`\t${file.path}`));
            return files;
        });
    }
    getIncludeGlob(folder) {
        globals_1.Globals.logger.info(`creating include glob`);
        if (folder) {
            globals_1.Globals.logger.info(`\t\tfolder specified: ${folder.path}`);
            const path = folder.path.replace(`${this.root}/`, '');
            return `${path}/**/*.${this.config.extensionsToInclude}`;
        }
        const glob = `**/*.${this.config.extensionsToInclude}`;
        globals_1.Globals.logger.info(`\t\t${glob}`);
        return glob;
    }
    getExcludeGlob() {
        return __awaiter(this, void 0, void 0, function* () {
            globals_1.Globals.logger.info(`creating exclude glob`);
            const exclusions = this.config.excludePattern
                .split(',')
                .map((exc) => exc.trim());
            if (this.config.inheritWorkspaceExcludedFiles) {
                globals_1.Globals.logger.info(`\t\tincluding files.exclude globs`);
                this.config.workspaceExcludes.forEach((exc) => exclusions.push(exc));
            }
            // if (this.config.useGitIgnores) {
            //     (await getGitIgnoreGlobs()).forEach((exc) => exclusions.push(exc));
            // }
            const glob = `{${exclusions.filter((exc) => !!exc).join(',')}}`;
            globals_1.Globals.logger.info(`\t\t\t${glob}`);
            return glob;
        });
    }
}
exports.Files = Files;
//# sourceMappingURL=files.js.map