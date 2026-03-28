import { CLIResult } from "../modules/cli/cli-result";
import { Project } from "../modules/projects/project";

export default async function updateCommand (features: string[], named: any, { project }: { project: Project }) {
    const bump = named.major ? "major" : named.minor ? "minor" : "patch";

    for (const featureName of features) {
        const feature = await project.feature(featureName);
        const result = await feature.update({ bump });

        if (result.skipped) {
            return new CLIResult({
                success: false,
                message: `Feature ${feature.name()} has no updatePaths() defined — nothing to update.`,
                data: { feature: feature.name() }
            });
        }

        return new CLIResult({
            success: true,
            message: `✨ Updated feature ${feature.name()} scaffolding (${result.updated} files, v${result.version})`,
            data: {
                feature: feature.name(),
                filesUpdated: result.updated,
                version: result.version
            }
        });
    }
}
