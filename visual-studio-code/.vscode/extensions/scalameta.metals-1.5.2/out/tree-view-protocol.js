"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
"use strict";
var MetalsTreeViewChildren;
(function (MetalsTreeViewChildren) {
    MetalsTreeViewChildren.type = new vscode_jsonrpc_1.RequestType("metals/treeViewChildren");
})(MetalsTreeViewChildren = exports.MetalsTreeViewChildren || (exports.MetalsTreeViewChildren = {}));
var MetalsTreeViewDidChange;
(function (MetalsTreeViewDidChange) {
    MetalsTreeViewDidChange.type = new vscode_jsonrpc_1.NotificationType("metals/treeViewDidChange");
})(MetalsTreeViewDidChange = exports.MetalsTreeViewDidChange || (exports.MetalsTreeViewDidChange = {}));
var MetalsTreeViewParent;
(function (MetalsTreeViewParent) {
    MetalsTreeViewParent.type = new vscode_jsonrpc_1.RequestType("metals/treeViewParent");
})(MetalsTreeViewParent = exports.MetalsTreeViewParent || (exports.MetalsTreeViewParent = {}));
var MetalsTreeViewVisibilityDidChange;
(function (MetalsTreeViewVisibilityDidChange) {
    MetalsTreeViewVisibilityDidChange.type = new vscode_jsonrpc_1.NotificationType("metals/treeViewVisibilityDidChange");
})(MetalsTreeViewVisibilityDidChange = exports.MetalsTreeViewVisibilityDidChange || (exports.MetalsTreeViewVisibilityDidChange = {}));
var MetalsTreeViewNodeCollapseDidChange;
(function (MetalsTreeViewNodeCollapseDidChange) {
    MetalsTreeViewNodeCollapseDidChange.type = new vscode_jsonrpc_1.NotificationType("metals/treeViewNodeCollapseDidChange");
})(MetalsTreeViewNodeCollapseDidChange = exports.MetalsTreeViewNodeCollapseDidChange || (exports.MetalsTreeViewNodeCollapseDidChange = {}));
var MetalsTreeViewReveal;
(function (MetalsTreeViewReveal) {
    MetalsTreeViewReveal.type = new vscode_jsonrpc_1.RequestType("metals/treeViewReveal");
})(MetalsTreeViewReveal = exports.MetalsTreeViewReveal || (exports.MetalsTreeViewReveal = {}));
//# sourceMappingURL=tree-view-protocol.js.map