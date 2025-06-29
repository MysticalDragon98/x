import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";

export default class CryptoFeature extends Feature<TypescriptProject> {
    version() { return "0.0.2"; }
    name() { return "crypto"; }

    async init () {
        await this.project.install(["ethereumjs-util"]);
    }
}