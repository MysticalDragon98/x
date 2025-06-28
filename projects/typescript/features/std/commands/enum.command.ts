import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import StdFeature from "../std.feature";

export default async function enumCommand ([ module, name ]: string[], named: any, { feature }: { feature: StdFeature }) {
    await feature.addEnum(module, name);

    return new CLIResult({
        success: true,
        message: `✨ Successfully created enum ${name} in module ${module}!`,
        data: {
            feature: name
        }
    });
}