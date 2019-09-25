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
const child_process = require("child_process");
class ChildProcess {
    static spawn(executable, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let output = "";
                const handle = child_process.spawn(executable, args);
                handle.stdout.on("data", (data) => {
                    output += data;
                });
                handle.stderr.on("data", (data) => {
                    output += data;
                });
                handle.on("close", (code) => {
                    if (code === "0") {
                        resolve();
                    }
                    else {
                        reject({ code: code, message: output });
                    }
                });
            });
        });
    }
}
exports.ChildProcess = ChildProcess;
//# sourceMappingURL=child-process.js.map