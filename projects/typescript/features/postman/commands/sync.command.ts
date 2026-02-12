import TypescriptProject from "@/projects/typescript";
import PostmanFeature from "../postman.feature";
import { PostmanCollectionBuilder } from "../classes/PostmanCollectionBuilder.class";
import { CLIResult } from "@/src/modules/cli/cli-result";

export default async function syncCommand(args: string[], named: any, { project, feature }: { project: TypescriptProject; feature: PostmanFeature }) {
    const path = project.workdirSubpath(".postman/collections/default.postman_collection.json");
    const workspace = await feature.config();
    const collection = await PostmanCollectionBuilder.fromFile(path);
    const client = await feature.client();

    await client.syncCollection(collection.collection, workspace.id);

    return CLIResult.success(`✨ Postman collection synced to workspace "${workspace.id}"`);
}