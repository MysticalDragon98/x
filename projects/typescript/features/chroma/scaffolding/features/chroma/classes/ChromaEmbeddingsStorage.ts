import { RelativeEmbeddings } from "@features/openai/classes/RelativeEmbeddings";
import { EmbeddingsStorage } from "@features/openai/classes/EmbeddingsStorage";
import { Collection, IncludeEnum } from "chromadb";

export class ChromaEmbeddingsStorage extends EmbeddingsStorage {

    readonly #collection: Collection;

    constructor (collection: Collection) {
        super();

        this.#collection = collection;
    }

    async add (options: { id: string, embeddings: number[], document: string }) {
        const { id, embeddings, document } = options;
        return await this.#collection.add({
            ids: [id],
            documents: [document],
            embeddings: [embeddings]
        });
    }

    async get (id: string) {
        const element = await this.#collection.get({
            ids: [id],
            include: [IncludeEnum.Embeddings, IncludeEnum.Documents, IncludeEnum.Distances, IncludeEnum.Metadatas]
        });

        if (!element.embeddings) {
            return null;
        }

        return element?.ids[0] ? {
            id: element.ids[0]!,
            embeddings: element.embeddings![0], 
            document: element.documents[0]!
        } : null;
    }

    async find (embeddings: number[], limit: number, { distanceThreshold }: { distanceThreshold?: { max?: number, min?: number } } = {}) {
        const search = await this.#collection.query({
            queryEmbeddings: [embeddings],
            nResults: limit,
            include: [IncludeEnum.Embeddings, IncludeEnum.Documents, IncludeEnum.Distances, IncludeEnum.Metadatas]
        });

        const results = search.ids[0]?.map((id, index) => new RelativeEmbeddings(
            id,
            search.embeddings![0][index],
            search.documents[0][index]!,
            search.distances![0][index]
        ));

        return results;
    }
}