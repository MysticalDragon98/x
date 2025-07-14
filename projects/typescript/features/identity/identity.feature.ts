import { Crypto } from "@/features/crypto";
import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import CryptoFeature from "../crypto/crypto.feature";

export default class IdentityFeature extends Feature<TypescriptProject> {
    readonly crypto = this.inject<CryptoFeature>(CryptoFeature);

    version() { return "0.0.2"; }
    name() { return "identity"; }

    async init() {
        // No additional dependencies needed beyond crypto
        await this.project.install(["ethereumjs-util"]);
    }

}