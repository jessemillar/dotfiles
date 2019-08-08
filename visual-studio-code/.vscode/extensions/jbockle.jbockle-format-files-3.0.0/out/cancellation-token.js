"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CancellationToken {
    constructor() {
        this.cancelled = false;
    }
    reset() {
        this.cancelled = false;
    }
    cancel() {
        this.cancelled = true;
    }
}
exports.CancellationToken = CancellationToken;
//# sourceMappingURL=cancellation-token.js.map