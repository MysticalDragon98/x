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

        log(`Initializing pnpm project`)
        await Shell.exec("pnpm init", { cwd });
        
        await this.installDev([
            "typescript",
            "ts-node",
            "ts-node-dev",
            "@types/node",
            "tsconfig-paths"
        ]);

        await this.addScripts({
            "build": "tsc",
            "dev": "ts-node-dev --respawn --transpile-only index.ts",
            "start": "ts-node -r tsconfig-paths/register index.ts",
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

        await Shell.exec(`pnpm add ${dependencies.join(" ")}`, { cwd });
    }

    async installDev (dependencies: string[]) {
        const cwd = this.workdirSubpath();
        log(`Installing typescript dev dependencies: ${dependencies.join(", ")}`);

        await Shell.exec(`pnpm add -D ${dependencies.join(" ")}`, { cwd });
    }

}