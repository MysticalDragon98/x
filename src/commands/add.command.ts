import { CLIResult } from "../modules/cli/cli-result";
import { Project } from "../modules/projects/project";

export default async function addCommand (features: string[], named: any, { project }: { project: Project }) { 
    for (const featureName of features) {
        const feature = await project.feature(featureName);
        
        await feature.setup({ update: true });

        return new CLIResult({
            success: true,
            message: `✨ Successfully added feature ${feature.name()} to project ${project.name}!`,
            data: {
                feature: feature.name()
            }
        });
    }
}