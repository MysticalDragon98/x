import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import EnvFeature from "../env/env.feature";

export default class MailgunFeature extends Feature<TypescriptProject> {

    readonly #env = this.inject<EnvFeature>(EnvFeature);

    name () { return "mailgun"; }
    version () { return "0.0.1"; }

    async init () {
        await this.project.install(["handlebars"]);

        await this.#env.addEnvvar("MailgunApiKey", { required: true });
        await this.#env.addEnvvar("MailgunDomain", { required: true });
        await this.#env.addEnvvar("MailgunFrom", { required: true });
    }
}
