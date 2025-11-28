import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import GoogleFeature from "../google/google.feature";
import StorageFeature from "../storage/storage.feature";
import QueueFeature from "../queue/queue.feature";

export default class GmailFeature extends Feature<TypescriptProject> {
    
    readonly #storage = this.inject(StorageFeature);
    readonly #google = this.inject(GoogleFeature);
    readonly #queue = this.inject(QueueFeature);

    name () { return "gmail"; }
    version () { return "0.0.1"; }

    async init () {}
    
}