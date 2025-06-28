import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import EnvFeature from "../env/env.feature";
import LogsFeature from "../logs/logs.feature";
import OpenAIFeature from "../openai/openai.feature";

export default class ChromaFeature  extends Feature<TypescriptProject> {

    readonly #logs = this.inject(LogsFeature);
    readonly #openai = this.inject(OpenAIFeature);
    readonly #env = this.inject(EnvFeature);

    name () { return "chroma"; }
    version () { return "0.0.1"; }

    async init () {
        this.project.install(["chromadb"]);
        this.#env.addEnvvar("ChromaUrl", { required: true });
    }
}