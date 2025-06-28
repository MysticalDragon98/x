"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCLI = void 0;
const named_error_1 = require("../errors/named-error");
const cli_1 = require("./cli");
const cli_result_1 = require("./cli-result");
class FileCLI extends cli_1.CLI {
    file;
    constructor(file) {
        super();
        this.file = file;
    }
    async exec(args) {
        try {
            var file = await Promise.resolve(`${this.file}`).then(s => __importStar(require(s)));
        }
        catch (exc) {
            return new cli_result_1.CLIResult({
                success: false,
                message: exc.message,
                error: new named_error_1.NamedError(exc.code, exc.message)
            });
        }
        if (typeof file.default !== "function") {
            return new cli_result_1.CLIResult({
                success: false,
                message: `File ${this.file} does not export a function`,
                error: new named_error_1.NamedError("FileNotExported", `File ${this.file} does not export a function`)
            });
        }
        const result = await file.default(args);
        if (result instanceof cli_result_1.CLIResult) {
            return result;
        }
        throw new Error("File did not return a CLIResult");
    }
}
exports.FileCLI = FileCLI;
