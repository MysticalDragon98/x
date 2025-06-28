"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderCLI = void 0;
const path_1 = require("path");
const cli_1 = require("./cli");
const promises_1 = require("fs/promises");
const named_error_1 = require("../errors/named-error");
const cli_result_1 = require("./cli-result");
const file_cli_1 = require("./file-cli");
class FolderCLI extends cli_1.CLI {
    folder;
    constructor(folder) {
        super();
        this.folder = folder;
    }
    #path(path) {
        return (0, path_1.join)(this.folder, path);
    }
    async exec([file, ...args]) {
        const path = this.#path(file);
        try {
            var pathStats = await (0, promises_1.stat)(path);
        }
        catch (exc) {
            return new cli_result_1.CLIResult({
                success: false,
                message: exc.message,
                error: new named_error_1.NamedError(exc.code, exc.message)
            });
        }
        if (pathStats.isDirectory()) {
            const cli = new FolderCLI(path);
            return await cli.exec(args);
        }
        if (pathStats.isFile()) {
            const cli = new file_cli_1.FileCLI(path);
            try {
                return await cli.exec(args);
            }
            catch (exc) {
                return new cli_result_1.CLIResult({
                    success: false,
                    message: exc.message,
                    error: new named_error_1.NamedError(exc.code || exc.name, exc.message)
                });
            }
        }
        return new cli_result_1.CLIResult({
            success: false,
            message: `File ${path} is not a file or directory`,
            error: new named_error_1.NamedError("FileNotFound", `File ${path} is not a file or directory`)
        });
    }
}
exports.FolderCLI = FolderCLI;
