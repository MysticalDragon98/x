import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";

export default class GoogleFeature extends Feature<TypescriptProject> {
 
    name () { return "google"; }
    version () { return "0.0.1"; }

    async init () {}
    
}