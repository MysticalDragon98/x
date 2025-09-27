import { PlopGeneratorConfig } from "node-plop";
import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import { writeFile } from "fs/promises";
import { Shell } from "../../../../src/modules/shell/shell";

export default class GeneratorFeature extends Feature<TypescriptProject> {

    constructor (project: TypescriptProject) {
        super(project);
    }

    name () { return "generator"; }
    version () { return "0.0.1"; }

    async init () {
        await this.project.installDev(["plop"]);
        await this.project.addScripts({
            "g": "plop --plopfile features/generator/plopfile.js --cwd $(pwd)"
        });
    }

    async addGenerator (name: string, config: PlopGeneratorConfig) {
        await writeFile(this.workdirFeatureSubpath("generators", `${name}.generator.js`), `module.exports = ${JSON.stringify(config, null, 4)}`);
    }

    async generate (name: string, args: string[] = []) {
        return await Shell.exec(`bun g ${name} ${args.join(" ")}`);
    }

}

export const GeneratorAction = {
    append (file: string, pattern: string, template: string) {
        return {
            type: "append",
            path: `../../${file}`,
            pattern: pattern,
            template: template
        };
    },

    create (file: string) {
        return {
            type: "add",
            path: `../../${file}`,
            template: ""
        }
    }
}