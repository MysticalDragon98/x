import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";

export default class CryptoFeature extends Feature<TypescriptProject> {
    version() { return "0.0.1"; }
    name() { return "crypto"; }

    init () {

    }
}