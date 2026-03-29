import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import ErrorsFeature from "../errors/errors.feature";

export default class AuthFeature extends Feature<TypescriptProject> {

    readonly errors = this.inject<ErrorsFeature>(ErrorsFeature);

    name () { return "auth"; }
    version () { return "1.0.0"; }

    async init () {

    }
}
