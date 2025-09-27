import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";

export default class StorageFeature extends Feature<TypescriptProject> {
    
    name () { return "storage"; }
    version () { return "0.0.1"; }

    async init () {}
    
}