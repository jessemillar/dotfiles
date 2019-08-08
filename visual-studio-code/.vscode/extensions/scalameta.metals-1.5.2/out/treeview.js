"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
const tree_view_protocol_1 = require("./tree-view-protocol");
function startTreeView(client, out, context, viewIds) {
    const allProviders = new Map();
    const allViews = new Map();
    const expandedNodes = new Map();
    function expandedNode(viewId) {
        let isExpanded = expandedNodes.get(viewId);
        if (!isExpanded) {
            isExpanded = new Set();
            expandedNodes.set(viewId, isExpanded);
        }
        return isExpanded;
    }
    const disposables = viewIds.map(viewId => {
        const provider = new MetalsTreeDataProvider(client, out, viewId, allProviders, context);
        allProviders.set(viewId, provider);
        const view = vscode_1.window.createTreeView(viewId, {
            treeDataProvider: provider,
            showCollapseAll: true
        });
        allViews.set(viewId, view);
        // Notify the server about view visibility changes
        const onDidChangeVisibility = view.onDidChangeVisibility(e => {
            client.sendNotification(tree_view_protocol_1.MetalsTreeViewVisibilityDidChange.type, {
                viewId: viewId,
                visible: e.visible
            });
        });
        const onDidChangeExpandNode = view.onDidExpandElement(e => {
            expandedNode(viewId).add(e.element);
            client.sendNotification(tree_view_protocol_1.MetalsTreeViewNodeCollapseDidChange.type, {
                viewId: viewId,
                nodeUri: e.element,
                collapsed: false
            });
        });
        const onDidChangeCollapseNode = view.onDidCollapseElement(e => {
            expandedNode(viewId).delete(e.element);
            client.sendNotification(tree_view_protocol_1.MetalsTreeViewNodeCollapseDidChange.type, {
                viewId: viewId,
                nodeUri: e.element,
                collapsed: true
            });
        });
        return [
            view,
            onDidChangeVisibility,
            onDidChangeExpandNode,
            onDidChangeCollapseNode
        ];
    });
    // Update tree nodes on server notificiations
    client.onNotification(tree_view_protocol_1.MetalsTreeViewDidChange.type, params => {
        params.nodes.forEach(node => {
            const provider = allProviders.get(node.viewId);
            if (!provider)
                return;
            if (node.nodeUri) {
                provider.items.set(node.nodeUri, node);
            }
            if (node.nodeUri) {
                provider.didChange.fire(node.nodeUri);
            }
            else {
                provider.didChange.fire(undefined);
            }
        });
    });
    return {
        disposables: [].concat(...disposables),
        reveal(params) {
            function loop(view, i) {
                if (i < params.uriChain.length) {
                    const uri = params.uriChain[i];
                    const isExpanded = expandedNode(params.viewId).has(uri);
                    if (isExpanded) {
                        return Promise.resolve();
                    }
                    else {
                        // Recursively resolves the parent nodes before revealing the final child
                        // node at index 0.
                        return loop(view, i + 1).then(() => {
                            // NOTE(olafur) VS Code does not adjust the scrollbar to display
                            // the selected node if it's already visible. Looking at the
                            // internal VS Code implementation there seems to be a
                            // `relativeTop: number | undefined` option that could solve this
                            // problem but it's not possible for us to pass it in through the
                            // public API.
                            const isDestinationNode = i == 0;
                            return view.reveal(uri, {
                                expand: true,
                                select: isDestinationNode,
                                focus: isDestinationNode
                            });
                        });
                    }
                }
                else {
                    return Promise.resolve();
                }
            }
            if (params && params.viewId) {
                const view = allViews.get(params.viewId);
                if (view) {
                    loop(view, 0);
                }
                else {
                    out.appendLine(`unknown view: ${params.viewId}`);
                }
            }
        }
    };
}
exports.startTreeView = startTreeView;
/**
 * A tree view data provider with URI-formatted keys.
 *
 * The URI-formatted key maps to a `TreeViewNode` value which contains the
 * metadata about that tree view node such as label, tooltip and icon.
 *
 * This data provider is implemented as a proxy by forwarding request about
 * node children and parents to the Metals server.
 */
class MetalsTreeDataProvider {
    constructor(client, out, viewId, views, context) {
        this.client = client;
        this.out = out;
        this.viewId = viewId;
        this.views = views;
        this.context = context;
        this.didChange = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this.didChange.event;
        this.items = new Map();
        this.icons = new Map();
    }
    // Populate TreeItem based on cached children response from the server.
    getTreeItem(uri) {
        const item = this.items.get(uri);
        if (!item)
            return {};
        const result = {
            label: item.label,
            id: item.nodeUri,
            resourceUri: item.nodeUri && item.nodeUri.indexOf(".") > 0
                ? vscode_1.Uri.parse(item.nodeUri)
                : undefined,
            collapsibleState: toTreeItemCollapsibleState(item.collapseState),
            command: item.command,
            tooltip: item.tooltip,
            iconPath: item.icon ? this.iconPath(item.icon) : undefined
        };
        result.collapsibleState;
        return result;
    }
    // Forward get parent request to the server.
    getParent(uri) {
        return this.client
            .sendRequest(tree_view_protocol_1.MetalsTreeViewParent.type, {
            viewId: this.viewId,
            nodeUri: uri
        })
            .then(result => {
            if (result.uri) {
                const item = this.items.get(result.uri);
                if (item) {
                    item.collapseState;
                }
            }
            return result.uri;
        });
    }
    // Forward get children request to the server.
    getChildren(uri) {
        return this.client
            .sendRequest(tree_view_protocol_1.MetalsTreeViewChildren.type, {
            viewId: this.viewId,
            nodeUri: uri
        })
            .then(result => {
            result.nodes.forEach(n => {
                if (n.nodeUri) {
                    this.items.set(n.nodeUri, n);
                }
            });
            return result.nodes.map(n => n.nodeUri).filter(notEmpty);
        });
    }
    iconPath(icon) {
        const result = this.icons.get(icon);
        if (result)
            return result;
        else {
            const noTheme = this.joinIcon(icon);
            if (noTheme) {
                this.icons.set(icon, noTheme);
                return noTheme;
            }
            else {
                const themed = {
                    dark: this.joinIcon(icon + "-dark"),
                    light: this.joinIcon(icon + "-light")
                };
                if (themed.dark && themed.light) {
                    this.icons.set(icon, themed);
                    return themed;
                }
            }
        }
    }
    joinIcon(icon) {
        const file = path.join(this.context.extensionPath, "icons", icon + ".svg");
        if (fs.existsSync(file))
            return file;
        else
            return undefined;
    }
}
// NOTE(olafur): Copy-pasted from Stack Overflow, would be nice to move it elsewhere.
function notEmpty(value) {
    return value !== null && value !== undefined;
}
function toTreeItemCollapsibleState(s) {
    switch (s) {
        case "expanded":
            return vscode_1.TreeItemCollapsibleState.Expanded;
        case "collapsed":
            return vscode_1.TreeItemCollapsibleState.Collapsed;
        default:
            return vscode_1.TreeItemCollapsibleState.None;
    }
}
//# sourceMappingURL=treeview.js.map