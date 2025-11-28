import AgsProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";

export default class ErrorsFeature extends Feature<AgsProject> {

    name () { return "errors"; }
    version () { return "1.0.0"; }

    async init () {
        
    }
}