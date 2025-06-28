import { TimelineFeature } from "../timeline/timeline.feature";
import { Feature } from "../../../../src/modules/projects/feature";
import { JSONFile } from "../../../../src/modules/files/json-file";
import { mkdir, writeFile } from "fs/promises";
import GeneratorFeature, { GeneratorAction } from "../generator/generator.feature";
import TypescriptProject from "../..";
import { StringUtils } from "../../../../src/modules/utils/string-utils";
import { StdConfig } from "./classes/std-config";
import debug from "debug";
import StdModule from "./classes/std-module";
import { join } from "path";

const log = debug("@features/std");

export default class StdFeature extends Feature<TypescriptProject> {
    readonly #generator = this.inject<GeneratorFeature>(GeneratorFeature);
    readonly #timeline = this.inject<TimelineFeature>(TimelineFeature);
    readonly config = new StdConfig(this.project.workdirSubpath(".meta", "std.json"));

    name () { return "std"; }
    version () { return "0.0.3"; }

    async init () {
        this.#timeline.add("Installed std folder structure feature");
        const tsconfig = this.project.workdirSubpath("tsconfig.json");

        await new JSONFile(tsconfig).map((data) => {
            data.compilerOptions.paths["@modules/*"] = ["src/modules/*"];

            return data;
        });

        await mkdir(this.project.workdirSubpath("src/modules"), { recursive: true });

        this.#generator.addGenerator("std:module", {
            description: "Creates a new module",
            prompts: [
                { type: "input", name: "name", message: "What is the name of the module?" }
            ],
            actions: [
                GeneratorAction.create("src/modules/{{pascalCase name}}/index.ts")
            ]
        });

        await writeFile(join(await this.project.metaPath(), "std.json"), JSON.stringify({
            modules: {}
        }));
    }

    async addModule (name: string) {
        await StdModule.create(this, name);
    }

    module (name: string) {
        return new StdModule(this, name);
    }

    async addClass (module: string, name: string) {
        await this.module(module).addClass(name);
    }

    async addEnum (moduleName: string, name: string) {
        const module = this.module(moduleName);

        await module.addEnum(name);
    }

    async addType (moduleName: string, name: string) {
        const module = this.module(moduleName);

        await module.addType(name);
    }
}