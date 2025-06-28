import { readFile, writeFile } from "fs/promises";

export class FileHandler {

    constructor (readonly path: string) {}

    async read () {
        return await readFile(this.path);
    }

    async write (data: any) {
        await writeFile(this.path, data);
    }

    async map (callback: (data: any) => any) {
        try {
            var data = await this.read();
        } catch (exc: any) {
            data = Buffer.from([]);
        }
        
        await this.write(callback(data));
    }

    static async read (path: string) {
        try {
            return await new FileHandler(path).read();
        } catch (exc: any) {
            throw exc;
        }
    }
}