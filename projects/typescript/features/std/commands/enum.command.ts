import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import vscodeOpen from "../../../../../src/modules/vscode/vscodeOpen";
import StdFeature from "../std.feature";

export default async function enumCommand ([ module, name ]: string[], named: any, { feature }: { feature: StdFeature }) {
    await feature.addEnum(module, name);

    await vscodeOpen(feature.project.workdirSubpath("src/modules", module, "enums", `${name}.enum.ts`));

    return new CLIResult({
        success: true,
        message: `✨ Successfully created enum ${name} in module ${module}!`,
        data: {
            feature: name
        }
    });
}