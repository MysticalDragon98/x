"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const folder_cli_1 = require("./src/modules/cli/folder-cli");
class XCli {
    folder;
    cli;
    constructor(folder) {
        this.folder = folder;
        this.cli = new folder_cli_1.FolderCLI(folder);
    }
    async exec(args) {
        const result = await this.cli.exec(args);
        console.log(result);
    }
}
async function main() {
    const args = process.argv.slice(2);
    const folder = (0, path_1.join)(__dirname, "src", "commands");
    const cli = new XCli(folder);
    await cli.exec(args);
}
main();
process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception:", err);
});
