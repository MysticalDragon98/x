import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import StdFeature from "../std/std.feature";
import ErrorsFeature from "../errors/errors.feature";
import StorageFeature from "../storage/storage.feature";

export default class InspectorFeature extends Feature<TypescriptProject> {
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly errors = this.inject<ErrorsFeature>(ErrorsFeature);
    readonly storage = this.inject<StorageFeature>(StorageFeature);

    name () { return "inspector"; }
    version () { return "1.0.0"; }

    async init () {
        await this.addInitializer(
            `import { Inspector } from "@features/inspector";`,
            `Inspector.init(),`
        );
    }

    updatePaths (): string[] {
        return ["features/inspector/**/*"];
    }
}
