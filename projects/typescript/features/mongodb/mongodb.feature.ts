import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import ErrorsFeature from "../errors/errors.feature";
import StorageFeature from "../storage/storage.feature";
import LogsFeature from "../logs/logs.feature";
import EnvFeature from "../env/env.feature";

export default class MongoDBFeature extends Feature<TypescriptProject> {
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly storage = this.inject<StorageFeature>(StorageFeature);
    readonly logs = this.inject<LogsFeature>(LogsFeature);
    readonly errors = this.inject<ErrorsFeature>(ErrorsFeature);
    readonly env = this.inject<EnvFeature>(EnvFeature);
    
    name () { return "mongodb"; }
    version () { return "0.0.3"; }

    async init () {
        this.project.install([ "mongodb" ]);

        this.env.addEnvvar('MongoUrl', { required: true });

        await this.addInitializer(
            `import MongoDbFeature from "./features/mongodb";`,
            `MongoDbFeature.init(),`
        );
    }

    updatePaths(): string[] {
        return ["features/mongodb/**/*"];
    }
    
}
