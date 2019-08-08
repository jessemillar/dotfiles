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
const file_1 = require("./file");
function getGitIgnoreGlobs() {
    return __awaiter(this, void 0, void 0, function* () {
        const gitignoreUri = yield vscode_1.window.showOpenDialog({
            canSelectMany: false,
            filters: { 'git ignore': ['gitignore'] },
        });
        if (gitignoreUri) {
            const doc = yield file_1.default(gitignoreUri[0].path);
            return parseGitIgnore(doc);
        }
        return [];
    });
}
exports.default = getGitIgnoreGlobs;
function getEndOfLineStyle(doc) {
    let eol;
    switch (doc.eol) {
        case vscode_1.EndOfLine.CRLF:
            eol = '\r\n';
            break;
        case vscode_1.EndOfLine.LF:
            eol = '\n';
    }
    return eol;
}
function parseGitIgnore(doc) {
    const eol = getEndOfLineStyle(doc);
    return doc.getText()
        .split(eol)
        .filter((line) => !!line && line[0] !== '#')
        // '!' in .gitignore and glob mean opposite things so we need to swap it.
        // Return pairt [ignoreFlag, pattern], we'll concatenate it later.
        .map((line) => line[0] === '!' ? ['', line.substring(1)] : ['!', line])
        // Filter out hidden files/directories (i.e. starting with a dot).
        .filter((patternPair) => {
        const pattern = patternPair[1];
        return pattern.indexOf('/.') === -1 && pattern.indexOf('.') !== 0;
    })
        // Patterns not starting with '/' are in fact "starting" with '**/'. Since that would
        // catch a lot of files, restrict it to directories we check.
        // Patterns starting with '/' are relative to the project directory and glob would
        // treat them as relative to the OS root directory so strip the slash then.
        .map((patternPair) => {
        const pattern = patternPair[1];
        if (pattern[0] !== '/') {
            return [patternPair[0], `**/${pattern}`];
        }
        return [patternPair[0], pattern.substring(1)];
    })
        // We don't know whether a pattern points to a directory or a file and we need files.
        // Therefore, include both `pattern` and `pattern/**` for every pattern in the array.
        .reduce((result, patternPair) => {
        const pattern = patternPair.join('');
        result.push(pattern);
        result.push(`${pattern}/**`);
        return result;
    }, []);
}
//# sourceMappingURL=git-ignore-globs.js.map