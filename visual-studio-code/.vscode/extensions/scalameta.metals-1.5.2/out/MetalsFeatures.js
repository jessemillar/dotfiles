"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetalsFeatures {
    fillInitializeParams(params) {
        if (!params.capabilities.experimental) {
            params.capabilities.experimental = {};
        }
        params.capabilities.experimental.treeViewProvider = true;
    }
    fillClientCapabilities() { }
    initialize(capabilities) {
        if (capabilities.experimental) {
            this.treeViewProvider = capabilities.experimental.treeViewProvider;
        }
    }
}
exports.MetalsFeatures = MetalsFeatures;
//# sourceMappingURL=MetalsFeatures.js.map