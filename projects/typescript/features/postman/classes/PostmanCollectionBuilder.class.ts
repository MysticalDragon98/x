import { JSONFile } from "@/src/modules/files/json-file";
import { PostmanCollectionJSON, PostmanRequestBody } from "../types/PostmanCollectionJSON.type";
import { PostmanCollectionEndpointOptions } from "../types/PostmanCollectionEndpointOptions.type";

export class PostmanCollectionBuilder {

    collection: PostmanCollectionJSON;

    constructor (options: PostmanCollectionJSON) {
        this.collection = options;
    }

    reset () {
        this.collection.item = [];
        return this;
    }

    save (path: string) {
        const file = new JSONFile(path);
        return file.write(this.collection);
    }

    static async fromFile (path: string) {
        const file = new JSONFile(path);

        return new PostmanCollectionBuilder(await file.read());
    }

    addFolder(name: string, options?: { description?: string; parentPath?: string[]; }) {
        const folder = {
            name,
            description: options?.description,
            item: []
        };

        if (!options?.parentPath?.length) {
            this.collection.item.push(folder);
            return this;
        }

        let current: any[] = this.collection.item;

        for (const segment of options.parentPath) {
            const found = current.find((i) => "item" in i && i.name === segment);

            if (!found) {
                throw new Error(`Folder "${segment}" not found`);
            }

            current = found.item;
        }

        current.push(folder);
        return this;
    }

    addEndpoint(options: PostmanCollectionEndpointOptions) {
        const toScript = (exec?: string | string[]) =>
            exec
                ? [{
                    listen: "prerequest",
                    script: {
                        type: "text/javascript",
                        exec: Array.isArray(exec) ? exec : exec.split("\n")
                    }
                }]
                : [];

        const toTest = (exec?: string | string[]) =>
            exec
                ? [{
                    listen: "test",
                    script: {
                        type: "text/javascript",
                        exec: Array.isArray(exec) ? exec : exec.split("\n")
                    }
                }]
                : [];

        const event = [
            ...toScript(options.preRequestScript),
            ...toTest(options.testScript)
        ];

        const item = {
            name: options.name,
            description: options.description,
            event: event.length ? event : undefined,
            request: {
                method: options.method.toUpperCase(),
                header: options.headers
                    ? Object.entries(options.headers).map(([key, value]) => ({ key, value }))
                    : undefined,
                url: options.url,
                body: options.body,
                auth: options.auth
            }
        };

        if (!options.parentPath?.length) {
            this.collection.item.push(item as any);
            return this;
        }

        let current: any[] = this.collection.item;

        for (const segment of options.parentPath) {
            const folder = current.find(
                (i) => "item" in i && i.name === segment
            );

            if (!folder) {
                throw new Error(`Folder "${segment}" not found`);
            }

            current = folder.item;
        }

        current.push(item);
        return this;
    }


    static async init (path: string, name: string) {
        const file = new JSONFile(path);
        await file.write({
            info: {
                name,
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            item: []
        });

        return PostmanCollectionBuilder.fromFile(path);
    }
}