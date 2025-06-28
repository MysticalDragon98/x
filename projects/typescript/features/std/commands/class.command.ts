import TypescriptProject from "../../../index";
import StdFeature from "../std.feature";
import { CLIResult } from "../../../../../src/modules/cli/cli-result";

export default async function classCommand ([ module, name ]: string[], named: any, { project, feature }: { project: TypescriptProject, feature: StdFeature }) {
    await feature.addClass(module, name);

    return new CLIResult({
        success: true,
        message: `✨ Successfully created class ${name} in module ${module} in project ${project.name}!`,
        data: {
            feature: name
        }
    });
}