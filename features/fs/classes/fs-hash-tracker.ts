import { FileHandler } from "./file-handler";
import { JSONFile } from "./json-file";

export class FSHashTracker {

    readonly #store: JSONFile;

    constructor (storePath: string) {
        this.#store = new JSONFile(storePath);
    }

    async updateHash (path: string) {
        const hash = await new FileHandler(path).hash();
        await this.#store.map(hashes => ({
            ...hashes,
            [path]: hash
        }));
    }

    async currentHash (path: string) {
        const hash = await this.#store.read({});

        return hash[path];
    }

    async changed (path: string, currentHash: string) {
        const hash = await this.currentHash(path);

        return hash !== currentHash;
    }
    
    async fileChanged (file: FileHandler) {
        return await this.changed(file.path, await file.hash());
    }

}