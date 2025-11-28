import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import ErrorsFeature from "../errors/errors.feature";

export default class AudioFeature extends Feature<TypescriptProject> {
    
    readonly #errors = this.inject(ErrorsFeature);

    name () { return "audio"; }
    version () { return "1.0.0"; }

    async init () {
        this.project.install([
            "rxjs"
        ])
    }
    
}