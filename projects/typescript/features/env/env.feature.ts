import ErrorsFeature from "../errors/errors.feature";
import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import GeneratorFeature, { GeneratorAction } from "../generator/generator.feature";
import { TimelineFeature } from "../timeline/timeline.feature";
import { TextFile } from "../../../../src/modules/files/text-file";
import { StringUtils } from "../../../../src/modules/utils/string-utils";
import { JSONFile } from "../../../../src/modules/files/json-file";
import { join } from "path";

export default class EnvFeature extends Feature<TypescriptProject> {

    readonly #generator = this.inject(GeneratorFeature);
    readonly #errors = this.inject(ErrorsFeature);
    readonly #timeline = this.inject(<any>TimelineFeature);

    name () { return "env"; }
    version () { return "0.0.7"; }

    async init () {
        await this.project.install([ "dotenv" ]);
        
        await this.#generator.addGenerator("envvar", {
            description: "Add an environment variable",
            prompts: [
                { type: "input", name: "name", message: "What is the name of the environment variable?" },
                { type: "confirm", name: "required", message: "Is this variable required?" },
            ],
            actions: [
                GeneratorAction.append(
                    "features/env/index.ts",
                    "//* Envvars",
                    "    {{pascalCase name}}: process.env.{{upperSnakeCase name}},"
                ),
                GeneratorAction.append(
                    "features/env/index.ts",
                    "//* Checks",
                    "{{#if required}}\n$assert(typeof Environment.{{pascalCase name}} !== 'undefined', EnvErrors.EnvvarNotFound, { name: '{{name}}' });\n{{/if}}"
                )
            ]
        });
    }

    async config () {
        return new JSONFile(join(await this.project.metaPath(), "env.json"));
    }

    async addEnvvar (name: string, { required = false }: { required?: boolean } = {}) {
        const varname = StringUtils.pascalCase(name);

        name = StringUtils.upperSnakeCase(name);
        const envFile = new TextFile(this.project.workdirSubpath(".env"));
        await envFile.appendLine(`${name}=`);
        
        const envLib = new TextFile(this.workdirFeatureSubpath("index.ts"));
        await envLib.insertTagLine("Envvars", `${varname}: process.env.${name}${required ? "!" : ""},`);

        const config = await this.config();

        await config.map((data) => {
            data.envvars = data.envvars ?? {};
            data.envvars[name] = { required };

            return data;
        });

        if (required) {
            await envLib.insertTagLine("Checks", `$assert(typeof Environment.${varname} !== 'undefined', EnvErrors.EnvvarNotFound, { name: '${name}' });`);
        }
    }
}