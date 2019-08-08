"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
"use strict";
var MetalsSlowTask;
(function (MetalsSlowTask) {
    MetalsSlowTask.type = new vscode_jsonrpc_1.RequestType("metals/slowTask");
})(MetalsSlowTask = exports.MetalsSlowTask || (exports.MetalsSlowTask = {}));
var ExecuteClientCommand;
(function (ExecuteClientCommand) {
    ExecuteClientCommand.type = new vscode_jsonrpc_1.NotificationType("metals/executeClientCommand");
})(ExecuteClientCommand = exports.ExecuteClientCommand || (exports.ExecuteClientCommand = {}));
var MetalsStatus;
(function (MetalsStatus) {
    MetalsStatus.type = new vscode_jsonrpc_1.NotificationType("metals/status");
})(MetalsStatus = exports.MetalsStatus || (exports.MetalsStatus = {}));
var MetalsDidFocus;
(function (MetalsDidFocus) {
    MetalsDidFocus.type = new vscode_jsonrpc_1.NotificationType("metals/didFocusTextDocument");
})(MetalsDidFocus = exports.MetalsDidFocus || (exports.MetalsDidFocus = {}));
var MetalsInputBox;
(function (MetalsInputBox) {
    MetalsInputBox.type = new vscode_jsonrpc_1.RequestType("metals/inputBox");
})(MetalsInputBox = exports.MetalsInputBox || (exports.MetalsInputBox = {}));
var MetalsWindowStateDidChange;
(function (MetalsWindowStateDidChange) {
    MetalsWindowStateDidChange.type = new vscode_jsonrpc_1.NotificationType("metals/windowStateDidChange");
})(MetalsWindowStateDidChange = exports.MetalsWindowStateDidChange || (exports.MetalsWindowStateDidChange = {}));
//# sourceMappingURL=protocol.js.map