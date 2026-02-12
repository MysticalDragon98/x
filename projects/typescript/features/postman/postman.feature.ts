import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import { Shell } from "@/src/modules/shell/shell";
import { mkdir } from "fs/promises";
import { PostmanConfig } from "./classes/PostmanConfig.class";
import { parse } from "dotenv";
import { readFile } from "fs/promises";
import { PostmanClient } from "./classes/PostmanClient.class";
import { PostmanWorkspace } from "./types/PostmanWorkspace.type";
import { PostmanCollectionBuilder } from "./classes/PostmanCollectionBuilder.class";
import HttpFeature from "../http/http.feature";

export default class PostmanFeature extends Feature<TypescriptProject> {
    
    readonly http = this.inject<HttpFeature>(HttpFeature);
    #client?: PostmanClient;

    name () { return "postman"; }
    version () { return "0.0.1"; }

    async init () {
        if (!Shell.isCliAvailable('postman')) {
            this.log("Postman CLI not found. In order to use Postman features, please install the Postman CLI from https://www.postman.com/downloads/postman-cli/");   
        }

        await mkdir(this.project.workdirSubpath(".postman"), { recursive: true });
    }

    async initConfig (workspace: PostmanWorkspace) {
        await PostmanConfig.init(this.project.workdirSubpath(".postman/config.json"), workspace.id);
    }

    async initCollection (name: string) {
        const path = this.project.workdirSubpath(`.postman/collections/${name}.postman_collection.json`);
        
        await PostmanCollectionBuilder.init(path, name);
    }

    config () {
        return PostmanConfig.fromFile(this.project.workdirSubpath(".postman/config.json"));
    }

    async client () {
        if (this.#client) return this.#client;

        const envContent = await readFile(this.project.workdirSubpath(".env"));
        const env = parse(envContent.toString());

        return this.#client = new PostmanClient(env.POSTMAN_API_KEY);
    }

}