import TypescriptProject from "../../..";
import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import EnvFeature from "../env.feature";

export default async function varCommand ([ name, flags ]: string[], named: any, { project, feature }: { project: TypescriptProject, feature: EnvFeature }) {
    await feature.addEnvvar(name, { required: flags === "required" });

    return new CLIResult({
        success: true,
        message: `✨ Successfully added envvar ${name} to project ${project.name}!`,
        data: {
            feature: name
        }
    });
}