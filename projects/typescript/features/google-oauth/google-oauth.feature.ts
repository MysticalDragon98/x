import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import AuthFeature from "../auth/auth.feature";
import EnvFeature from "../env/env.feature";

export default class GoogleOAuthFeature extends Feature<TypescriptProject> {

    readonly auth = this.inject<AuthFeature>(AuthFeature);
    readonly env = this.inject<EnvFeature>(EnvFeature);

    name () { return "google-oauth"; }
    version () { return "1.0.0"; }

    async init () {
        await this.env.addEnvvar("GoogleClientId", { required: true });
    }

    updatePaths () {
        return [
            "features/google-oauth/**/*",
            ".claude/rules/google-oauth.rule.md"
        ]
    }
}
