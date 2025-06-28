import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import EnvFeature from "../env/env.feature";

export default class LogsFeature extends Feature<TypescriptProject> {

    readonly #env = this.inject<EnvFeature>(EnvFeature);

    name () { return "logs"; }
    version () { return "0.0.1"; }

    async init () {
        await this.project.install(["debug", "chalk@4"]);
        await this.project.installDev(["@types/debug"]);

        await this.#env.addEnvvar("DebugLevel", { required: false });
    }
}