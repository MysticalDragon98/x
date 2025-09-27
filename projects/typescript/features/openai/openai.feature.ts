import { writeFile } from "fs/promises";
import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import CryptoFeature from "../crypto/crypto.feature";
import EnvFeature from "../env/env.feature";
import LogsFeature from "../logs/logs.feature";
import { StringUtils } from "../../../../src/modules/utils/string-utils";

export default class OpenAIFeature extends Feature<TypescriptProject> {

    readonly #logs = this.inject(LogsFeature);
    readonly #env = this.inject(EnvFeature);
    readonly #crypto = this.inject(CryptoFeature);

    name () { return "openai"; }
    version () { return "0.0.4"; }

    async init () {
        await this.project.install(["openai"]);
        await this.#env.addEnvvar("OpenAiKey", { required: true });
    }

    async addMindset (name: string) {
        await this.#logs.log(`Adding mindset ${name}`);

        await writeFile(this.project.workdirSubpath("src/openai/mindsets", `${name}.mindset.ts`),
            `import { Mindset } from "@features/openai/classes/mindset";\n` +
            `import { PromptModel } from "@features/openai/enums/PromptModel.enum";\n` +
            "\n" +
            `export const ${StringUtils.pascalCase(name)}Mindset = new Mindset({\n` +
            "    model: PromptModel.Default,\n" +
            "    intent: ''\n" + 
            "});"
        );
    }
}