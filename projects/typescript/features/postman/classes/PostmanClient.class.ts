import { PostmanCollection } from "../types/PostmanCollection.type";
import { PostmanCollectionJSON } from "../types/PostmanCollectionJSON.type";
import { PostmanWorkspace } from "../types/PostmanWorkspace.type";

type HttpMethod = "GET" | "POST" | "PUT";

export class PostmanClient {
    private readonly baseUrl = "https://api.getpostman.com";

    constructor(private readonly apiKey: string) {}

    private async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}/${path}`, {
            method,
            headers: {
                "X-Api-Key": this.apiKey,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`Postman API error: ${response.status}`);
        }

        return response.json();
    }

    get<T>(path: string) {
        return this.request<T>("GET", path);
    }

    post<T>(path: string, body: unknown) {
        return this.request<T>("POST", path, body);
    }

    put<T>(path: string, body: unknown) {
        return this.request<T>("PUT", path, body);
    }

    async workspaces() {
        const { workspaces } = await this.get<{ workspaces: PostmanWorkspace[] }>("workspaces");
        return workspaces;
    }

    async createWorkspace(name: string, type: "personal" | "team" = "personal"): Promise<PostmanWorkspace> {
        const { workspace } = await this.post<{ workspace: PostmanWorkspace }>("workspaces", {
            workspace: { name, type },
        });

        return workspace;
    }

    async collections(workspaceId: string) {
        const { collections } = await this.get<{ collections: PostmanCollection[]; }>(`collections?workspace=${workspaceId}`);

        return collections;
    }

    async createCollection(name: string, workspaceId: string) {
        const { collection } = await this.post<{ collection: PostmanCollection }>("collections", {
            collection: {
                info: {
                    name,
                    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
                },
            },
            workspace: workspaceId,
        });

        return collection;
    }

    async syncCollection(collection: PostmanCollectionJSON, workspaceId: string) {
        const collections = await this.collections(workspaceId);
        const existing = collections.find((col) => col.name === collection.info.name);

        if (!existing) {
            const { collection: created } = await this.post<{ collection: PostmanCollection }>("collections", {
                collection,
                workspace: workspaceId,
            });

            return created;
        }

        const collectionId = existing.uid || existing.id;
        if (!collectionId) {
            throw new Error(`Missing collection identifier for "${existing.name}"`);
        }

        const payloadCollection = existing.id && !collection.info._postman_id
            ? { ...collection, info: { ...collection.info, _postman_id: existing.id } }
            : collection;

        const { collection: updated } = await this.put<{ collection: PostmanCollection }>(`collections/${collectionId}`, {
            collection: payloadCollection,
        });

        return updated;
    }
}
