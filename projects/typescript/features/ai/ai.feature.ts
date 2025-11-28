import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import ErrorsFeature from "../errors/errors.feature";
import EnvFeature from "../env/env.feature";
import OpenAIFeature from "../openai/openai.feature";
import AudioFeature from "../audio/audio.feature";
import { mkdir } from "fs/promises";
import { join } from "path";
import { writeFile } from "fs/promises";
import { StringUtils } from "@/src/modules/utils/string-utils";
import { TextFile } from "@/src/modules/files/text-file";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";
import { readFile } from "fs/promises";
import { ToolCompiler } from "./classes/ToolCompiler";

export default class AIFeature extends Feature<TypescriptProject> {

    readonly #errors = this.inject(ErrorsFeature);
    readonly #env = this.inject(EnvFeature);
    readonly #openai = this.inject(OpenAIFeature);
    readonly #audio = this.inject(AudioFeature);

    name(): string { return "ai"; }
    version(): string { return "1.0.0"; }

    async init () {}

    async addLibrary (name: string) {
        const path = this.workdirFeatureSubpath("libraries", name);
        const toolsPath = this.project.workdirSubpath("src/ai/libraries/" + name);
        const index = join(path, `${name}.library.ts`);
        const aiLibraryIndex = new TextFile(this.workdirFeatureSubpath("libraries.ts"));
        const libraryVarName = StringUtils.pascalCase(name);

        await mkdir(path, { recursive: true });
        await mkdir(toolsPath, { recursive: true });

        await writeFile(index, [
            'import { Library } from "../../classes/Library";',
            "//* Imports",
            "",
            "//? ",
            `export const ${libraryVarName} = new Library({`,
            `    name: "${name}",`, 
            "    actions: [",
            "        //* Tools",
            "    ]",
            "});"
        ].join("\n"));

        await aiLibraryIndex.insertTagLine("Imports", `import { ${libraryVarName} } from "./libraries/${name}/${name}.library";`);
        await aiLibraryIndex.insertTagLine("Libraries", `${libraryVarName},`);
    }

    async addTool (lib: string, name: string) {
        const toolsPath = this.project.workdirSubpath("src/ai/libraries", lib, "tools");
        const path = join(toolsPath, `${name}.tool.ts`);

        await mkdir(toolsPath, { recursive: true });
        
        await writeFile(path, [
            "//? ",
            `export default async function ${name}Tool (): Promise<void> {`,
            "",
            "}"
        ].join("\n"));

        await vscodeOpen(path);
    }

    async compile (lib: string, name: string) {
        const filePath = this.project.workdirSubpath("src/ai/libraries", lib, "tools", `${name}.tool.ts`);
        const outputPath = this.project.workdirSubpath("src/ai/libraries", lib, "build", `${name}.toolc.ts`);
        const outputFolder = this.project.workdirSubpath("src/ai/libraries", lib, "build");
        const libraryIndexFile = new TextFile(this.workdirFeatureSubpath("libraries", lib, `${lib}.library.ts`));

        const compiler = new ToolCompiler();
        const content = await readFile(filePath, "utf-8");
        const output = await compiler.compile(name, content);

        await mkdir(outputFolder, { recursive: true });
        await writeFile(outputPath, output);

        const indexFileContent = await libraryIndexFile.read();
        const importLine = `import ${name} from "../../../../src/ai/libraries/${lib}/build/${name}.toolc";`;

        if (!indexFileContent.includes(importLine)) {
            await libraryIndexFile.insertTagLine("Imports", importLine);
            await libraryIndexFile.insertTagLine("Tools", `${name},`);
        }

        vscodeOpen(outputPath);
    }
}