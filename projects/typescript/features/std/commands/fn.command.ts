import TypescriptProject from "@/projects/typescript";
import StdFeature from "../std.feature";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";
import { CLIResult } from "@/src/modules/cli/cli-result";

export default async function fnCommand ([ module, name ]: string[], named: any, { project, feature }: { project: TypescriptProject, feature: StdFeature }) {
    await feature.addFunction(module, name);
    await vscodeOpen(feature.project.workdirSubpath("src/modules", module, "fn", `${name}.ts`));

    return new CLIResult({
        success: true,
        message: `✨ Successfully created function ${name} in module ${module} in project ${project.name}!`,
        data: {
            feature: name
        }
    });
}