import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";

export default class QueueFeature extends Feature<TypescriptProject> { 

    name () { return "queue"; }
    version () { return "1.0.0"; }

    async init () {
        
    }
}