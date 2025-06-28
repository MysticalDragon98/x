import { readFile, writeFile } from "fs/promises";
import { FileHandler } from "./file-handler";

export class JSONFile extends FileHandler {
    constructor (readonly path: string) {
        super(path);
    }

    async read () {
        const content = await super.read();
        
        return JSON.parse(content.toString());
    }

    async write (data: any) {
        await super.write(JSON.stringify(data, null, 4));
    }

    async map (callback: (data: any) => any) {
        try {
            var data = await this.read();
        } catch (exc: any) {
            if (exc.code === "ENOENT") {
                data = {};
            } else {
                throw exc;
            }
        }
        
        await this.write(callback(data));
    }

    static async read<T> (path: string, defaultValue?: any): Promise<T> {
        try {
            return await new JSONFile(path).read();
        } catch (exc: any) {
            if (defaultValue !== undefined) {
                return defaultValue as T;
            }

            throw exc;
        }
    }
    
}