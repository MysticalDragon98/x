import { JSONFile } from "@/features/fs/classes/json-file";
import { PostmanWorkspace } from "../types/PostmanWorkspace.type";
import { readFileSync } from "fs";

type Config = {
    schemaVersion: "1";
    workspace: {
        id: string;
    }

    entities: {
        collections: string[];
        environments: string[];
    }
}

export class PostmanConfig {

    config: Config;

    constructor (config: Config) {
        this.config = config;
    }

    get id () {
        return this.config.workspace.id;
    }

    get name () {
        return this.config.workspace.id;
    }

    static async fromFile (path: string) {
        const content = JSON.parse(readFileSync(path, "utf-8"));
        return new PostmanConfig(content);
    }

    static async init (path: string, workspaceId: string) {
        const file = new JSONFile(path);

        await file.write(<Config>{
            schemaVersion: "1",
            workspace: {
                id: workspaceId
            },
            entities: {
                collections: [],
                environments: []
            }
        });

        return new PostmanConfig(await file.read());
    }

}