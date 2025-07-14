import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { FileHandler } from "./file-handler";
import { JSONFile } from "./json-file";
import { TextFile } from "./text-file";

export class Folder {
    constructor (public path: string) {}

    async readdir () {
        return await readdir(this.path);
    }

    async files () {
        return await readdir(this.path, { withFileTypes: true })
            .then(files =>
                files.filter(file => !file.isDirectory())
                    .map(file => file.name)
                    .map(name => this.file(name))
            );
    }

    async directories () {
        return await readdir(this.path, { withFileTypes: true })
            .then(files =>
                files.filter(file => file.isDirectory())
                    .map(file => file.name)
                    .map(name => this.subfolder(name))
            );
    }

    subpath (file: string) {
        return join(this.path, file);
    }

    subfolder (path: string) {
        return new Folder(this.subpath(path));
    }

    resolve (file: string) {
        return resolve(this.path, file);
    }

    file (file: string) {
        return new FileHandler(this.subpath(file));
    }

    jsonFile (file: string) {
        return new JSONFile(this.subpath(file));
    }

    textFile (file: string) {
        return new TextFile(this.subpath(file));
    }

    async exists (file: string) {
        try {
            await stat(this.resolve(file));

            return true;
        } catch (err) {
            return false;
        }
    }

    async mkdir (path?: string) {
        await mkdir(this.subpath(path ?? ""), { recursive: true });
    }

    async ensureDir (path: string) {
        if (!(await this.exists(path))) {
            await this.mkdir(path);
        }

        return this.subpath(path);
    }
    
}