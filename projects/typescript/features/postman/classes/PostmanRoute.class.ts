import { HttpRoute } from "../../http/types/HttpRoute.type";
import PostmanFeature from "../postman.feature";
import { PostmanCollectionBuilder } from "./PostmanCollectionBuilder.class";
import { PostmanEndpoint } from "./PostmanEndpoint.class";

export class PostmanRoute {

    endpoints: PostmanEndpoint[];

    constructor (private route: HttpRoute, private feature: PostmanFeature) {
        this.endpoints = route.endpoints.map(endpoint => new PostmanEndpoint(endpoint, this.feature));
    }

    async build (builder: PostmanCollectionBuilder) {
        this.feature.log(`Building route: /${this.route.name}...`);
        await builder.addFolder(`/${this.route.name}`)

        for (const endpoint of this.endpoints) {
            await endpoint.build(builder);
        }

        
    }

}