import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import GoogleFeature from "../google/google.feature";

export default class AudioFeature extends Feature<TypescriptProject> {
    
    name () { return "audio"; }
    version () { return "0.0.1"; }

    async init () {}
    
}