import RustProject from "@/projects/rust";
import CliFeature from "../cli.feature";
import { CLIResult } from "@/src/modules/cli/cli-result";

export default async function commandCommand([commandName]: [string], named: any, { project, feature }: { project: RustProject, feature: CliFeature }): Promise<CLIResult> {
    if (!commandName) return CLIResult.error({
        MissingArguments: "The commandName argument is required"
    });

    await feature.createCommand(commandName);

    return CLIResult.success(`Successfully created command ${commandName}`, {
        commandName
    });
}