import { ProjectType } from "../modules/projects/project-type";
import { CLIResult } from "../modules/cli/cli-result";

export default async function initCommand (args: string[]) {
    const projectType = new ProjectType(args[0]);
    const project = await projectType.loadProject(process.cwd());

    await project.setup();

    return CLIResult.success(`✨ Successfully initialized your ${projectType} project!`, {
        projectType: projectType.name
    });
}