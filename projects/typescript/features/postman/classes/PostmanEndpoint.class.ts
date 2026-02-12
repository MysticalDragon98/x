import { Shell } from "@/src/modules/shell/shell";
import { HttpEndpoint } from "../../http/types/HttpEndpoint.type";
import PostmanFeature from "../postman.feature";
import { PostmanCollectionBuilder } from "./PostmanCollectionBuilder.class";
import { resolve } from "path";
import { rmdir } from "fs/promises";

export class PostmanEndpoint {

    constructor (private endpoint: HttpEndpoint, private feature: PostmanFeature) {
        
    }

    async build (builder: PostmanCollectionBuilder) {
        const path = `/${this.endpoint.route}/${this.endpoint.endpoint}`;

        this.feature.log(`Building endpoint: ${path}`);

        await builder.addEndpoint({
            name: path,
            method: 'POST',
            url: `{{BASE_URL}}${path}`,
            parentPath: ['/' + this.endpoint.route],
            body: {
                mode: "raw",
                raw: JSON.stringify(await this.buildPayload(), null, 2),
                options: {
                    raw: { language: "json" }
                }
            }
        });

        await this.fetchEndpointOutputSchema();
    }

    async buildPayload () {
        return {};
    }

    async fetchEndpointOutputSchema () {
        const promptPath = resolve(__dirname, "../prompts/getEndpointOutputSchema.md");

        await Shell.exec(`codex exec "Follow the instructions inside '${promptPath}'"`);
    }

    async outputSchema (): Promise<any> {
        const endpointPath = this.feature.http.getEndpointPath(this.endpoint.route, this.endpoint.endpoint);
        try {
            return await Bun.file(this.feature.project.workdirSubpath(`.postman/docs/${endpointPath}/output-schema.json`)).json();
        } catch (error: any) {
            if (error.code === "ENOENT") {
                await this.fetchEndpointOutputSchema();
                return await this.outputSchema();
            }
            throw error;
        }

        return null;
    }

}