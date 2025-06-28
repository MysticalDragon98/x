"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamedError = void 0;
class NamedError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = code;
    }
}
exports.NamedError = NamedError;
