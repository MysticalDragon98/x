import { Feature } from "../../../../src/modules/projects/feature";
import TypescriptProject from "../..";

export default class ZodFeature extends Feature<TypescriptProject> {
    
    name () { return "zod"; }
    version () { return "0.0.1"; }

    async init () {
        
    }
}