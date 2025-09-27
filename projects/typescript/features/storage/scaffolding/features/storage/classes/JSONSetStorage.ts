import { readFile } from "fs/promises";
import { SetStorage } from "./SetStorage";
import { writeFile } from "fs/promises";

export class JSONSetStorage extends SetStorage {
    
    #file: string;
    #data: any;

    constructor (file: string) {
        super();
        this.#file = file;
    }

    async read () {
        try {
            this.#data = JSON.parse(await readFile(this.#file, "utf-8"));
        } catch (error) {
            this.#data = {};
        }
    }

    async write () {
        await writeFile(this.#file, JSON.stringify(this.#data));
    }

    async has (key: string) {
        await this.read();

        return key in this.#data;
    }

    async add (key: string) {
        await this.read();

        this.#data[key] = 1;

        await this.write();
    }

    async remove (key: string) {
        await this.read();

        delete this.#data[key];

        await this.write();
    }
}