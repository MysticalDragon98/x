import { writeFile } from "fs/promises";
import { FsUtils } from "../../../../../src/modules/utils/fs-utils";
import { $assert, CustomErrors } from "../../errors/scaffolding/features/errors";
import StdFeature from "../std.feature";
import { StringUtils } from "../../../../../src/modules/utils/string-utils";
import debug from "debug";
import { join } from "path";

const Errors = CustomErrors({
    ModuleAlreadyExists: "The module {module} already exists.",
    EnumAlreadyExists: "The enum {enum} already exists in module {module}."
});

const log = debug("@features/std");

export default class StdModule {
    readonly #feature: StdFeature;
    readonly name: string;

    constructor (feature: StdFeature, name: string) {
        this.#feature = feature;
        this.name = name;
    }

    subpath (...paths: string[]) {
        return join(this.#feature.project.workdirSubpath("src/modules", this.name, ...paths));
    }

    async existsEnum (name: string) {
        const config = await this.#feature.config.read();

        return !!config.modules[this.name].enums[name];
    }

    async addEnum (name: string) {
        log(`Adding enum ${name} to module ${this.name}`);

        $assert(!await this.existsEnum(name), Errors.EnumAlreadyExists, { enum: name, module: this.name });

        await writeFile(this.subpath("enums", `${name}.enum.ts`), 
            `export enum ${StringUtils.pascalCase(name)} {\n` +
            "    \n" +
            "}"
        );

        await this.#feature.config.addEnum(this.name, name);
    }

    async addClass (name: string) {
        log(`Adding class ${name} to module ${this.name}`);

        $assert(!await this.existsClass(name), Errors.ClassAlreadyExists, { class: name, module: this.name });

        await writeFile(this.subpath("classes", `${name}.ts`), 
            `export class ${StringUtils.pascalCase(name)} {\n` +
            "    \n" +
            "}"
        );

        await this.#feature.config.addClass(this.name, name);
    }

    async existsClass (name: string) {
        const config = await this.#feature.config.read();

        return !!config.modules[this.name].classes[name];
    }

    static async create (feature: StdFeature, name: string) {
        log(`Creating module ${name}`);
        $assert(!await feature.config.existsModule(name), Errors.ModuleAlreadyExists, { module: name });

        await feature.config.addModule(name);
        log(`Creating module directory tree`);
        await FsUtils.createTree({
            [`src/modules/${name}`]: ["types", "classes", "tests", "enums"]
        });
        
        log(`Creating module index file`);
        await writeFile(feature.project.workdirSubpath("src/modules", name, "index.ts"),
            `export default class ${StringUtils.pascalCase(name)}Module {\n` +
            "    \n" +
            "}" 
        );

        log(`Adding module to tsconfig`);
        await feature.project.tsconfig.addPath(`@${name}/*`, "src/modules/*");
    }

    async existsType (name: string) {
        const config = await this.#feature.config.read();

        return !!config.modules[this.name].types[name];
    }

    async addType (name: string) {
        log(`Adding type ${name} to module ${this.name}`);

        $assert(!await this.existsType(name), Errors.TypeAlreadyExists, { type: name, module: this.name });

        await writeFile(this.subpath("types", `${name}.type.ts`), 
            `export type ${StringUtils.pascalCase(name)} = {\n` + 
            "\n" +
            "};"
        );

        await this.#feature.config.addType(this.name, name);
    }
}