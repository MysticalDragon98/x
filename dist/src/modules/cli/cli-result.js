"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIResult = void 0;
class CLIResult {
    success;
    message;
    data;
    error;
    constructor(options) {
        this.success = options.success;
        this.message = options.message;
        this.data = options.data;
        this.error = options.error;
    }
}
exports.CLIResult = CLIResult;
