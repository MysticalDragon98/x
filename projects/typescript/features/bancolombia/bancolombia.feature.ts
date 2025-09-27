import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import GmailFeature from "../gmail/gmail.feature";

export default class BancolombiaFeature extends Feature<TypescriptProject> {
    
    readonly #gmail = this.inject(GmailFeature);

    name () { return "bancolombia"; }
    version () { return "0.0.1"; }

    async init () {}
    
}