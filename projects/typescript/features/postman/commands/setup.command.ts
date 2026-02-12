import TypescriptProject from "@/projects/typescript";
import PostmanFeature from "../postman.feature";
import { CLIResult } from "@/src/modules/cli/cli-result";
import Enquirer from "enquirer";

export default async function setupCommand(args: string[], named: any, { project, feature }: { project: TypescriptProject; feature: PostmanFeature }) {    
    const workspace = await initWorkspace(feature);
    const collection = await initCollection(feature, workspace.id);

    return CLIResult.success(`🚀 Postman workspace "${workspace.name}" is now linked to this project.`);
}

async function initWorkspace (feature: PostmanFeature) {const linkOrCreate: { action: string } = await Enquirer.prompt({
        type: "select",
        name: "action",
        message: "Do you want to link an existing Postman workspace or create a new one?",
        choices: [
            { name: "link", message: "Link existing workspace" },
            { name: "create", message: "Create new workspace" }
        ]
    });

    const workspace = linkOrCreate.action === "create"?
        await createWorkspace(feature) :
        await linkWorkspace(feature);

    await feature.initConfig(workspace);
    return workspace;
}

async function createWorkspace (feature: PostmanFeature) {
    const { name } = await Enquirer.prompt({
        type: "input",
        name: "name",
        message: "Enter a name for the new Postman workspace:"
    }) as { name: string };

    const { type } = await Enquirer.prompt({
        type: "select",
        name: "type",
        message: "Select the type of workspace:",
        choices: [
            { name: "personal", message: "Personal" },
            { name: "team", message: "Team" }
        ]
    }) as { type: "personal" | "team" };
    
    const client = await feature.client();
    const response = await client.createWorkspace(name, type);

    return response;
}

async function linkWorkspace (feature: PostmanFeature) {
    const client = await feature.client();
    const workspaces = await client.workspaces();
    const {workspace}: { workspace: string } = await Enquirer.prompt({
        type: "select",
        name: "workspace",
        message: "Select a Postman workspace to link with this project:",
        choices: workspaces.map(ws => ({ name: ws.id, message: ws.name }))
    });

    const selectedWorkspace = workspaces.find(ws => ws.id === workspace)!;
    return selectedWorkspace;
}

async function initCollection (feature: PostmanFeature, workspaceId: string) {
    const newOrLink: { action: string } = await Enquirer.prompt({
        type: "select",
        name: "action",
        message: "Do you want to link an existing Postman collection or create a new one?",
        choices: [
            { name: "link", message: "Link existing collection" },
            { name: "create", message: "Create new collection" }
        ]
    });

    const collection = newOrLink.action === "create"?
        await createCollection(feature, workspaceId) :
        await linkCollection(feature, workspaceId);

    await feature.initCollection("default");
    return collection;
}

async function createCollection (feature: PostmanFeature, workspaceId: string) {
    const { name } = await Enquirer.prompt({
        type: "input",
        name: "name",
        message: "Enter a name for the new Postman collection:"
    }) as { name: string };

    return name;
}

async function linkCollection (feature: PostmanFeature, workspaceId: string) {
    const client = await feature.client();
    const collections = await client.collections(workspaceId);
    const {collection}: { collection: string } = await Enquirer.prompt({
        type: "select",
        name: "collection",
        message: "Select a Postman collection to link with this project:",
        choices: collections.map(col => ({ name: col.id, message: col.name }))
    });

    const selectedCollection = collections.find(col => col.id === collection)!;
    
    return selectedCollection.name;
}