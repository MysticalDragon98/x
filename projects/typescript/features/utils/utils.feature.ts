import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";

export default class UtilsFeature extends Feature<TypescriptProject> {
    
    name () { return "utils"; }
    version () { return "0.1.0"; }

    async init () {}
    
}