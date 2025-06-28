import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import OpenAIFeature from "../openai.feature";

export default async function mindsetCommand ([ name ]: string[], named: any, { feature }: { feature: OpenAIFeature }) {
    await feature.addMindset(name);

    return new CLIResult({
        success: true,
        message: `✨ Successfully created mindset ${name}!`,
        data: {
            mindset: name
        }
    });
}