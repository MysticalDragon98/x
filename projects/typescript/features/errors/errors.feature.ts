import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";

export default class ErrorsFeature extends Feature<TypescriptProject> {

    name () { return "errors"; }
    version () { return "0.0.1"; }

    async init () {
        
    }
}