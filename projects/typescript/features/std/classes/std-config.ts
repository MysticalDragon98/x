import debug from "debug";
import { JSONFile } from "../../../../../src/modules/files/json-file";
const log = debug("@features/std");

export type StdConfigData = {
    modules: Record<string, {
        classes: Record<string, {

        }>,
        enums: Record<string, {

        }>,
        types: Record<string, {
        }>,

        functions: Record<string, { 

        }>
    }>
};

export class StdConfig {
    readonly #file: JSONFile;

    constructor (readonly path: string) {
        this.#file = new JSONFile(path);
    }
    
    async read () {
        const content = await this.#file.read();

        if (!content.modules) content.modules = {};

        for (const module in content.modules) {
            if (!content.modules[module].classes) content.modules[module].classes = {};
            if (!content.modules[module].enums) content.modules[module].enums = {};
            if (!content.modules[module].types) content.modules[module].types = {};
            if (!content.modules[module].functions) content.modules[module].functions = {};
        }

        return content;
    }

    async existsModule (module: string) {
        const content = await this.read();

        return !!content.modules[module];
    }

    async addModule (module: string) {
        log(`Adding module ${module} to the std config`);
        const content = await this.read();

        content.modules[module] = {
            classes: {},
            enums: {}
        };

        await this.#file.write(content);
    }

    async addEnum (module: string, name: string) {
        log(`Adding enum ${name} to module ${module} to the std config`);
        const content = await this.read();

        content.modules[module].enums[name] = {};

        await this.#file.write(content);
    }

    async addClass (module: string, name: string) {
        log(`Adding class ${name} to module ${module} to the std config`);
        const content = await this.read();

        content.modules[module].classes[name] = {};

        await this.#file.write(content);
    }

    async addType (module: string, name: string) {
        log(`Adding type ${name} to module ${module} to the std config`);
        const content = await this.read();

        content.modules[module].types[name] = {};

        await this.#file.write(content);
    }

    async addFunction (module: string, name: string) {
        log(`Adding function ${name} to module ${module} to the std config`);
        const content = await this.read();

        content.modules[module].functions[name] = {};

        await this.#file.write(content);
    }

}