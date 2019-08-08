"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locate_java_home_1 = require("locate-java-home");
const vscode_1 = require("vscode");
function getJavaHome() {
    const userJavaHome = vscode_1.workspace.getConfiguration("metals").get("javaHome");
    if (typeof userJavaHome === "string" && userJavaHome.trim() !== "") {
        return Promise.resolve(userJavaHome);
    }
    else {
        return new Promise((resolve, reject) => {
            locate_java_home_1.default({ version: "1.8" }, (err, javaHomes) => {
                if (err) {
                    reject(err);
                }
                else if (!javaHomes || javaHomes.length === 0) {
                    reject(new Error("No suitable Java version found"));
                }
                else {
                    // Sort by reverse security number so the highest number comes first.
                    javaHomes.sort((a, b) => {
                        return b.security - a.security;
                    });
                    const jdkHome = javaHomes.find(j => j.isJDK);
                    if (jdkHome) {
                        resolve(jdkHome.path);
                    }
                    else {
                        resolve(javaHomes[0].path);
                    }
                }
            });
        });
    }
}
exports.getJavaHome = getJavaHome;
//# sourceMappingURL=getJavaHome.js.map