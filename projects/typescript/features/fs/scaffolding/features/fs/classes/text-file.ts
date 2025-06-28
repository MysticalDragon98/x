import { appendFile } from "fs/promises";
import { FileHandler } from "./file-handler";

export class TextFile {
    fileHandler: FileHandler;

    constructor (readonly path: string) {
        this.fileHandler = new FileHandler(path);
    }

    async read () {
        return (await this.fileHandler.read()).toString();
    }

    async write (data: string) {
        await this.fileHandler.write(Buffer.from(data));
    }

    async append (data: string) {
        await appendFile(this.path, data);
    }

    async appendLine (data: string) {
        await this.append(`${data}\n`);
    }

    async map (callback: (data: any) => any) {
        try {
            var data = await this.read();
        } catch (exc: any) {
            data = "";
        }

        await this.write(callback(data));
    }

    static async read (path: string) {
        try {
            return await new TextFile(path).read();
        } catch (exc: any) {
            throw exc;
        }
    }

    async insertTagLine (tag: string, line: string) {
        return await this.map((content) => {
            const lines = content.split("\n");
            const newLines = [];
    
            for (const _line of lines) {
                if (_line.trim() === `//* ${tag}`) {
                    const indent = _line.match(/^\s*/)[0];
                    const replace = indent + [line, `//* ${tag}`].join(`\n${indent}`);
            
                    newLines.push(replace);
                    continue;
                }
                
                newLines.push(_line);
            }
    
            return newLines.join('\n');        
        });
    }
}