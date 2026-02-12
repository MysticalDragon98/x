import { rmdir } from "fs/promises";
import PostmanFeature from "../postman.feature";
import { PostmanCollectionBuilder } from "./PostmanCollectionBuilder.class";
import { mkdir } from "fs/promises";
import { PostmanRoute } from "./PostmanRoute.class";

export class PostmanBuilder {


    private constructor (private feature: PostmanFeature, private builder: PostmanCollectionBuilder) {
    }

    async build () {
        const routes = await this.#fetchRoutes();
        this.feature.log(`Building documentation...`);

        await this.#cleanWorkspace();

        for (const route of routes) {
            await route.build(this.builder);
        }

        await this.builder.save(this.#subpath('collections/default.postman_collection.json'));
    }

    async #cleanWorkspace () {
        this.feature.log(`Cleaning workspace...`);
        
        this.builder.reset();
        await rmdir(this.#subpath('docs')).catch(() => {});
        await mkdir(this.#subpath('.docs'), { recursive: true });
    }

    async #fetchRoutes () {
        return await this.feature.http.endpoints()
            .then(routes => routes.map(route => new PostmanRoute(route, this.feature)))
    }

    #subpath (...parts: string[]) {
        return this.feature.project.workdirSubpath('.postman', ...parts);
    }

    static async create (feature: PostmanFeature) {
        const path = feature.project.workdirSubpath(".postman/collections/default.postman_collection.json");
        
        return new PostmanBuilder(feature, await PostmanCollectionBuilder.fromFile(path));
    }

}