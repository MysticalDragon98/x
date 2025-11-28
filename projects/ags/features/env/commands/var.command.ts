import { $assert, CustomErrors } from "@/features/errors";
import AgsProject from "../../..";
import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import EnvFeature from "../env.feature";

const Errors = CustomErrors({
    InvalidFlag: "The variable should be either 'required' or 'optional'."
});

export default async function varCommand ([ name, flags ]: string[], named: any, { project, feature }: { project: AgsProject, feature: EnvFeature }) {
    $assert(flags === "required" || flags === "optional", Errors.InvalidFlag);
    await feature.addEnvvar(name, { required: flags === "required" });

    return new CLIResult({
        success: true,
        message: `✨ Successfully added envvar ${name} to project ${project.name}!`,
        data: {
            feature: name
        }
    });
}