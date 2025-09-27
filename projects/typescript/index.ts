import debug from "debug";
import { JSONFile } from "../../src/modules/files/json-file";
import { Project } from "../../src/modules/projects/project";
import { Shell } from "../../src/modules/shell/shell";
import { TSConfig } from "./classes/tsconfig";

const log = debug("@projects/typescript");

export default class TypescriptProject extends Project {
    name = "typescript";

    readonly tsconfig: TSConfig;

    constructor (readonly folder: string, readonly workdir: string) {
        super(folder, workdir);

        this.tsconfig = new TSConfig(this.workdirSubpath("tsconfig.json"));
    }

    async init () {
        const cwd = this.workdirSubpath();

        log(`Initializing bun project`)
        await Shell.exec("bun init -y", { cwd });
        
        await this.installDev([
            "@types/node"
        ]);

        await this.addScripts({
            "build": "tsc",
            "dev": "bun --hot index.ts",
            "start": "bun index.ts",
        });
    }

    async addScripts (scripts: Record<string, string>) {
        const names = Object.keys(scripts);
        log(`Adding ${names.length} typescript scripts: ${names.join(", ")}`);
        const packageJson = new JSONFile(this.workdirSubpath("package.json"));

        await packageJson.map((data) => {
            data.scripts = {
                ...data.scripts,
                ...scripts
            };

            return data;
        });
    }

    async install (dependencies: string[]) {
        const cwd = this.workdirSubpath();
        log(`Installing typescript dependencies: ${dependencies.join(", ")}`);

        await Shell.exec(`bun add ${dependencies.join(" ")}`, { cwd });
    }

    async installDev (dependencies: string[]) {
        const cwd = this.workdirSubpath();
        log(`Installing typescript dev dependencies: ${dependencies.join(", ")}`);

        await Shell.exec(`bun add -D ${dependencies.join(" ")}`, { cwd });
    }

}