import StdFeature from "../std.feature";
import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import vscodeOpen from "../../../../../src/modules/vscode/vscodeOpen";

export default async function moduleCommand ([ name ]: string[], named: any, { feature }: { feature: StdFeature }) {
    await feature.addModule(name);

    return new CLIResult({
        success: true,
        message: `✨ Successfully created module ${name}!`,
        data: {
            feature: name
        }
    });
}