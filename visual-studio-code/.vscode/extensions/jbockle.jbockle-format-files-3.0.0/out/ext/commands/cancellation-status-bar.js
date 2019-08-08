"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("../../constants");
class CancellationStatusBar {
    show() {
        if (this.statusBar) {
            this.hide();
        }
        this.statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
        this.statusBar.text = '$(primitive-square) Cancel Format Files';
        this.statusBar.command = constants_1.Constants.commands.cancelFormatting;
        this.statusBar.color = 'statusBar.foreground';
        this.statusBar.show();
    }
    hide() {
        if (this.statusBar) {
            this.statusBar.hide();
            this.statusBar.dispose();
            this.statusBar = undefined;
        }
    }
}
exports.CancellationStatusBar = CancellationStatusBar;
//# sourceMappingURL=cancellation-status-bar.js.map