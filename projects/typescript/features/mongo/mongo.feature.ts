import { Feature } from "../../../../src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";

export default class MongoFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);
    
    name () { return "mongo"; }
    version () { return "0.0.1"; }

    async init () {
        await this.project.install(["mongoose"]);
        await this.project.installDev(["@types/mongoose"]);
    }
}