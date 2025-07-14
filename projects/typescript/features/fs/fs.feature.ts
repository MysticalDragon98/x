import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";

export default class FsFeature  extends Feature<TypescriptProject> {

    name () { return "fs"; }
    version () { return "1.0.6"; }

    async init () {

    }
}