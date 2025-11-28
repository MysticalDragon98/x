import { Feature } from "../../../../src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import EnvFeature from "../env/env.feature";

export default class MongoFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly env = this.inject<EnvFeature>(EnvFeature);

    name () { return "mongo"; }
    version () { return "1.0.0-a"; }

    async init () {
        await this.project.install(["mongoose"]);
        await this.project.installDev(["@types/mongoose"]);
        await this.env.addEnvvar("MongoUrl", { required: true });
    }
}