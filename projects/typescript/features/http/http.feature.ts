import { Feature } from "../../../../src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import ZodFeature from "../zod/zod.feature";

export default class HttpFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly zod = this.inject<ZodFeature>(ZodFeature);

    name () { return "http"; }
    version () { return "0.0.1"; }

    async init () {
        
    }
}