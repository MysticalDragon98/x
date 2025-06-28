import { Feature } from "../../../../src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import OpenAIFeature from "../openai/openai.feature";

export default class ZodFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly openai = this.inject<OpenAIFeature>(OpenAIFeature);

    name () { return "zod"; }
    version () { return "0.0.1"; }

    async init () {
        await this.project.install(["zod"])
    }
    
}