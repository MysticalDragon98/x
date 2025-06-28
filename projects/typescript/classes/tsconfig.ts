import { JSONFile } from "../../../src/modules/files/json-file";

export class TSConfig {
    readonly #file: JSONFile;

    constructor (readonly path: string) {
        this.#file = new JSONFile(path);
    }

    async #read () {
        const content = await this.#file.read();

        if (!content.compilerOptions) content.compilerOptions = {};
        if (!content.compilerOptions.paths) content.compilerOptions.paths = {};

        return content;
    }

    async addPath (prefix: string, path: string) {
        return await this.#file.map((data) => {
            data.compilerOptions.paths[prefix] = [path];

            return data;
        });
    }
}